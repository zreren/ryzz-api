import { Injectable } from '@nestjs/common';

import { RedisService } from '@/modules/core/providers/redis.service';

@Injectable()
export class FollowService {
    constructor(private readonly redisService: RedisService) {}

    private prefixFollowerKey(): string {
        return 'follower:';
    }

    private prefixFollowingKey(): string {
        return 'following:';
    }

    // 关注
    async follow(user_id: string, target_user_id: string) {
        const followerKey = this.prefixFollowerKey() + target_user_id;
        const followingKey = this.prefixFollowingKey() + user_id;
        const currentTimestamp = Date.now();
        this.redisService.getClient().zadd(followerKey, currentTimestamp, user_id);
        this.redisService.getClient().zadd(followingKey, currentTimestamp, target_user_id);
    }

    // 取关
    async unfollow(user_id: string, target_user_id: string) {
        const followerKey = this.prefixFollowerKey() + target_user_id;
        const followingKey = this.prefixFollowingKey() + user_id;
        this.redisService.getClient().zrem(followerKey, user_id);
        this.redisService.getClient().zrem(followingKey, target_user_id);
    }

    // 粉丝列表
    async getFollowers(user_id: string, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const key = this.prefixFollowerKey() + user_id;
        return this.redisService
            .getClient()
            .zrevrangebyscore(key, Number.MAX_VALUE, 0, 'WITHSCORES', 'LIMIT', offset, limit);
    }

    // 关注列表
    async getFollowings(user_id: string, page = 1, limit = 20): Promise<string[]> {
        const offset = (page - 1) * limit;
        const key = this.prefixFollowingKey() + user_id;
        return this.redisService
            .getClient()
            .zrevrangebyscore(key, Number.MAX_VALUE, 0, 'WITHSCORES', 'LIMIT', offset, limit);
    }

    // 粉丝数
    async getFollowerCount(user_id: string): Promise<number> {
        const key = this.prefixFollowerKey() + user_id;
        return this.redisService.getClient().zcard(key);
    }

    // 关注数
    async getFollowingCount(user_id: string): Promise<number> {
        const key = this.prefixFollowingKey() + user_id;
        return this.redisService.getClient().zcard(key);
    }
}
