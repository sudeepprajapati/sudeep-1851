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
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    private readonly SALT_ROUNDS = 12;

    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
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

            const brandExists = await this.usersRepository.query(
                `SELECT 1 FROM brands WHERE id = $1 LIMIT 1`,
                [brandId],
            );

            if (!brandExists || brandExists.length === 0) {
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

        return await this.usersRepository.manager.transaction(
            async (transactionalEntityManager) => {
                const hashedPassword = await this.hashPassword(password);

                const user = transactionalEntityManager.create(User, {
                    email,
                    password: hashedPassword,
                    role,
                    brandId: role === Role.BRAND ? brandId : null,
                });

                const savedUser = await transactionalEntityManager.save(user);

                if (role === Role.BRAND) {
                    await this.mailService.sendBrandCredentials(
                        email,
                        email,
                        password,
                    );
                }

                return savedUser;
            },
        );
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
