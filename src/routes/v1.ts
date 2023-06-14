import * as contentControllers from '@/modules/content/controllers';
import { Configure } from '@/modules/core/configure';
import { NoticeController } from '@/modules/notice/notice.controller';
import { ApiVersionOption } from '@/modules/restful/types';
import * as userControllers from '@/modules/user/controllers';
import { WsController } from '@/modules/ws/ws.controller';

export const v1 = async (configure: Configure): Promise<ApiVersionOption> => ({
    routes: [
        {
            name: 'app',
            path: '/',
            controllers: [],
            doc: {
                title: 'miint应用接口',
                description: 'miint系统的应用接口',
                tags: [
                    { name: '帖子', description: '帖子的增删查改操作' },
                    { name: '分类', description: '分类的增删查改操作' },
                    { name: '评论', description: '评论的增删查操作' },
                    { name: '标签', description: '标签的增删改查操作' },
                    { name: '举报', description: '举报的增删改查操作' },
                    {
                        name: '账户操作',
                        description: '用户登录后对账户进行的更改密码,换绑邮箱等一系列操作',
                    },
                    { name: 'Auth操作', description: '用户登录,登出,注册,发送找回密码等操作' },
                    { name: '通知消息', description: '系统消息通知' },
                    { name: '聊天', description: '聊天' }
                ],
                auth: true,
            },
            children: [
                {
                    name: 'content',
                    path: 'content',
                    controllers: Object.values(contentControllers),
                },
                {
                    name: 'user',
                    path: 'user',
                    controllers: Object.values(userControllers),
                },
                {
                    name: 'notice',
                    path: 'notice',
                    controllers: [NoticeController],
                },
                {
                    name: 'chat',
                    path: 'chat',
                    controllers: [WsController],
                }
            ],
        },
        {
            name: 'manage',
            path: 'manage',
            controllers: [],
            doc: {
                title: '管理接口',
                description: '后台管理面板接口',
                tags: [
                    { name: '分类', description: '分类的增删查改操作' },
                    { name: '文章', description: '文章的增删查改操作' },
                    { name: '评论', description: '评论的增删查操作' },
                ],
            },
            children: [
                {
                    name: 'content',
                    path: 'content',
                    controllers: Object.values(userControllers),
                },
            ],
        },
    ],
});
