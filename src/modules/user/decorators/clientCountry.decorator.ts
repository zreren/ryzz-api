import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { lookup } from 'geoip-lite';
import * as requestIp from 'request-ip';
/**
 * 获取客户端所在国家代码
 */
export const ClientCountry = createParamDecorator(async (_data: unknown, ctx: ExecutionContext) => {
    const ip = requestIp.getClientIp(ctx.switchToHttp().getRequest()) as string;
    const geoData = lookup(ip);
    return geoData ? geoData.country : '';
});
