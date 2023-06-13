import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { TokenService } from '../services/token.service';
import { SocketWithUserData } from '@/modules/ws/types';
import { isClientAliveNow } from '@/modules/ws/helper';

/**
 * 用于WebSocket的用户JWT认证守卫,检测用户是否已登录
 */
@Injectable()
export class JwtWsGuard implements CanActivate {
    constructor(protected tokenService: TokenService) {}

    /**
     * 守卫方法
     * @param context
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs()?.getClient<SocketWithUserData>();
        const active = isClientAliveNow(client.user.lastActiveTime);
        active || client.disconnect();
        return active;
    }
}
