import { Injectable } from '@nestjs/common';

@Injectable()
export class PostCreatedEvent {
    post_id: number;

    user_id: number;

    publish_time: number;
}
