import {
    Injectable,
    BadRequestException,
    NotFoundException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from '../brands/dto/create-brand.dto';
import { UpdateBrandDto } from '../brands/dto/update-brand.dto';
import { User } from '../users/entities/user.entity';
import { BrandResponseDto } from './dto/brand-response.dto';
import { Role } from '../../common/enums/role.enum';
import { BrandStatus } from 'src/common/enums/brand-status.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class BrandService {
    private readonly logger = new Logger(BrandService.name);

    constructor(
        @InjectRepository(Brand)
        private brandRepo: Repository<Brand>,
        private readonly usersService: UsersService,
    ) { }

    async create(dto: CreateBrandDto, admin: User): Promise<BrandResponseDto> {
        if (!admin || admin.role !== Role.ADMIN) {
            throw new ForbiddenException('Only ADMIN users can create brands');
        }

        const existingBrand = await this.brandRepo.findOne({
            where: { name: dto.name },
        });

        if (existingBrand) {
            throw new BadRequestException(
                `Brand with name '${dto.name}' already exists`,
            );
        }

        const brand = this.brandRepo.create({
            ...dto,
            createdBy: admin,
            status: BrandStatus.DISAPPROVED,
        });

        const saved = await this.brandRepo.save(brand);
        return this.mapToResponse(saved);
    }

    async findAll(): Promise<BrandResponseDto[]> {
        const brands = await this.brandRepo.find({
            relations: ['createdBy'],
        });

        return brands.map((brand) => this.mapToResponse(brand));
    }

    async findOne(id: number): Promise<BrandResponseDto> {
        const brand = await this.brandRepo.findOne({
            where: { id },
            relations: ['createdBy'],
        });

        if (!brand) {
            throw new NotFoundException(`Brand with ID ${id} not found`);
        }

        return this.mapToResponse(brand);
    }

    async update(
        id: number,
        dto: UpdateBrandDto,
        user: User,
    ): Promise<any> {
        const brand = await this.brandRepo.findOne({
            where: { id },
            relations: ['createdBy'],
        });

        if (!brand) {
            throw new NotFoundException(`Brand with ID ${id} not found`);
        }

        // Access Control
        if (user.role === Role.ADMIN) {
            // allowed
        } else if (user.role === Role.BRAND) {
            if (!user.brandId || user.brandId !== id) {
                throw new ForbiddenException(
                    'You can only update your own brand',
                );
            }
        } else {
            throw new ForbiddenException('Access denied');
        }

        const responseData: Record<string, any> = {};
        let passwordUpdated = false;

        // -------------------
        // Update Brand Fields
        // -------------------
        if (dto.name !== undefined) {
            brand.name = dto.name;
            responseData.name = dto.name;
        }

        if (dto.description !== undefined) {
            brand.description = dto.description;
            responseData.description = dto.description;
        }

        if (dto.logoUrl !== undefined) {
            brand.logoUrl = dto.logoUrl;
            responseData.logoUrl = dto.logoUrl;
        }

        if (Object.keys(responseData).length > 0) {
            await this.brandRepo.save(brand);
        }

        // -------------------
        // Update User Fields
        if (dto.email || dto.password) {
            const brandUser =
                await this.usersService.findBrandUserByBrandId(id);

            if (!brandUser) {
                throw new NotFoundException(
                    'Brand user associated with this brand not found',
                );
            }

            if (dto.email) {
                const existingUser =
                    await this.usersService.findByEmail(dto.email);

                if (existingUser && existingUser.id !== brandUser.id) {
                    throw new BadRequestException(
                        'Email already in use by another user',
                    );
                }

                brandUser.email = dto.email;
                responseData.email = dto.email;
            }

            if (dto.password) {
                brandUser.password =
                    await this.usersService.hashPassword(dto.password);
                passwordUpdated = true;
            }

            await this.usersService.saveUser(brandUser);
        }

        if (
            Object.keys(responseData).length === 0 &&
            !passwordUpdated
        ) {
            throw new BadRequestException(
                'No valid fields provided for update',
            );
        }

        if (passwordUpdated && Object.keys(responseData).length === 0) {
            return {
                success: true,
                message: 'Password updated successfully',
            };
        }

        if (passwordUpdated) {
            return {
                success: true,
                message: 'Brand and credentials updated successfully',
                data: responseData,
            };
        }

        return {
            success: true,
            message: 'Brand updated successfully',
            data: responseData,
        };
    }

    async updateStatus(
        id: number,
        status: BrandStatus,
    ): Promise<BrandResponseDto> {
        const brand = await this.brandRepo.findOne({
            where: { id },
            relations: ['createdBy'],
        });

        if (!brand) {
            throw new NotFoundException(`Brand with ID ${id} not found`);
        }

        if (brand.status === status) {
            throw new BadRequestException(`Brand is already ${status}`);
        }

        brand.status = status;

        const updated = await this.brandRepo.save(brand);

        return this.mapToResponse(updated);
    }

    async delete(id: number) {
        const result = await this.brandRepo.delete(id);

        if (!result.affected) {
            throw new NotFoundException(`Brand with ID ${id} not found`);
        }

        return { message: 'Brand deleted successfully' };
    }

    private mapToResponse(brand: Brand): BrandResponseDto {
        return {
            id: brand.id,
            name: brand.name,
            description: brand.description,
            logoUrl: brand.logoUrl,
            status: brand.status,
            createdAt: brand.createdAt,
            updatedAt: brand.updatedAt,
            createdBy: brand.createdBy
                ? {
                    id: brand.createdBy.id,
                    email: brand.createdBy.email,
                }
                : null,
        };
    }
}