export class PostDeletedEvent {
    post_id: string;

    user_id: string;

    public constructor(init?: Partial<PostDeletedEvent>) {
        Object.assign(this, init);
    }
}
