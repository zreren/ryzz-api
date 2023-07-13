export class PostPublishedEvent {
    post_id: string;

    user_id: string;

    publish_time: number;

    public constructor(init?: Partial<PostPublishedEvent>) {
        Object.assign(this, init);
    }
}
