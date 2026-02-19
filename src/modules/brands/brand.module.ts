import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { BrandController } from './brands.controller';
import { BrandService } from './brand.service';

@Module({
    imports: [TypeOrmModule.forFeature([Brand])],
    controllers: [BrandController],
    providers: [BrandService],
})
export class BrandModule { }