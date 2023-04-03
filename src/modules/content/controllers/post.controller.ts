import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ExtractJwt } from 'passport-jwt';

import { BaseController } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { ListQueryDto } from '@/modules/restful/dtos';
import { createHookOption } from '@/modules/restful/helpers';

import { Guest, ReqUser } from '@/modules/user/decorators';

import { ClientCountry } from '@/modules/user/decorators/clientCountry.decorator';
import { UserEntity } from '@/modules/user/entities';

import { ContentModule } from '../content.module';
import {
    CancelPostCollectDto,
    CreatePostDto,
    PostCollectDto,
    QueryPostDto,
    UpdatePostDto,
} from '../dtos';
import { LikeDto, UnlikeDto } from '../dtos/like.dto';
import { FeedService, LikeService } from '../services';
import { PostService } from '../services/post.service';

@ApiTags('帖子')
@ApiBearerAuth()
@Depends(ContentModule)
@Crud(async () => ({
    id: 'post',
    enabled: [
        {
            name: 'list',
            option: createHookOption('帖子查询,以分页模式展示'),
        },
        {
            name: 'detail',
            option: createHookOption('帖子详情'),
        },
        {
            name: 'store',
            option: createHookOption('创建帖子'),
        },
        {
            name: 'update',
            option: createHookOption('更新帖子'),
        },
        {
            name: 'delete',
            option: createHookOption('删除帖子'),
        },
    ],
    dtos: {
        store: CreatePostDto,
        update: UpdatePostDto,
        list: QueryPostDto,
    },
}))
@Controller('posts')
export class PostController extends BaseController<PostService> {
    constructor(
        protected service: PostService,
        private readonly feedService: FeedService,
        private readonly likeService: LikeService,
    ) {
        super(service);
    }

    @Get('home')
    @ApiOperation({ summary: '首页帖子列表' })
    @Guest()
    async home(
        @Query() options: ListQueryDto,
        @Req() request: any,
        @ClientCountry() clientCountry: string,
    ) {
        const requestToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request) as string;
        return this.service.getHomeList(requestToken, clientCountry, options.page, options.limit);
    }

    @Get('feeds')
    @ApiOperation({ summary: '关注动态feed' })
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
    async collect(@Body() data: PostCollectDto, @ReqUser() user: UserEntity) {
        console.log('collect');
    }

    @Post('cancelCollect')
    @ApiOperation({ summary: '取消收藏' })
    async cancelCollect(@Body() data: CancelPostCollectDto, @ReqUser() user: UserEntity) {
        console.log('cancelCollect');
    }
}
