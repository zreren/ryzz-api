import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PostCreatedEvent } from '../events/postCreated.event';

@Injectable()
export class PostListener {
    @OnEvent('post.created')
    handlePostCreatedEvent(payload: PostCreatedEvent) {
        console.log(`post ${payload.post_id} created`);
    }
}
