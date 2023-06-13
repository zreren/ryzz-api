export class PostCollectEvent {
    user_id: string;

    target_user_id: string;

    post_id: string;

    collect_id: string;

    created_at: Date;

    public constructor(init?: Partial<PostCollectEvent>) {
        Object.assign(this, init);
    }
}
