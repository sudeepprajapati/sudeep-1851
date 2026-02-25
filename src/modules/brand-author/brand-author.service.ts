import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandAuthor } from './entities/brand-author.entity';
import { Brand } from '../brands/entities/brand.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class BrandAuthorService {
    constructor(
        @InjectRepository(BrandAuthor)
        private readonly brandAuthorRepository: Repository<BrandAuthor>,

        @InjectRepository(Brand)
        private readonly brandRepository: Repository<Brand>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async assignAuthorToBrand(
        brandId: number,
        authorId: string,
    ): Promise<BrandAuthor> {
        const brand = await this.brandRepository.findOne({
            where: { id: brandId },
        });

        if (!brand) {
            throw new NotFoundException(`Brand with ID ${brandId} not found`);
        }

        const user = await this.userRepository.findOne({
            where: { id: authorId },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${authorId} not found`);
        }

        if (user.role !== Role.AUTHOR) {
            throw new BadRequestException(
                'Only users with AUTHOR role can be assigned to a brand',
            );
        }

        const existing = await this.brandAuthorRepository.findOne({
            where: { brandId, authorId },
        });

        if (existing) {
            throw new BadRequestException(
                'Author already assigned to this brand',
            );
        }

        const assignment = this.brandAuthorRepository.create({
            brandId,
            authorId,
        });

        return this.brandAuthorRepository.save(assignment);
    }
}