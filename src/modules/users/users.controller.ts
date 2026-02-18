import { Controller, Post, Body, UseGuards, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Role } from 'src/common/enums/role.enum';
import { User } from './entities/user.entity';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('create-admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async createAdmin(@Body() createUserDto: CreateUserDto) {
        const result = await this.usersService.createUserWithRole(
            createUserDto.email,
            createUserDto.password,
            Role.ADMIN,
        );

        if (!result) {
            return {
                success: false,
                message: 'Failed to create admin user. Email may already exist.',
            };
        }

        return {
            success: true,
            message: 'Admin user created successfully',
            user: result,
        };
    }

    @Post('create-brand')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async createBrand(@Body() createUserDto: CreateUserDto) {
        const result = await this.usersService.createUserWithRole(
            createUserDto.email,
            createUserDto.password,
            Role.BRAND,
        );

        if (!result) {
            return {
                success: false,
                message: 'Failed to create brand user. Email may already exist.',
            };
        }

        return {
            success: true,
            message: 'Brand user created successfully',
            user: result,
        };
    }
}