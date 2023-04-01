import { Controller } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { BaseController } from '@/modules/restful/base';
import { Crud, Depends } from '@/modules/restful/decorators';

import { createHookOption } from '@/modules/restful/helpers';

import { ContentModule } from '../content.module';
import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos';
import { PostService } from '../services/post.service';

@ApiTags('帖子')
@ApiBearerAuth()
@Depends(ContentModule)
@Crud(async () => ({
    id: 'post',
    enabled: [
        {
            name: 'list',
            option: createHookOption('文章查询,以分页模式展示'),
        },
        {
            name: 'detail',
            option: createHookOption('文章详情'),
        },
        {
            name: 'store',
            option: createHookOption('创建文章'),
        },
        {
            name: 'update',
            option: createHookOption('更新文章'),
        },
        {
            name: 'delete',
            option: createHookOption('删除文章'),
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
    constructor(protected service: PostService) {
        super(service);
    }
}
