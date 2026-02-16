import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../../common/enums/role.enum';

interface JwtPayload {
    sub: string;
    role: Role;
}

@Injectable()
export class AuthService {
    private readonly SALT_ROUNDS = 12;

    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async signup(signupDto: SignupDto) {
        const { email, password } = signupDto;

        const existingUser = await this.usersRepository.findOne({
            where: { email },
            select: ['id'],
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

        const user = this.usersRepository.create({
            email,
            password: hashedPassword,
            role: Role.USER,
        });

        try {
            await this.usersRepository.save(user);
        } catch {
            throw new InternalServerErrorException('User creation failed');
        }

        return {
            accessToken: this.generateAccessToken(user),
            user: this.excludePassword(user),
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.usersRepository.findOne({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return {
            accessToken: this.generateAccessToken(user),
            user: this.excludePassword(user),
        };
    }

    private generateAccessToken(user: User): string {
        const payload: JwtPayload = {
            sub: user.id,
            role: user.role,
        };

        return this.jwtService.sign(payload);
    }

    private excludePassword(user: User) {
        const { password, ...safeUser } = user;
        return safeUser;
    }
}
