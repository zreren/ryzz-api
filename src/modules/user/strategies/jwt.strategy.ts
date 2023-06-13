import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserEntity } from '../entities';
import { JwtPayload } from '../types';

/**
 * 用户认证JWT策略
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(@Inject('JWT_TOKEN') jwtToken: string) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtToken,
        });
    }

    /**
     * 通过荷载解析出用户ID
     * 通过用户ID查询出用户是否存在,并把id放入request方便后续操作
     * @param payload
     */
    async validate(payload: JwtPayload) {
        // return { id: payload.sub, username: payload.username } as UserEntity;
        return UserEntity.findOneBy({ id: payload.sub });
    }
}
