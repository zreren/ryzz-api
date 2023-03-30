import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PostCreatedEvent } from '../events/postCreated.event';
import { PostDeletedEvent } from '../events/postDeleted.event';

@Injectable()
export class FeedListener {
    @OnEvent('post.created')
    handlePostCreatedEvent(payload: PostCreatedEvent) {
        console.log(`post ${payload.post_id} created`);
    }

    @OnEvent('post.deleted')
    handlePostDeletedEvent(payload: PostDeletedEvent) {
        console.log(`post ${payload.post_id} deleted`);
    }
}
