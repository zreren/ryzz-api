import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { ListQueryDto } from '@/modules/restful/dtos';
import { createHookOption } from '@/modules/restful/helpers';

import { ReqUser } from '@/modules/user/decorators';

import { UserEntity } from '@/modules/user/entities';

import { ContentModule } from '../content.module';
import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos';
import { LikeDto, UnlikeDto } from '../dtos/like.dto';
import { FeedService, LikeService } from '../services';
import { PostService } from '../services/post.service';

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
        store: CreatePostDto,
        update: UpdatePostDto,
        list: QueryPostDto,
    },
}))
@Controller('collects')
export class CollectController extends BaseController<PostService> {
    constructor(
        protected service: PostService,
        private readonly feedService: FeedService,
        private readonly likeService: LikeService,
    ) {
        super(service);
    }

    @Get('feeds')
    @ApiOperation({ summary: 'feeds流' })
    async feeds(@Query() options: ListQueryDto, @ReqUser() user: ClassToPlain<UserEntity>) {
        return this.feedService.getTimelineFeeds(user.id, options.page, options.limit);
    }

    @Post('like')
    @ApiOperation({ summary: '点赞' })
    async like(@Body() data: LikeDto, @ReqUser() user: UserEntity) {
        console.log('like');
        return this.likeService.like(user, data.post);
    }

    @Post('cancelLike')
    @ApiOperation({ summary: '取消点赞' })
    async cancelLike(@Body() data: UnlikeDto, @ReqUser() user: UserEntity) {
        console.log('cancleLike');
        return this.likeService.cancelLike(user.id, data.post);
    }

    @Post('collect')
    @ApiOperation({ summary: '收藏' })
    async collect(@Body() data: LikeDto, @ReqUser() user: UserEntity) {
        console.log('collect');
    }

    @Post('cancelCollect')
    @ApiOperation({ summary: '取消收藏' })
    async cancelCollect(@Body() data: UnlikeDto, @ReqUser() user: UserEntity) {
        console.log('cancelCollect');
    }
}
