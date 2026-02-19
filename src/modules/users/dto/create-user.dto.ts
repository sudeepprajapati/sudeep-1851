import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength, IsPositive } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    password: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    brandId?: number;
}
