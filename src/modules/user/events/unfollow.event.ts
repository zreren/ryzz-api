export class UnfollowEvent {
    user_id: string;

    target_user_id: string; // 被关注者uid

    public constructor(init?: Partial<UnfollowEvent>) {
        Object.assign(this, init);
    }
}
