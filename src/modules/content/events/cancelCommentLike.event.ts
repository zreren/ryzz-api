export class CancelCommentLikeEvent {
    comment_id: string;

    user_id: string;

    public constructor(init?: Partial<CancelCommentLikeEvent>) {
        Object.assign(this, init);
    }
}
