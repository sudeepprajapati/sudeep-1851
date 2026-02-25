import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { BrandAuthor } from '../brand-author/entities/brand-author.entity';
import { ArticleService } from './article.service';
import { BrandArticleController } from './brand-article.controller';
import { AuthorArticleController } from './author-article.controller';
import { Brand } from '../brands/entities/brand.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Article, BrandAuthor, Brand]),
    ],
    controllers: [
        BrandArticleController,
        AuthorArticleController,
    ],
    providers: [ArticleService],
})
export class ArticleModule { }