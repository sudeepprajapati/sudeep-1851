import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from '../brands/dto/create-brand.dto';
import { UpdateBrandDto } from '../brands/dto/update-brand.dto';
import { User } from '../users/entities/user.entity';
import { BrandResponseDto } from './dto/brand-response.dto';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class BrandService {
    private readonly logger = new Logger(BrandService.name);

    constructor(
        @InjectRepository(Brand)
        private brandRepo: Repository<Brand>,
    ) { }

    async create(dto: CreateBrandDto, admin: User): Promise<BrandResponseDto> {
        if (!admin || admin.role !== Role.ADMIN) {
            throw new ForbiddenException('Only ADMIN users can create brands');
        }

        const brand = this.brandRepo.create({
            ...dto,
            createdBy: admin,
        });
        const saved = await this.brandRepo.save(brand);

        return {
            id: saved.id,
            name: saved.name,
            description: saved.description,
            logoUrl: saved.logoUrl,
            createdAt: saved.createdAt,
            updatedAt: saved.updatedAt,
            createdBy: {
                id: admin.id,
                email: admin.email,
            },
        };
    }

    async findAll(): Promise<BrandResponseDto[]> {
        const brands = await this.brandRepo.find({
            relations: ['createdBy'],
        });

        return brands.map((brand) => {
            if (!brand.createdBy) {
                this.logger.warn(`Brand ${brand.id} has no createdBy user`);
            }
            return {
                id: brand.id,
                name: brand.name,
                description: brand.description,
                logoUrl: brand.logoUrl,
                createdAt: brand.createdAt,
                updatedAt: brand.updatedAt,
                createdBy: brand.createdBy ? {
                    id: brand.createdBy.id,
                    email: brand.createdBy.email,
                } : null,
            };
        });
    }

    async findOne(id: number): Promise<BrandResponseDto> {
        const brand = await this.brandRepo.findOne({
            where: { id },
            relations: ['createdBy'],
        });

        if (!brand) {
            throw new NotFoundException(`Brand with ID ${id} not found`);
        }

        if (!brand.createdBy) {
            this.logger.warn(`Brand ${id} has no createdBy user`);
        }

        return {
            id: brand.id,
            name: brand.name,
            description: brand.description,
            logoUrl: brand.logoUrl,
            createdAt: brand.createdAt,
            updatedAt: brand.updatedAt,
            createdBy: brand.createdBy ? {
                id: brand.createdBy.id,
                email: brand.createdBy.email,
            } : null,
        };
    }

    async update(id: number, dto: UpdateBrandDto): Promise<BrandResponseDto> {
        const brand = await this.brandRepo.findOne({
            where: { id },
            relations: ['createdBy'],
        });

        if (!brand) {
            throw new NotFoundException(`Brand with ID ${id} not found`);
        }

        if (!brand.createdBy) {
            this.logger.warn(`Brand ${id} has no createdBy user`);
        }

        Object.assign(brand, dto);
        const updatedBrand = await this.brandRepo.save(brand);

        return {
            id: updatedBrand.id,
            name: updatedBrand.name,
            description: updatedBrand.description,
            logoUrl: updatedBrand.logoUrl,
            createdAt: updatedBrand.createdAt,
            updatedAt: updatedBrand.updatedAt,
            createdBy: updatedBrand.createdBy ? {
                id: updatedBrand.createdBy.id,
                email: updatedBrand.createdBy.email,
            } : null,
        };
    }

    async delete(id: number) {
        const result = await this.brandRepo.delete(id);

        if (!result.affected) {
            throw new NotFoundException(`Brand with ID ${id} not found`);
        }

        return { message: 'Brand deleted successfully' };
    }
}