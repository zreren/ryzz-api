export class PostLikeEvent {
    post_id: string;

    user_id: string;

    target_user_id: string;

    created_at: Date;

    public constructor(init?: Partial<PostLikeEvent>) {
        Object.assign(this, init);
    }
}
