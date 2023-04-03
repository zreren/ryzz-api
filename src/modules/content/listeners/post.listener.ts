import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PostEntity } from '../entities';
import {
    CancelPostCollectEvent,
    CancelPostLikeEvent,
    PostCollectEvent,
    PostLikeEvent,
} from '../events';
import { PostPublishedEvent } from '../events/postPublished.event';

@Injectable()
export class PostListener {
    @OnEvent('post.created')
    handlePostPublishedEvent(payload: PostPublishedEvent) {
        console.log(`post ${payload.post_id} created`);
    }

    @OnEvent('post.like')
    handlePostLikeEvent(payload: PostLikeEvent) {
        console.log(`post ${payload.post_id} like`);
        PostEntity.createQueryBuilder(PostEntity.name)
            .where('id = :id', { id: payload.post_id })
            .update(PostEntity)
            .set({
                likeCount: () => 'likeCount + 1',
            })
            .execute();
    }

    @OnEvent('post.cancelLike')
    handlePostCancelLikeEvent(payload: CancelPostLikeEvent) {
        console.log(`post ${payload.post_id} cancelLike`);
        PostEntity.createQueryBuilder(PostEntity.name)
            .where('id = :id', { id: payload.post_id })
            .where('likeCount > :count', { count: 0 })
            .update(PostEntity)
            .set({
                likeCount: () => 'likeCount - 1',
            })
            .execute();
    }

    @OnEvent('post.collect')
    handlePostCollectEvent(payload: PostCollectEvent) {
        console.log(`post ${payload.post_id} collect`);
        PostEntity.createQueryBuilder(PostEntity.name)
            .where('id = :id', { id: payload.post_id })
            .update(PostEntity)
            .set({
                collectCount: () => 'collectCount + 1',
            })
            .execute();
    }

    @OnEvent('post.cancelCollect')
    handlePostCancelCollectEvent(payload: CancelPostCollectEvent) {
        console.log(`post ${payload.post_id} cancelCollect`);
        PostEntity.createQueryBuilder(PostEntity.name)
            .where('id = :id', { id: payload.post_id })
            .where('collectCount > :count', { count: 0 })
            .update(PostEntity)
            .set({
                collectCount: () => 'collectCount - 1',
            })
            .execute();
    }
}
