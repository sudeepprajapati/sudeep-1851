import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import { MailService } from '../mail/mail.service';
import { Brand } from '../brands/entities/brand.entity';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    private readonly SALT_ROUNDS = 12;

    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Brand)
        private readonly brandRepository: Repository<Brand>,
        private readonly mailService: MailService,
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
        requireBrandAssociation = false,
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

        if (role === Role.BRAND && requireBrandAssociation) {
            if (!brandId) {
                throw new BadRequestException(
                    'Brand user must be associated with a valid brandId',
                );
            }

            const brandExists = await this.brandRepository.findOne({
                where: { id: brandId },
                select: ['id'],
            });

            if (!brandExists) {
                throw new NotFoundException(
                    `Brand with ID ${brandId} not found`,
                );
            }

            const existingBrandUser = await this.usersRepository.findOne({
                where: {
                    brandId,
                    role: Role.BRAND,
                },
                select: ['id'],
            });

            if (existingBrandUser) {
                throw new BadRequestException(
                    'A user already exists for this brand',
                );
            }
        }

        const savedUser = await this.usersRepository.manager.transaction(
            async (transactionalEntityManager) => {
                const hashedPassword = await this.hashPassword(password);

                const user = transactionalEntityManager.create(User, {
                    email,
                    password: hashedPassword,
                    role,
                    brandId: role === Role.BRAND ? brandId : null,
                });

                return transactionalEntityManager.save(user);
            },
        );

        if (role === Role.BRAND || role === Role.AUTHOR) {
            try {
                await this.mailService.sendUserCredentials(
                    email,
                    email,
                    password,
                    role,
                );
            } catch (error) {
                this.logger.error(
                    `User created but email failed for ${email}`,
                );
            }
        }

        return savedUser;
    }

    async findBrandUserByBrandId(brandId: number): Promise<User | null> {
        return this.usersRepository.findOne({
            where: {
                brandId,
                role: Role.BRAND,
            },
        });
    }

    async saveUser(user: User): Promise<User> {
        return this.usersRepository.save(user);
    }
}
