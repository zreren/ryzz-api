import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { FollowEvent } from '@/modules/user/events';

import { PostDeletedEvent } from '../events/postDeleted.event';
import { PostPublishedEvent } from '../events/postPublished.event';
import { FeedService } from '../services';

@Injectable()
export class FeedListener {
    constructor(private readonly feedService: FeedService) {}

    @OnEvent('post.published')
    handlePostPublishedEvent(payload: PostPublishedEvent) {
        // todo 异步
        console.log(`post ${payload.post_id} created`);
        this.feedService.postPublish(payload.post_id);
    }

    @OnEvent('post.deleted')
    handlePostDeletedEvent(payload: PostDeletedEvent) {
        console.log(`post ${payload.post_id} deleted`);
        this.feedService.postDelete(payload.post_id);
    }

    @OnEvent('user.follow')
    handleFollowEvent(payload: FollowEvent) {
        // todo 异步
        console.log(`user ${payload.user_id} followed user ${payload.target_user_id}`);
        this.feedService.userFollow(payload.user_id, payload.target_user_id);
    }

    @OnEvent('user.unfollow')
    handleUnfollowEvent(payload: FollowEvent) {
        // todo 异步
        console.log(`user ${payload.user_id} unfollowed user ${payload.target_user_id}`);
        this.feedService.userUnfollow(payload.user_id, payload.target_user_id);
    }
}
