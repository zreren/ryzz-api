import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { isNil } from 'lodash';
import { ExtractJwt } from 'passport-jwt';

import { ALLOW_GUEST } from '@/modules/restful/constants';

import { TokenService } from '../services/token.service';

/**
 * 用户JWT认证守卫
 * 检测用户是否已登录
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(protected reflector: Reflector, protected tokenService: TokenService) {
        super();
    }

    /**
     * 守卫方法
     * @param context
     */
    async canActivate(context: ExecutionContext) {
        const crudGuest = Reflect.getMetadata(
            ALLOW_GUEST,
            context.getClass().prototype,
            context.getHandler().name,
        );
        const defaultGuest = this.reflector.getAllAndOverride<boolean>(ALLOW_GUEST, [
            context.getHandler(),
            context.getClass(),
        ]);
        const allowGuest = crudGuest ?? defaultGuest;
        if (allowGuest) {
            return true;
        }

        const request = this.getRequest(context);
        const requestToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        if (isNil(requestToken)) {
            return false;
        }
        try {
            return (await super.canActivate(context)) as boolean;
        } catch (e) {
            // 尝试刷新token
            const newToken = await this.tokenService.refreshTokenRedis(requestToken);
            if (isNil(newToken)) {
                return false;
            }
            const response = this.getResponse(context);
            response.header('token', newToken);
            request.headers.authorization = `Bearer ${newToken}`;
            const result = await super.canActivate(context);
            return result as boolean;
        }
    }

    /**
     * 自动请求处理
     * 如果请求中有错误则抛出错误
     * 如果请求中没有用户信息则抛出401异常
     * @param err
     * @param user
     * @param _info
     */
    handleRequest(err: any, user: any, _info: Error) {
        if (err || !user) {
            throw err || new UnauthorizedException();
        }
        return user;
    }

    protected getRequest(context: ExecutionContext) {
        return context.switchToHttp().getRequest();
    }

    protected getResponse(context: ExecutionContext) {
        return context.switchToHttp().getResponse();
    }
}
