import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(private readonly mailerService: MailerService) { }

    async sendUserCredentials(
        to: string,
        email: string,
        password: string,
        role: Role,
    ): Promise<void> {
        const accountType =
            role === Role.AUTHOR
                ? 'Author'
                : role === Role.BRAND
                    ? 'Brand'
                    : 'User';

        try {
            await this.mailerService.sendMail({
                to,
                subject: `Your ${accountType} Account Credentials`,
                text: `
Hello,

Your ${accountType.toLowerCase()} account has been successfully created.

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
                `${accountType} user created but failed to send credentials email`,
            );
        }
    }
}