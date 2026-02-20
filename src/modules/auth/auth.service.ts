import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    Logger,
    InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Brand } from '../brands/entities/brand.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../../common/enums/role.enum';

interface JwtPayload {
    sub: string;
    role: Role;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @InjectRepository(Brand)
        private readonly brandRepository: Repository<Brand>,
    ) { }

    async signup(signupDto: SignupDto) {
        const { email, password } = signupDto;

        const existingUser = await this.usersService.findByEmail(email);

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const user = await this.usersService.createUserWithRole(
            email,
            password,
            Role.BRAND,
            undefined,
            false,
        );

        if (!user) {
            throw new ConflictException('Email already exists');
        }

        return {
            accessToken: this.generateAccessToken(user),
            user: this.excludePassword(user),
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.usersService.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordMatches = await this.usersService.comparePasswords(
            password,
            user.password,
        );

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

