import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { CommentEntity } from '../entities';
import { CancelCommentLikeEvent, CommentLikeEvent } from '../events';
import { CommentPublishedEvent } from '../events/commentPublished.event';

@Injectable()
export class CommentListener {
    @OnEvent('comment.published')
    async handleComment(payload: CommentPublishedEvent) {
        console.log(payload);
        payload.root_comment_id &&
            CommentEntity.createQueryBuilder(CommentEntity.name)
                .where('id = :id', { id: payload.root_comment_id })
                .update(CommentEntity)
                .set({
                    replyCount: () => 'replyCount + 1',
                })
                .execute();
    }

    @OnEvent('comment.like')
    handleCommentLikeEvent(payload: CommentLikeEvent) {
        console.log(`comment ${payload.comment_id} like`);
        CommentEntity.createQueryBuilder(CommentEntity.name)
            .where('id = :id', { id: payload.comment_id })
            .update(CommentEntity)
            .set({
                likeCount: () => 'likeCount + 1',
            })
            .execute();
    }

    @OnEvent('comment.cancelLike')
    handlePostCancelLikeEvent(payload: CancelCommentLikeEvent) {
        console.log(`comment ${payload.comment_id} cancelLike`);
        CommentEntity.createQueryBuilder(CommentEntity.name)
            .where('id = :id', { id: payload.comment_id })
            .where('likeCount > :count', { count: 0 })
            .update(CommentEntity)
            .set({
                likeCount: () => 'likeCount - 1',
            })
            .execute();
    }
}
