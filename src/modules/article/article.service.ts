import {
    Injectable,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { BrandAuthor } from '../brand-author/entities/brand-author.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Brand } from '../brands/entities/brand.entity';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,

        @InjectRepository(BrandAuthor)
        private readonly brandAuthorRepository: Repository<BrandAuthor>,

        @InjectRepository(Brand)
        private readonly brandRepository: Repository<Brand>,
    ) { }

    async createArticle(
        user: User,
        dto: CreateArticleDto,
    ): Promise<Article> {
        if (user.role === Role.ADMIN) {
            throw new ForbiddenException('Admin cannot create articles');
        }

        if (user.role === Role.BRAND) {
            if (user.brandId !== dto.brandId) {
                throw new ForbiddenException(
                    'Brand can only create articles for its own brand',
                );
            }
        }

        if (user.role === Role.AUTHOR) {
            const assignment = await this.brandAuthorRepository.findOne({
                where: {
                    brandId: dto.brandId,
                    authorId: user.id,
                },
            });

            if (!assignment) {
                throw new ForbiddenException(
                    'Author is not assigned to this brand',
                );
            }
        }

        const brandExists = await this.brandRepository.findOne({
            where: { id: dto.brandId }
        });

        if (!brandExists) throw new NotFoundException('Brand not found');

        const article = this.articleRepository.create({
            ...dto,
            authorId: user.id,
        });

        return this.articleRepository.save(article);
    }

    async updateArticle(
        user: User,
        articleId: number,
        dto: UpdateArticleDto,
    ): Promise<Article> {
        const article = await this.articleRepository.findOne({
            where: { id: articleId },
        });

        if (!article) {
            throw new NotFoundException('Article not found');
        }

        if (user.role === Role.ADMIN) {
            throw new ForbiddenException('Admin cannot update articles');
        }

        if (user.role === Role.BRAND) {
            if (article.brandId !== user.brandId) {
                throw new ForbiddenException(
                    'Brand can only update its own brand articles',
                );
            }
        }

        if (user.role === Role.AUTHOR) {
            if (article.authorId !== user.id) {
                throw new ForbiddenException(
                    'Author can only update own articles',
                );
            }
        }

        Object.assign(article, dto);
        return this.articleRepository.save(article);
    }

    async deleteArticle(user: User, articleId: number): Promise<void> {
        const article = await this.articleRepository.findOne({
            where: { id: articleId },
        });

        if (!article) {
            throw new NotFoundException('Article not found');
        }

        if (user.role === Role.ADMIN) {
            throw new ForbiddenException('Admin cannot delete articles');
        }

        if (user.role === Role.BRAND) {
            if (article.brandId !== user.brandId) {
                throw new ForbiddenException(
                    'Brand can only delete its own brand articles',
                );
            }
        }

        if (user.role === Role.AUTHOR) {
            if (article.authorId !== user.id) {
                throw new ForbiddenException(
                    'Author can only delete own articles',
                );
            }
        }

        await this.articleRepository.remove(article);
    }

    async listBrandArticles(user: User): Promise<Article[]> {
        if (!user.brandId) {
            throw new ForbiddenException('Brand user must have brandId');
        }

        return this.articleRepository.find({
            where: { brandId: user.brandId },
            select: {
                id: true,
                title: true,
                content: true,
                brandId: true,
                createdAt: true,
                updatedAt: true,
                author: {
                    id: true,
                    email: true,
                    role: true,
                },
            },
            relations: {
                author: true,
            },
        });
    }

    async listAuthorArticles(user: User): Promise<Article[]> {
        return this.articleRepository.find({
            where: { authorId: user.id },
            select: {
                id: true,
                title: true,
                content: true,
                brandId: true,
                createdAt: true,
                updatedAt: true,
                author: {
                    id: true,
                    email: true,
                    role: true,
                },
            },
            relations: {
                author: true,
            },
        });
    }
}