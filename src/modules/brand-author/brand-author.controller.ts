import {
    Controller,
    Post,
    Body,
    UseGuards,
} from '@nestjs/common';
import { BrandAuthorService } from './brand-author.service';
import { AssignAuthorDto } from './dto/assign-author.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('brand-author')
export class BrandAuthorController {
    constructor(
        private readonly brandAuthorService: BrandAuthorService,
    ) { }

    @Post('assign')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async assignAuthor(@Body() dto: AssignAuthorDto) {
        const result =
            await this.brandAuthorService.assignAuthorToBrand(
                dto.brandId,
                dto.authorId,
            );

        return {
            success: true,
            message: 'Author assigned to brand successfully',
            data: result,
        };
    }
}