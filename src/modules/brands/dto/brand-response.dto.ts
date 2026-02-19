export class BrandCreatorDto {
    id: string;
    email: string;
}

export class BrandResponseDto {
    id: number;
    name: string;
    description?: string;
    logoUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: BrandCreatorDto | null;
}