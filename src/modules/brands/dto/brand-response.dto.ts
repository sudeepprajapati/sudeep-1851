import { BrandStatus } from "src/common/enums/brand-status.enum";

export class BrandCreatorDto {
    id: string;
    email: string;
}

export class BrandResponseDto {
    id: number;
    name: string;
    description?: string;
    logoUrl?: string;
    status: BrandStatus;
    createdAt: Date;
    updatedAt: Date;
    createdBy: BrandCreatorDto | null;
}