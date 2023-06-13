import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CommentEntity, PostEntity } from '../content/entities';
import { PostCollectEvent, PostLikeEvent } from '../content/events';
import { CommentPublishedEvent } from '../content/events/commentPublished.event';
import { UserEntity } from '../user/entities';
import { FollowEvent } from '../user/events';

import { NoticeEntity } from './entities/notice.entity';
import { NoticeTypes } from './types';

@Injectable()
export class NoticeListener {
    @OnEvent('user.follow')
    async handleFollow(payload: FollowEvent) {
        console.log('follow');
        NoticeEntity.save({
            operator: await UserEntity.findOneBy({ id: payload.user_id }),
            user: await UserEntity.findOneBy({ id: payload.target_user_id }),
            type: NoticeTypes.FOLLOW,
        });
    }

    @OnEvent('post.like')
    async handleLike(payload: PostLikeEvent) {
        console.log('like');
        NoticeEntity.save({
            operator: await UserEntity.findOneBy({ id: payload.target_user_id }),
            user: await UserEntity.findOneBy({ id: payload.user_id }),
            type: NoticeTypes.LIKE,
            post: await PostEntity.findOneBy({ id: payload.post_id }),
        });
    }

    @OnEvent('post.collect')
    async handleCollect(payload: PostCollectEvent) {
        console.log('collect');
        NoticeEntity.save({
            user: await UserEntity.findOneBy({ id: payload.user_id }),
            operator: await UserEntity.findOneBy({ id: payload.target_user_id }),
            type: NoticeTypes.COLLECT,
            post: await PostEntity.findOneBy({ id: payload.post_id }),
        });
    }

    @OnEvent('comment.published')
    async handleComment(payload: CommentPublishedEvent) {
        console.log('comment');
        NoticeEntity.save({
            user: await UserEntity.findOneBy({ id: payload.target_user_id }),
            operator: await UserEntity.findOneBy({ id: payload.user_id }),
            type: NoticeTypes.COLLECT,
            comment: await CommentEntity.findOneBy({ id: payload.comment_id }),
        });
    }
}
