import { IsEnum, IsOptional } from 'class-validator';
import { ArticleStatus } from '../../../common/enums/article-status.enum';

export class UpdateArticleStatusDto {
    @IsOptional()
    @IsEnum(ArticleStatus)
    status: ArticleStatus;
}