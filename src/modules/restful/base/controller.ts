import { Body, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { ReqUser } from '@/modules/user/decorators';
import { UserEntity } from '@/modules/user/entities';

import { DeleteDto, ListQueryDto } from '../dtos';

/**
 * 基础控制器
 */
export abstract class BaseController<S> {
    protected service: S;

    constructor(service: S) {
        this.setService(service);
    }

    private setService(service: S) {
        this.service = service;
    }

    async list(@Query() options: ListQueryDto, ...args: any[]) {
        return (this.service as any).paginate(options);
    }

    async detail(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @ReqUser() user: UserEntity,
        ...args: any[]
    ) {
        return (this.service as any).detail(id, user);
    }

    async store(@Body() data: any, @ReqUser() user: UserEntity, ...args: any[]) {
        return (this.service as any).create(data, user, args);
    }

    async update(
        @Body()
        data: any,
        ...args: any[]
    ) {
        return (this.service as any).update(data);
    }

    async delete(
        @Body()
        { ids }: DeleteDto,
        ...args: any[]
    ) {
        return (this.service as any).delete(ids);
    }
}
