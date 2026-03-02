import {
    Injectable,
    ForbiddenException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Article } from './entities/article.entity';
import { BrandAuthor } from '../brand-author/entities/brand-author.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Brand } from '../brands/entities/brand.entity';
import { ArticleStatus } from '../../common/enums/article-status.enum';
import { PublicArticleQueryDto } from './dto/public-article-query.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { BrandArticleQueryDto } from './dto/brand-article-query.dto';

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

    private readonly articleSelect = {
        id: true,
        title: true,
        content: true,
        status: true,
        publishedAt: true,
        brandId: true,
        createdAt: true,
        updatedAt: true,
        author: {
            id: true,
            role: true,
        },
    } as const;

    private readonly publicArticleSelect = [
        'article.id',
        'article.title',
        'article.content',
        'article.status',
        'article.publishedAt',
        'article.brandId',
        'article.createdAt',
        'article.updatedAt',
        'author.id',
        'author.email',
    ];

    private validateStatusChange(
        user: User,
        article: Article,
        newStatus: ArticleStatus,
    ): void {
        const currentStatus = article.status;

        if (user.role === Role.BRAND || user.role === Role.AUTHOR) {
            if (
                currentStatus === ArticleStatus.DRAFT &&
                newStatus === ArticleStatus.PENDING_REVIEW
            ) {
                return;
            }

            if (
                currentStatus === ArticleStatus.REJECTED &&
                newStatus === ArticleStatus.DRAFT
            ) {
                return;
            }

            if (
                currentStatus === ArticleStatus.DRAFT &&
                newStatus === ArticleStatus.DRAFT
            ) {
                return;
            }

            throw new ForbiddenException(
                'Invalid status transition for Brand/Author',
            );
        }

        if (user.role === Role.ADMIN) {
            if (
                currentStatus === ArticleStatus.PENDING_REVIEW &&
                (newStatus === ArticleStatus.PUBLISHED ||
                    newStatus === ArticleStatus.REJECTED)
            ) {
                return;
            }

            if (
                currentStatus === ArticleStatus.PUBLISHED &&
                newStatus === ArticleStatus.ARCHIVED
            ) {
                return;
            }

            throw new ForbiddenException(
                'Invalid status transition for Admin',
            );
        }

        throw new ForbiddenException('Invalid role for status update');
    }

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
            where: { id: dto.brandId },
        });

        if (!brandExists) {
            throw new NotFoundException('Brand not found');
        }

        const article = this.articleRepository.create({
            ...dto,
            authorId: user.id,
            status: ArticleStatus.DRAFT,
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

        // Validate empty body first
        if (!dto.title && !dto.content && !dto.status) {
            throw new BadRequestException(
                'At least one field must be provided for update',
            );
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

        // Lock editing for restricted states
        if (
            article.status === ArticleStatus.PENDING_REVIEW ||
            article.status === ArticleStatus.PUBLISHED ||
            article.status === ArticleStatus.ARCHIVED
        ) {
            throw new ForbiddenException(
                'Article cannot be modified in its current status',
            );
        }

        if (dto.status) {
            this.validateStatusChange(user, article, dto.status);
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

    async updateArticleStatus(
        user: User,
        articleId: number,
        newStatus: ArticleStatus,
    ): Promise<Article> {
        if (user.role !== Role.ADMIN) {
            throw new ForbiddenException(
                'Only admin can change article status',
            );
        }

        const article = await this.articleRepository.findOne({
            where: { id: articleId },
        });

        if (!article) {
            throw new NotFoundException('Article not found');
        }

        this.validateStatusChange(user, article, newStatus);

        // Set publishedAt only on first transition to PUBLISHED
        if (
            newStatus === ArticleStatus.PUBLISHED &&
            article.status !== ArticleStatus.PUBLISHED
        ) {
            article.publishedAt = new Date();
        }

        article.status = newStatus;

        await this.articleRepository.save(article);

        const updated = await this.articleRepository.findOne({
            where: { id: articleId },
            select: this.articleSelect,
            relations: { author: true },
        });

        if (!updated) {
            throw new NotFoundException('Article not found');
        }

        return updated;
    }

    async listAllArticles(
        brandId?: number,
        authorId?: string,
        status?: ArticleStatus | ArticleStatus[],
    ): Promise<Article[]> {

        const where: any = {};

        if (brandId) where.brandId = brandId;
        if (authorId) where.authorId = authorId;

        if (status) {
            if (Array.isArray(status)) {
                where.status = In(status);
            } else {
                where.status = status;
            }
        }

        return this.articleRepository.find({
            where,
            select: this.articleSelect,
            relations: { author: true },
            order: { createdAt: 'DESC' },
        });
    }

    async listBrandArticlesPaginated(
        user: User,
        query: BrandArticleQueryDto
    ): Promise<PaginatedResponse<Article>> {
        if (!user.brandId) {
            throw new ForbiddenException('Brand user must have brandId');
        }

        const { page, limit, sortBy, order, status } = query;

        const qb = this.articleRepository
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.author', 'author')
            .where('article.brandId = :brandId', {
                brandId: user.brandId,
            })
            .select(this.publicArticleSelect)

        if (status) {
            if (Array.isArray(status)) {
                qb.andWhere('article.status IN (:...status)', { status });
            } else {
                qb.andWhere('article.status = :status', { status });
            }
        }

        const normalizedOrder =
            order && order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        qb.orderBy(`article.${sortBy}`, normalizedOrder)
            .addOrderBy('article.id', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await qb.getManyAndCount();

        return {
            data,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }

    async listAuthorArticles(
        user: User,
        status?: ArticleStatus | ArticleStatus[],
    ): Promise<Article[]> {

        const where: any = {
            authorId: user.id,
        };

        if (status) {
            if (Array.isArray(status)) {
                where.status = In(status);
            } else {
                where.status = status;
            }
        }

        return this.articleRepository.find({
            where,
            select: this.articleSelect,
            relations: { author: true },
            order: { createdAt: 'DESC' },
        });
    }

    async listPublishedArticles(
        queryDto: PublicArticleQueryDto,
    ): Promise<PaginatedResponse<Article>> {
        const {
            page,
            limit,
            sortBy,
            order,
            search,
            brandId,
        } = queryDto;

        const qb = this.articleRepository
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.author', 'author')
            .where('article.status = :status', {
                status: ArticleStatus.PUBLISHED,
            })
            .select(this.publicArticleSelect)

        if (search) {
            qb.andWhere(
                '(article.title ILIKE :search OR article.content ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        if (brandId) {
            qb.andWhere('article.brandId = :brandId', { brandId });
        }

        const normalizedOrder =
            order && order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        qb.orderBy(`article.${sortBy}`, normalizedOrder)
            .addOrderBy('article.id', 'DESC') // stable pagination
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await qb.getManyAndCount();

        return {
            data,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    }

    async getPublishedArticle(id: number): Promise<Article> {
        const article = await this.articleRepository
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.author', 'author')
            .where('article.id = :id', { id })
            .andWhere('article.status = :status', {
                status: ArticleStatus.PUBLISHED,
            })
            .select(this.publicArticleSelect)
            .getOne();

        if (!article) {
            throw new NotFoundException('Article not found');
        }

        return article;
    }
}