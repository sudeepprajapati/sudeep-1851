import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Brand } from '../brands/entities/brand.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Brand]),
        MailModule
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
