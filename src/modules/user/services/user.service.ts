import { ForbiddenException, Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { isNil, isArray, omit } from 'lodash';
import { EntityNotFoundError, In, SelectQueryBuilder } from 'typeorm';

import { Configure } from '@/modules/core/configure';
import { BaseService } from '@/modules/database/base';
import { manualPaginateWithItems } from '@/modules/database/helpers';
import { QueryHook } from '@/modules/database/types';
import { SystemRoles } from '@/modules/rbac/constants';
import { RoleRepository } from '@/modules/rbac/repositories';

import { ListQueryDto } from '@/modules/restful/dtos';

import { UpdateAccountDto, UpdatePasswordDto } from '../dtos/account.dto';
import { CreateUserDto, QueryUserDto, UpdateUserDto } from '../dtos/user.dto';
import { UserBanEntity } from '../entities';
import { UserEntity } from '../entities/user.entity';
import { FollowEvent, UnfollowEvent } from '../events';
import { decrypt, encrypt, getUserConfig } from '../helpers';
import { UserRepository } from '../repositories/user.repository';
import { UserConfig } from '../types';

import { FollowService } from './follow.service';

interface FollowUser {
    user: UserEntity;
    timestamp: number;
}

/**
 * 用户管理服务
 */
@Injectable()
export class UserService extends BaseService<UserEntity, UserRepository> implements OnModuleInit {
    protected enable_trash = true;

    constructor(
        protected readonly userRepository: UserRepository,
        protected roleRepository: RoleRepository,
        protected configure: Configure,
        protected readonly followService: FollowService,
        protected readonly eventEmitter: EventEmitter2,
    ) {
        super(userRepository);
    }

    async onModuleInit() {
        if (!this.configure.get<boolean>('app.server', true)) return null;
        const adminConf = await getUserConfig<UserConfig['super']>('super');
        const admin = await this.findOneByCredential(adminConf.username);
        if (!isNil(admin)) {
            if (!admin.isCreator) {
                await UserEntity.save({ id: admin.id, isCreator: true });
                return this.findOneByCredential(adminConf.username);
            }
            return admin;
        }
        return this.create({ ...adminConf, isCreator: true } as any);
    }

    /**
     * 创建用户
     * @param data
     */
    async create({ roles, permissions, ...data }: CreateUserDto) {
        data.password = await encrypt(data.password);
        const user = await this.userRepository.save(omit(data, ['isCreator']), { reload: true });
        if (isArray(roles) && roles.length > 0) {
            await this.userRepository
                .createQueryBuilder('user')
                .relation('roles')
                .of(user)
                .add(roles);
        }
        if (isArray(permissions) && permissions.length > 0) {
            await this.userRepository
                .createQueryBuilder('user')
                .relation('permissions')
                .of(user)
                .add(permissions);
        }
        await this.syncActived(await this.detail(user.id));
        return this.detail(user.id);
    }

    /**
     * 更新用户
     * @param data
     */
    async update({ id, roles, permissions, reward, balance, ...data }: UpdateUserDto) {
        if (!isNil(reward) || !isNil(balance)) {
            const old = await this.detail(id);
            if (!isNil(reward)) {
                old.earned += reward;
                old.redeemed += reward;
                if (old.redeemed > old.earned) old.redeemed = old.earned;
            }
            if (!isNil(balance)) {
                old.redeemed = old.redeemed - balance > 0 ? old.redeemed - balance : 0;
            }
            (data as any).earned = old.earned;
            (data as any).redeemed = old.redeemed;
        }
        const user = await this.userRepository.save(omit(data, ['isCreator']), { reload: true });
        const detail = await this.detail(user.id);
        if (isArray(roles) && roles.length > 0) {
            await this.userRepository
                .createQueryBuilder('user')
                .relation('roles')
                .of(detail)
                .addAndRemove(roles, detail.roles ?? []);
        }
        if (isArray(permissions) && permissions.length > 0) {
            await this.userRepository
                .createQueryBuilder('user')
                .relation('permissions')
                .of(user)
                .addAndRemove(permissions, detail.permissions ?? []);
        }
        await this.syncActived(await this.detail(user.id));
        return this.detail(user.id);
    }

    async delete(items: string[], trash = true) {
        const users = await this.repository.find({
            where: { id: In(items) },
            withDeleted: true,
        });
        for (const user of users) {
            if (user.isCreator)
                throw new ForbiddenException('Can not delete first super admin user!');
        }

        if (!trash) return this.repository.remove(users);

        const directs = users.filter((item) => !isNil(item.deletedAt));
        const softs = users.filter((item) => isNil(item.deletedAt));

        return [
            ...(await this.repository.remove(directs)),
            ...(await this.repository.softRemove(softs)),
        ];
    }

    /**
     * 更新昵称
     * @param user
     * @param param1
     */
    async updateNickname(user: UserEntity, { nickname }: UpdateAccountDto) {
        user.nickname = nickname;
        await this.userRepository.save(user);
        return this.detail(user.id);
    }

    /**
     * 更新用户密码
     * @param user
     * @param param1
     */
    async updatePassword(user: UserEntity, { password, oldPassword }: UpdatePasswordDto) {
        const item = await this.userRepository.findOneOrFail({
            select: ['password'],
            where: { id: user.id },
        });
        if (decrypt(item.password, oldPassword))
            throw new ForbiddenException('old password not matched');
        item.password = await encrypt(password);
        await this.userRepository.save(item);
        return this.detail(item.id);
    }

    /**
     * 根据用户用户凭证查询用户
     * @param credential
     * @param callback
     */
    async findOneByCredential(credential: string, callback?: QueryHook<UserEntity>) {
        let query = this.userRepository.buildBaseQB();
        if (callback) {
            query = await callback(query);
        }
        return query
            .where('user.username = :credential', { credential })
            .orWhere('user.email = :credential', { credential })
            .orWhere('user.phone = :credential', { credential })
            .getOne();
    }

    /**
     * 根据对象条件查找用户,不存在则抛出异常
     * @param condition
     * @param callback
     */
    async findOneByCondition(condition: { [key: string]: any }, callback?: QueryHook<UserEntity>) {
        let query = this.userRepository.buildBaseQB();
        if (callback) {
            query = await callback(query);
        }
        const wheres = Object.fromEntries(
            Object.entries(condition).map(([key, value]) => [key, value]),
        );
        const user = query.where(wheres).getOne();
        if (!user) {
            throw new EntityNotFoundError(UserEntity, Object.keys(condition).join(','));
        }
        return user;
    }

    async getCurrentUser(user?: ClassToPlain<UserEntity>): Promise<UserEntity> {
        return this.userRepository.findOneOrFail({ where: { id: user.id } });
    }

    /**
     * 关注
     * @param user
     * @param user_id
     */
    async follow(user: UserEntity, user_id: string) {
        const success = await this.followService.follow(user.id, user_id);
        if (success) {
            this.eventEmitter.emit(
                'user.follow',
                new FollowEvent({
                    user_id: user.id,
                    target_user_id: user_id,
                }),
            );
        }
        return success;
    }

    /**
     * 取关
     * @param user
     * @param user_id
     */
    async unfollow(user: UserEntity, user_id: string) {
        const success = await this.followService.unfollow(user.id, user_id);
        if (success) {
            this.eventEmitter.emit(
                'user.unfollow',
                new UnfollowEvent({
                    user_id: user.id,
                    target_user_id: user_id,
                }),
            );
        }
        return success;
    }

    /**
     * 用户粉丝列表分页数据
     * @param queryDto 分页条件
     * @param user_id 用户ID
     */
    async getFollowers(queryDto: ListQueryDto, user_id: string) {
        return this.getFollowList(user_id, queryDto.page, queryDto.limit, 'follower');
    }

    /**
     * 用户关注列表分页数据
     * @param queryDto 分页条件
     * @param user_id 用户ID
     */
    async getFollowings(queryDto: ListQueryDto, user_id: string) {
        return this.getFollowList(user_id, queryDto.page, queryDto.limit);
    }

    async getFollowList(user_id: string, page = 1, limit = 10, type = 'following') {
        const followUserIds =
            type === 'following'
                ? await this.followService.getFollowings(user_id, page, limit)
                : await this.followService.getFollowers(user_id, page, limit);
        const data: FollowUser[] = [];
        const mapData = new Map();
        followUserIds.forEach((v, k) => {
            if (k % 2 !== 0) {
                const uid = followUserIds[k - 1];
                mapData.set(uid, v);
            }
        });
        if (mapData.size > 0) {
            const userIds = Array.from(mapData.keys());
            const users = await this.userRepository.find({
                where: { id: In(userIds) },
                select: ['id', 'nickname', 'avatar'],
            });
            users.forEach((user) => {
                data.push({
                    user: user as UserEntity,
                    timestamp: mapData.get(user.id),
                } as FollowUser);
            });
        }
        const totalItems =
            type === 'following'
                ? await this.followService.getFollowingCount(user_id)
                : await this.followService.getFollowerCount(user_id);
        return manualPaginateWithItems({ page, limit }, data, totalItems);
    }

    /**
     * 拉黑
     * @param user
     * @param banedUserId
     */
    async ban(user: UserEntity, banedUserId: string) {
        const banedUser = await UserEntity.findOneBy({ id: banedUserId });
        if (isNil(banedUser) || user === banedUser) {
            return;
        }
        UserBanEntity.createQueryBuilder(UserBanEntity.name)
            .insert()
            .orIgnore()
            .updateEntity(false)
            .values({
                user,
                baned_user: banedUser,
                create_time: Date.now() / 1000,
            })
            .execute();
    }

    /**
     * 取消拉黑
     * @param userId
     * @param banedUserId
     */
    async cancelBan(userId: string, banedUserId: string) {
        UserBanEntity.createQueryBuilder(UserBanEntity.name)
            .delete()
            .where('userId = :userId AND banedUserId = :banedUserId', { userId, banedUserId })
            .execute();
    }

    /**
     * 根据用户的actived字段同步角色和权限
     * @param user
     */
    protected async syncActived(user: UserEntity) {
        const roleRelation = this.userRepository.createQueryBuilder().relation('roles').of(user);
        const permissionRelation = this.userRepository
            .createQueryBuilder()
            .relation('permissions')
            .of(user);
        if (user.actived) {
            const roleNames = (user.roles ?? []).map(({ name }) => name);
            const noRoles =
                roleNames.length <= 0 ||
                (!roleNames.includes(SystemRoles.USER) && !roleNames.includes(SystemRoles.ADMIN));
            const isSuperAdmin = roleNames.includes(SystemRoles.ADMIN);

            // 为普通用户添加custom-user角色
            // 为超级管理员添加super-admin角色
            if (noRoles) {
                const customRole = await this.roleRepository.findOne({
                    relations: ['users'],
                    where: { name: SystemRoles.USER },
                });
                if (!isNil(customRole)) await roleRelation.add(customRole);
            } else if (isSuperAdmin) {
                const adminRole = await this.roleRepository.findOne({
                    relations: ['users'],
                    where: { name: SystemRoles.ADMIN },
                });
                if (!isNil(adminRole)) await roleRelation.addAndRemove(adminRole, user.roles);
            }
        } else {
            // 清空禁用用户的角色和权限
            await roleRelation.remove((user.roles ?? []).map(({ id }) => id));
            await permissionRelation.remove((user.permissions ?? []).map(({ id }) => id));
        }
    }

    protected async buildListQB(
        queryBuilder: SelectQueryBuilder<UserEntity>,
        options: QueryUserDto,
        callback?: QueryHook<UserEntity>,
    ) {
        const { actived, orderBy } = options;
        const qb = await super.buildListQB(queryBuilder, options, callback);
        if (actived !== undefined && typeof actived === 'boolean') {
            qb.andWhere('actived = :actived', { actived });
        }
        if (!isNil(options.role)) {
            qb.andWhere('roles.id IN (:...roles)', {
                roles: [options.role],
            });
        }
        if (!isNil(options.permission)) {
            qb.andWhere('permissions.id IN (:...permissions)', {
                permissions: [options.permission],
            });
        }
        if (orderBy) qb.orderBy(`user.${orderBy}`, 'ASC');
        return qb;
    }
}
