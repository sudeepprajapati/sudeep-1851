import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Query,
} from '@nestjs/common';
import { ArticleService } from '../article.service';
import { PublicArticleQueryDto } from '../dto/public-article-query.dto';

@Controller('articles')
export class PublicArticleController {
    constructor(private readonly articleService: ArticleService) { }

    @Get()
    list(@Query() query: PublicArticleQueryDto) {
        return this.articleService.listPublishedArticles(query);
    }

    @Get(':id')
    getOne(@Param('id', ParseIntPipe) id: number) {
        return this.articleService.getPublishedArticle(id);
    }
}