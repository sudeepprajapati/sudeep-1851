import {
    Controller,
    Get,
    Patch,
    Param,
    Query,
    Body,
    UseGuards,
    ParseIntPipe,
    Request,
    BadRequestException,
} from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/enums/role.enum';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ArticleService } from '../article.service';
import { ArticleStatus } from '../../../common/enums/article-status.enum';
import { UpdateArticleStatusDto } from '../dto/update-article-status.dto';

@Controller('admin/articles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminArticleController {
    constructor(private readonly articleService: ArticleService) { }

    @Get()
    async listAll(
        @Query('brandId') brandId?: string,
        @Query('authorId') authorId?: string,
        @Query('status') status?: ArticleStatus | ArticleStatus[],
    ) {
        let parsedBrandId: number | undefined;

        if (brandId) {
            parsedBrandId = parseInt(brandId, 10);
            if (Number.isNaN(parsedBrandId)) {
                throw new BadRequestException('Invalid brandId');
            }
        }

        return this.articleService.listAllArticles(
            parsedBrandId,
            authorId,
            status,
        );
    }

    @Patch(':id/status')
    async updateStatus(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateArticleStatusDto,
    ) {
        return this.articleService.updateArticleStatus(
            req.user,
            id,
            dto.status,
        );
    }
}