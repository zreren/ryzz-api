import { Body, Controller, Get, Post, Query, Req, SerializeOptions } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { isNil } from 'lodash';
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
    QueryChildrenCommentDto,
    QueryCommentDto,
    QueryCommentTreeDto,
    UnlikeCommentDto,
} from '../dtos';
import { CommentEntity, PostEntity } from '../entities';
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
    constructor(
        protected service: CommentService,
        private readonly likeService: LikeService,
        private readonly jwtService: JwtService,
    ) {
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

    @Get('parents')
    @ApiOperation({ summary: '一级评论' })
    @Guest()
    async getComments(
        @Query()
        query: QueryCommentDto,
        @Req() request: any,
    ) {
        const post = await PostEntity.findOneBy({ id: query.post });
        if (isNil(post)) {
            throw new Error('post not exists');
        }

        const requestToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request) as string;
        const { sub } = this.jwtService.decode(requestToken);
        return this.service.getPostComments(post, sub as string, query.page, query.limit);
    }

    @Get('children')
    @ApiOperation({ summary: '子评论' })
    @Guest()
    async getChildren(@Query() query: QueryChildrenCommentDto, @Req() request: any) {
        const parent = await CommentEntity.findOneBy({ id: query.parent });
        if (isNil(parent)) {
            throw new Error('parent comment not exists');
        }
        const requestToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request) as string;
        const { sub } = this.jwtService.decode(requestToken);
        return this.service.getChildrenComments(parent, sub, query.page, query.limit);
    }
}
