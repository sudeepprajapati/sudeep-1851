import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(private readonly mailerService: MailerService) { }

    async sendBrandCredentials(
        to: string,
        email: string,
        password: string,
    ): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to,
                subject: 'Your Brand Account Credentials',
                text: `
Hello,

Your brand account has been successfully created.

Login Details:
Email: ${email}
Password: ${password}

For security reasons, please log in and change your password immediately.

If you did not expect this account, please contact the administrator.

Regards,
Brand Portal Team
            `,
            });
        } catch (error) {
            this.logger.error(
                `Failed to send credentials email to ${to}`,
                error instanceof Error ? error.stack : String(error),
            );
            throw new InternalServerErrorException(
                'Brand user created but failed to send credentials email',
            );
        }
    }
}