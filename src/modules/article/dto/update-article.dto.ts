import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ArticleStatus } from 'src/common/enums/article-status.enum';

export class UpdateArticleDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsEnum(ArticleStatus)
    status?: ArticleStatus;
}