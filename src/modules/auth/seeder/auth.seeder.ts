import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { Role } from '../../../common/enums/role.enum';

/**
 * AuthSeeder is responsible for seeding default admin user on application startup.
 * It implements OnModuleInit to run automatically when the AuthModule initializes.
 * It is idempotent - safe to run multiple times without creating duplicates.
 */
@Injectable()
export class AuthSeeder implements OnModuleInit {
    private readonly logger = new Logger(AuthSeeder.name);

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) { }

    async onModuleInit(): Promise<void> {
        await this.seedDefaultAdmin();
    }

    private async seedDefaultAdmin(): Promise<void> {
        const adminEmail = this.configService.get<string>('DEFAULT_ADMIN_EMAIL');
        const adminPassword = this.configService.get<string>('DEFAULT_ADMIN_PASSWORD');
        const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';

        // If env vars not provided
        if (!adminEmail || !adminPassword) {
            if (nodeEnv === 'production') {
                this.logger.error(
                    'CRITICAL: DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD must be set in production. '
                    + 'Application started without default admin user. Please configure environment variables immediately.',
                );
            } else {
                this.logger.warn(
                    'DEFAULT_ADMIN_EMAIL or DEFAULT_ADMIN_PASSWORD not configured. Skipping admin seeding.',
                );
            }
            return;
        }

        try {
            const result = await this.authService.createUserWithRole(
                adminEmail,
                adminPassword,
                Role.ADMIN,
            );

            if (result) {
                this.logger.log(
                    `Default ADMIN user created successfully: ${adminEmail}`,
                );
            } else {
                this.logger.debug(
                    `ADMIN user already exists: ${adminEmail}. Skipping creation.`,
                );
            }
        } catch (error) {
            this.logger.error(
                `Failed to seed default admin user: ${error instanceof Error ? error.message : String(error)}`,
                error instanceof Error ? error.stack : '',
            );
        }
    }
}
