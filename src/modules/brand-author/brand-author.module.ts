import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandAuthor } from './entities/brand-author.entity';
import { Brand } from '../brands/entities/brand.entity';
import { User } from '../users/entities/user.entity';
import { BrandAuthorService } from './brand-author.service';
import { BrandAuthorController } from './brand-author.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([BrandAuthor, Brand, User]),
    ],
    controllers: [BrandAuthorController],
    providers: [BrandAuthorService],
    exports: [BrandAuthorService],
})
export class BrandAuthorModule { }