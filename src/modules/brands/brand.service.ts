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

        // Check if brand already exists
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
        });

        try {
            const saved = await this.brandRepo.save(brand);
            return this.mapToResponse(saved);
        } catch (error: any) {
            // Postgres unique constraint error
            if (error.code === '23505') {
                throw new BadRequestException('Brand already exists');
            }
            throw error;
        }
    }

    async findAll(): Promise<BrandResponseDto[]> {
        const brands = await this.brandRepo.find({
            relations: ['createdBy'],
        });

        return brands.map((brand) => {
            if (!brand.createdBy) {
                this.logger.warn(`Brand ${brand.id} has no createdBy user`);
            }
            return this.mapToResponse(brand);
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

        return this.mapToResponse(brand);
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

        return this.mapToResponse(updatedBrand);
    }

    async delete(id: number) {
        const result = await this.brandRepo.delete(id);

        if (!result.affected) {
            throw new NotFoundException(`Brand with ID ${id} not found`);
        }

        return { message: 'Brand deleted successfully' };
    }

    // -----------------------------
    // Private Mapper
    // -----------------------------
    private mapToResponse(brand: Brand): BrandResponseDto {
        return {
            id: brand.id,
            name: brand.name,
            description: brand.description,
            logoUrl: brand.logoUrl,
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
