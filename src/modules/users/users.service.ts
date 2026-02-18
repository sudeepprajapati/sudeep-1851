import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    private readonly SALT_ROUNDS = 12;

    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }

    async comparePasswords(
        plainPassword: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { email },
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { id },
        });
    }

    async createUserWithRole(
        email: string,
        password: string,
        role: Role,
    ): Promise<User | null> {
        const existingUser = await this.usersRepository.findOne({
            where: { email },
            select: ['id'],
        });

        if (existingUser) {
            return null;
        }

        const hashedPassword = await this.hashPassword(password);

        const user = this.usersRepository.create({
            email,
            password: hashedPassword,
            role,
        });

        try {
            await this.usersRepository.save(user);
            return user;
        } catch (error: any) {
            if (error?.code === '23505') {
                this.logger.debug(
                    `User with email ${email} already exists (unique constraint).`,
                );
                return null;
            }

            this.logger.error(
                `Critical DB error while creating user with role ${role}: ${error?.message || String(error)}`,
                error instanceof Error ? error.stack : '',
            );

            throw new InternalServerErrorException(
                'Database error during user creation',
            );
        }
    }
}
