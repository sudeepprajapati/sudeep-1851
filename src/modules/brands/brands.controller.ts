import {
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Body,
    Param,
    Req,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateBrandStatusDto } from './dto/update-brand-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('brands')
export class BrandController {
    constructor(private readonly brandService: BrandService) { }

    @Roles(Role.ADMIN)
    @Post()
    create(@Body() dto: CreateBrandDto, @Req() req) {
        return this.brandService.create(dto, req.user);
    }

    @Get()
    findAll() {
        return this.brandService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.brandService.findOne(id);
    }

    @Roles(Role.ADMIN)
    @Put(':id/status')
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBrandStatusDto,
    ) {
        return this.brandService.updateStatus(id, dto.status);
    }

    // UPDATED ACCESS CONTROL
    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBrandDto,
        @Req() req,
    ) {
        return this.brandService.update(id, dto, req.user);
    }

    @Roles(Role.ADMIN)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.brandService.delete(id);
    }
}