import { Controller, Get, Query, Req } from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ExtractJwt } from 'passport-jwt';

import { BaseController } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { createHookOption } from '@/modules/restful/helpers';

import { Guest } from '@/modules/user/decorators';

import { ContentModule } from '../content.module';
import { CreateCollectDto, QueryCollectDto, QueryCollectPostDto, UpdateCollectDto } from '../dtos';
import { CollectService } from '../services/collect.service';

@ApiTags('收藏夹')
@ApiBearerAuth()
@Depends(ContentModule)
@Crud(async () => ({
    id: 'collect',
    enabled: [
        {
            name: 'list',
            option: createHookOption('收藏夹查询,以分页模式展示'),
        },
        {
            name: 'detail',
            option: createHookOption('收藏夹详情'),
        },
        {
            name: 'store',
            option: createHookOption('创建收藏夹'),
        },
        {
            name: 'update',
            option: createHookOption('更新收藏夹'),
        },
        {
            name: 'delete',
            option: createHookOption('删除收藏夹'),
        },
    ],
    dtos: {
        store: CreateCollectDto,
        update: UpdateCollectDto,
        list: QueryCollectDto,
    },
}))
@Controller('collects')
export class CollectController extends BaseController<CollectService> {
    constructor(protected service: CollectService) {
        super(service);
    }

    @ApiOperation({ summary: '获取收藏的帖子列表' })
    @Get('posts')
    @Guest()
    async getPosts(@Query() options: QueryCollectPostDto, @Req() request: any) {
        const requestToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request) as string;
        return this.service.getPosts(options, requestToken);
    }
}
