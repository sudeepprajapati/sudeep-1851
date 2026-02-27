import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { BrandAuthor } from '../brand-author/entities/brand-author.entity';
import { ArticleService } from './article.service';
import { BrandArticleController } from './controllers/brand-article.controller';
import { AuthorArticleController } from './controllers/author-article.controller';
import { Brand } from '../brands/entities/brand.entity';
import { AdminArticleController } from './controllers/admin-article.controller';
import { PublicArticleController } from './controllers/public-article.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Article, BrandAuthor, Brand]),
    ],
    controllers: [
        BrandArticleController,
        AuthorArticleController,
        AdminArticleController,
        PublicArticleController
    ],
    providers: [ArticleService],
})
export class ArticleModule { }