import { Injectable } from '@nestjs/common';

import { isNil } from 'lodash';

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
    async follow(user_id: string, target_user_id: string): Promise<boolean> {
        const followerKey = this.prefixFollowerKey() + target_user_id;
        const followingKey = this.prefixFollowingKey() + user_id;
        const currentTimestamp = Date.now();
        const script = `
            if redis.call('ZSCORE', KEYS[1], KEYS[3]) == false 
                then 
                    redis.call('ZADD', KEYS[1], KEYS[2], KEYS[3]) 
                    return 1
            else
                return 0
            end`;
        this.redisService.getClient().eval(script, 3, followerKey, currentTimestamp, user_id);
        return (
            (await this.redisService
                .getClient()
                .eval(script, 3, followingKey, currentTimestamp, target_user_id)) === 1
        );
    }

    // 取关
    async unfollow(user_id: string, target_user_id: string): Promise<boolean> {
        const followerKey = this.prefixFollowerKey() + target_user_id;
        const followingKey = this.prefixFollowingKey() + user_id;
        this.redisService.getClient().zrem(followerKey, user_id);
        return (await this.redisService.getClient().zrem(followingKey, target_user_id)) === 1;
    }

    // 粉丝列表
    async getFollowers(user_id: string, page = 1, limit = 20, withScores = true) {
        const offset = (page - 1) * limit;
        const key = this.prefixFollowerKey() + user_id;
        const redisClient = this.redisService.getClient();
        return withScores
            ? redisClient.zrevrangebyscore(
                  key,
                  Number.MAX_VALUE,
                  0,
                  'WITHSCORES',
                  'LIMIT',
                  offset,
                  limit,
              )
            : redisClient.zrevrangebyscore(key, Number.MAX_VALUE, 0, 'LIMIT', offset, limit);
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

    // 是否正在关注
    async isFollowing(user_id: string, target_user_id: string): Promise<boolean> {
        const key = this.prefixFollowingKey() + user_id;
        return !isNil(await this.redisService.getClient().zscore(key, target_user_id));
    }
}
