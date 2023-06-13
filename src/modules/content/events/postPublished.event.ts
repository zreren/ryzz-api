export class PostPublishedEvent {
    post_id: string;

    user_id: string;

    publish_time: string;

    public constructor(init?: Partial<PostPublishedEvent>) {
        Object.assign(this, init);
    }
}
