import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { Roles } from "../../../common/decorators/roles.decorator";
import { Role } from "../../../common/enums/role.enum";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { ArticleService } from "../article.service";
import { CreateArticleDto } from "../dto/create-article.dto";
import { UpdateArticleDto } from "../dto/update-article.dto";

@Controller('author/articles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.AUTHOR)
export class AuthorArticleController {
    constructor(private readonly articleService: ArticleService) { }

    @Post()
    create(@Request() req, @Body() dto: CreateArticleDto) {
        return this.articleService.createArticle(req.user, dto);
    }

    @Get()
    async list(
        @Request() req,
        @Query('status') status?: string | string[],
    ) {
        return this.articleService.listAuthorArticles(
            req.user,
            status as any,
        );
    }

    @Patch(':id')
    update(@Request() req, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArticleDto) {
        return this.articleService.updateArticle(req.user, id, dto);
    }

    @Delete(':id')
    async delete(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
        await this.articleService.deleteArticle(req.user, id);

        return {
            message: 'Article deleted successfully',
        };
    }
}