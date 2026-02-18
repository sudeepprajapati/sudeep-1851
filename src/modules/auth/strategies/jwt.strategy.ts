import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { Role } from '../../../common/enums/role.enum';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
    sub: string;
    role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        configService: ConfigService,
    ) {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.usersRepository.findOne({
            where: { id: payload.sub },
        });

        if (!user) {
            throw new UnauthorizedException('User no longer exists');
        }

        return user;
    }
}
