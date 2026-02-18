import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    signup(@Body() signupDto: SignupDto) {
        return this.authService.signup(signupDto);
    }

    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getProfile(@Request() req) {
        return req.user;
    }

    @Get('admin-test')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    adminOnly() {
        return { message: 'Admin access granted' };
    }

    @Post('create-admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async createAdmin(@Body() createUserDto: CreateUserDto) {
        const result = await this.authService.createUserWithRole(
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
            user: this.authService.excludePasswordFromUser(result),
        };
    }

    @Post('create-brand')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async createBrand(@Body() createUserDto: CreateUserDto) {
        const result = await this.authService.createUserWithRole(
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
            user: this.authService.excludePasswordFromUser(result),
        };
    }

}
