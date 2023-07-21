import { Body, Controller, Get, Post, Query, Req, SerializeOptions } from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ExtractJwt } from 'passport-jwt';

import { BaseController } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { createHookOption } from '@/modules/restful/helpers';

import { Guest, ReqUser } from '@/modules/user/decorators';

import { UserEntity } from '@/modules/user/entities';

import { ContentModule } from '../content.module';
import {
    CreateCommentDto,
    LikeCommentDto,
    QueryCommentDto,
    QueryCommentTreeDto,
    UnlikeCommentDto,
} from '../dtos';
import { CommentService, LikeService } from '../services';

@ApiTags('评论')
@Depends(ContentModule)
@ApiBearerAuth()
@Crud(async () => ({
    id: 'comment',
    enabled: [
        {
            name: 'list',
            option: createHookOption('评论查询,以分页模式展示'),
        },
        {
            name: 'detail',
            option: createHookOption('评论详情'),
        },
        {
            name: 'store',
            option: createHookOption('添加评论'),
        },
        {
            name: 'delete',
            option: createHookOption('删除评论'),
        },
    ],
    dtos: {
        store: CreateCommentDto,
        list: QueryCommentDto,
    },
}))
@Controller('comments')
export class CommentController extends BaseController<CommentService> {
    constructor(protected service: CommentService, private readonly likeService: LikeService) {
        super(service);
    }

    @Get('tree')
    @ApiOperation({ summary: '树形结构评论查询' })
    @SerializeOptions({ groups: ['comment-tree'] })
    @Guest()
    async tree(
        @Query()
        query: QueryCommentTreeDto,
        @Req() request: any,
    ) {
        const requestToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request) as string;
        return this.service.findTrees(query, requestToken);
    }

    @Post('like')
    @ApiOperation({ summary: '点赞' })
    async like(@Body() data: LikeCommentDto, @ReqUser() user: UserEntity) {
        console.log('like');
        return this.likeService.likeComment(user, data.comment);
    }

    @Post('cancelLike')
    @ApiOperation({ summary: '取消点赞' })
    async cancelLike(@Body() data: UnlikeCommentDto, @ReqUser() user: UserEntity) {
        console.log('cancleLike');
        return this.likeService.cancelLikeComment(user.id, data.comment);
    }
}
