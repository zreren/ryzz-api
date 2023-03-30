import { Injectable } from '@nestjs/common';

@Injectable()
export class PostDeletedEvent {
    post_id: number;

    user_id: number;
}
