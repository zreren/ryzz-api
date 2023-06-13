export class CancelPostLikeEvent {
    post_id: string;

    user_id: string;

    public constructor(init?: Partial<CancelPostLikeEvent>) {
        Object.assign(this, init);
    }
}
