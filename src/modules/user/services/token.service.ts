import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import dayjs from 'dayjs';
import { FastifyReply as Response } from 'fastify';
import jwt from 'jsonwebtoken';
import { isNil } from 'lodash';
import { MoreThanOrEqual } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { getTime } from '@/modules/core/helpers';

import { RedisService } from '@/modules/core/providers/redis.service';

import { REDIS_DB_TOKEN } from '../constants';
import { AccessTokenEntity } from '../entities/access-token.entity';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { UserEntity } from '../entities/user.entity';
import { getUserConfig } from '../helpers';
import { JwtConfig, JwtPayload } from '../types';

/**
 * 令牌服务
 */
@Injectable()
export class TokenService {
    private readonly config: Promise<JwtConfig>;

    constructor(
        protected readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) {
        this.config = getUserConfig('jwt');
    }

    /**
     * 根据accessToken刷新AccessToken与RefreshToken
     * @param accessToken
     * @param response
     */
    async refreshToken(accessToken: AccessTokenEntity, response: Response) {
        const { user, refreshToken } = accessToken;
        if (refreshToken) {
            const now = await getTime();
            // 判断refreshToken是否过期
            if (now.isAfter(refreshToken.expired_at)) return null;
            // 如果没过期则生成新的access_token和refresh_token
            const token = await this.generateAccessToken(user, now);
            await accessToken.remove();
            response.header('token', token.accessToken.value);
            return token;
        }
        return null;
    }

    /**
     * 根据荷载签出新的AccessToken并存入数据库
     * 且自动生成新的Refresh也存入数据库
     * @param user
     * @param now
     */
    async generateAccessToken(user: UserEntity, now: dayjs.Dayjs) {
        const accessTokenPayload: JwtPayload = {
            sub: user.id,
            username: user.username,
            iat: now.unix(),
        };

        const signed = this.jwtService.sign(accessTokenPayload);
        const accessToken = new AccessTokenEntity();
        accessToken.value = signed;
        accessToken.user = user;
        accessToken.expired_at = now.add((await this.config).token_expired, 'second').toDate();
        await accessToken.save();
        const refreshToken = await this.generateRefreshToken(accessToken, await getTime());
        return { accessToken, refreshToken };
    }

    /**
     * 生成新的RefreshToken并存入数据库
     * @param accessToken
     * @param now
     */
    async generateRefreshToken(
        accessToken: AccessTokenEntity,
        now: dayjs.Dayjs,
    ): Promise<RefreshTokenEntity> {
        const refreshTokenPayload = {
            uuid: uuid(),
        };
        const refreshToken = new RefreshTokenEntity();
        refreshToken.value = jwt.sign(refreshTokenPayload, (await this.config).refresh_secret);
        refreshToken.expired_at = now
            .add((await this.config).refresh_token_expired, 'second')
            .toDate();
        refreshToken.accessToken = accessToken;
        await refreshToken.save();
        return refreshToken;
    }

    /**
     * 检查accessToken是否存在
     * @param value
     */
    async checkAccessToken(value: string) {
        return AccessTokenEntity.findOne({
            where: { value, expired_at: MoreThanOrEqual(new Date()) },
            relations: ['user', 'refreshToken'],
        });
    }

    /**
     * 移除AccessToken且自动移除关联的RefreshToken
     * @param value
     */
    async removeAccessToken(value: string) {
        const accessToken = await AccessTokenEntity.findOne({
            where: { value },
        });
        if (accessToken) await accessToken.remove();
    }

    /**
     * 移除RefreshToken
     * @param value
     */
    async removeRefreshToken(value: string) {
        const refreshToken = await RefreshTokenEntity.findOne({
            where: { value },
            relations: ['accessToken'],
        });
        if (refreshToken) {
            if (refreshToken.accessToken) await refreshToken.accessToken.remove();
            await refreshToken.remove();
        }
    }

    /**
     * 验证Token是否正确,如果正确则返回所属用户对象
     * @param token
     */
    async verifyAccessToken(token: AccessTokenEntity) {
        try {
            const result = jwt.verify(token.value, (await this.config).secret);
            if (!result) return false;
        } catch (error) {
            return false;
        }
        return token.user;
    }

    /**
     * 生成token && refresh token(redis)
     * @param user
     * @param now
     */
    async generateAccessTokenRedis(
        userId: string,
        username: string,
        now: dayjs.Dayjs,
    ): Promise<string> {
        const client = this.redisService.getClient();
        client.select(REDIS_DB_TOKEN);
        const accessTokenPayload: JwtPayload = {
            sub: userId,
            username,
            iat: now.unix(),
        };

        const refreshTokenExpireTime = (await this.config).refresh_token_expired;
        const token = this.jwtService.sign(accessTokenPayload);
        const refreshToken = this.jwtService.sign(accessTokenPayload, {
            secret: (await this.config).refresh_secret,
            expiresIn: `${refreshTokenExpireTime}s`,
        });
        client.hmset(token, {
            refreshToken,
            userId,
            username,
        });
        client.expire(token, refreshTokenExpireTime);

        return token;
    }

    /**
     * 刷新token
     * @param token
     */
    async refreshTokenRedis(token: string): Promise<string | null> {
        const client = this.redisService.getClient();
        client.select(REDIS_DB_TOKEN);
        const data = await client.hgetall(token);
        if (isNil(data) || isNil(data.refreshToken)) {
            return null;
        }
        try {
            if (
                isNil(
                    await this.jwtService.verifyAsync(data.refreshToken, {
                        secret: (await this.config).refresh_secret,
                    }),
                )
            ) {
                return null;
            }
        } catch (e) {
            return null;
        }

        client.del(token);
        return this.generateAccessTokenRedis(data.userId, data.username, await getTime());
    }

    checkJwToken(value: string) {
        return this.jwtService.decode(value);
    }
}
