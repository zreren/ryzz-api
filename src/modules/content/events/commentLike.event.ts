export class CommentLikeEvent {
    comment_id: string;

    user_id: string;

    target_user_id: string;

    created_at: Date;

    public constructor(init?: Partial<CommentLikeEvent>) {
        Object.assign(this, init);
    }
}
