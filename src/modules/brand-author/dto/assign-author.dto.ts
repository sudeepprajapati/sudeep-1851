import { IsNumber, IsUUID } from 'class-validator';

export class AssignAuthorDto {
    @IsNumber()
    brandId: number;

    @IsUUID()
    authorId: string;
}