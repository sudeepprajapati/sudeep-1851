import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBrandDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUrl()
    logoUrl?: string;

}