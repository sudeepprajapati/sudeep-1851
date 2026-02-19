import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { AdminSeeder } from 'src/common/seeders/admin.seeder';
import { UsersService } from '../users/users.service';
import { Brand } from '../brands/entities/brand.entity';

@Module({
    imports: [
        ConfigModule,

        TypeOrmModule.forFeature([Brand]),

        UsersModule,

        PassportModule,

        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const secret = configService.getOrThrow<string>('JWT_SECRET');
                const expiresInRaw = configService.getOrThrow<string>('JWT_EXPIRES_IN');

                // Validate format strictly
                if (!/^\d+(s|m|h|d)$/.test(expiresInRaw)) {
                    throw new Error(
                        'JWT_EXPIRES_IN must include a time unit suffix (e.g., 86400s, 24h, 7d)',
                    );
                }

                const expiresIn = expiresInRaw as StringValue;

                return {
                    secret,
                    signOptions: {
                        expiresIn,
                    },
                };
            }
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, JwtAuthGuard, AdminSeeder],
    exports: [JwtAuthGuard],
})
export class AuthModule { }
