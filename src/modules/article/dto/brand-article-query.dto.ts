import { IsOptional, IsEnum } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ArticleStatus } from '../../../common/enums/article-status.enum';

export class BrandArticleQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsEnum(ArticleStatus, { each: true })
    status?: ArticleStatus | ArticleStatus[];
}