import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as requestIp from 'request-ip';
/**
 * 获取客户端IP
 */
export const ClientIp = createParamDecorator(async (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return requestIp.getClientIp(request) as string;
});
