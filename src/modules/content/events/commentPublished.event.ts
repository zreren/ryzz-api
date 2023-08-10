export class CommentPublishedEvent {
    user_id: string;

    target_user_id: string;

    comment_id: string;

    root_comment_id: string;

    public constructor(init?: Partial<CommentPublishedEvent>) {
        Object.assign(this, init);
    }
}
