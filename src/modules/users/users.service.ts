import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
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

    async updateBrandId(userId: string, brandId: number): Promise<void> {
        await this.usersRepository.update({ id: userId }, { brandId });
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
        brandId?: number,
    ): Promise<User | null> {
        const existingUser = await this.usersRepository.findOne({
            where: { email },
            select: ['id'],
        });

        if (existingUser) {
            return null;
        }

        if (role === Role.ADMIN && brandId) {
            throw new BadRequestException('Admin cannot have brandId');
        }

        if (role === Role.BRAND && brandId) {
            const brandExists = await this.usersRepository.query(
                `SELECT 1 FROM brands WHERE id = $1 LIMIT 1`,
                [brandId],
            );
            if (!brandExists || brandExists.length === 0) {
                throw new NotFoundException(`Brand with ID ${brandId} not found`);
            }
        }

        const hashedPassword = await this.hashPassword(password);

        const user = this.usersRepository.create({
            email,
            password: hashedPassword,
            role,
            brandId: role === Role.BRAND ? brandId : null,
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
