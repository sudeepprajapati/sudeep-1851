import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { ArticleService } from "./article.service";
import { CreateArticleDto } from "./dto/create-article.dto";
import { UpdateArticleDto } from "./dto/update-article.dto";

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
    list(@Request() req) {
        return this.articleService.listAuthorArticles(req.user);
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