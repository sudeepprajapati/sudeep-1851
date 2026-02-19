import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class CreateBrandDto {
    @IsString()
    @Length(2, 50)
    name: string;

    @IsOptional()
    @IsString()
    @Length(0, 255)
    description?: string;

    @IsOptional()
    @IsUrl()
    logoUrl?: string;

}