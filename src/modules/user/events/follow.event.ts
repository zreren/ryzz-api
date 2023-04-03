export class FollowEvent {
    user_id: string;

    target_user_id: string; // 被关注者uid

    public constructor(init?: Partial<FollowEvent>) {
        Object.assign(this, init);
    }
}
