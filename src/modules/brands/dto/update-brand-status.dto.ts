import { IsEnum, IsNotEmpty } from 'class-validator';
import { BrandStatus } from '../../../common/enums/brand-status.enum';

export class UpdateBrandStatusDto {
    @IsNotEmpty()
    @IsEnum(BrandStatus)
    status: BrandStatus;
}