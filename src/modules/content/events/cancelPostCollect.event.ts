export class CancelPostCollectEvent {
    post_id: string;

    collect_id: string;

    public constructor(init?: Partial<CancelPostCollectEvent>) {
        Object.assign(this, init);
    }
}
