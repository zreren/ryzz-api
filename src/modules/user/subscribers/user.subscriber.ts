import { randomBytes } from 'crypto';

import { isNil, toNumber } from 'lodash';

import { EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';

import { App } from '@/modules/core/app';
import { BaseSubscriber } from '@/modules/database/base';
import { SubcriberSetting } from '@/modules/database/types';
import { PermissionEntity, RoleEntity } from '@/modules/rbac/entities';

import { UserEntity } from '../entities/user.entity';
import { encrypt } from '../helpers';

/**
 * 用户模型监听器
 */
@EventSubscriber()
export class UserSubscriber extends BaseSubscriber<UserEntity> {
    protected entity = UserEntity;

    protected setting: SubcriberSetting = {
        trash: true,
    };

    /**
     * 生成不重复的随机用户名
     * @param event
     */
    protected async generateUserName(event: InsertEvent<UserEntity>): Promise<string> {
        const username = `user_${randomBytes(4).toString('hex').slice(0, 8)}`;
        const user = await event.manager.findOne(UserEntity, {
            where: { username },
        });
        return !user ? username : this.generateUserName(event);
    }

    /**
     * 自动生成唯一用户名和密码
     * @param event
     */
    async beforeInsert(event: InsertEvent<UserEntity>) {
        // 自动生成唯一用户名
        if (!event.entity.username) {
            event.entity.username = await this.generateUserName(event);
        }
        // 自动生成密码
        if (!event.entity.password) {
            event.entity.password = randomBytes(11).toString('hex').slice(0, 22);
        }
        // 自动加密密码(事件触发有异常，暂时直接在UserService哈希处理)
        // event.entity.password = await encrypt(event.entity.password);
        if (isNil(event.entity.redeemed))
            event.entity.redeemed = await App.configure.get<number>('coupon.register', 15);
        if (isNil(event.entity.earned) || event.entity.earned < event.entity.redeemed)
            event.entity.earned = event.entity.redeemed;
    }

    /**
     * 当密码更改时加密密码
     * @param event
     */
    async beforeUpdate(event: UpdateEvent<UserEntity>) {
        if (this.isUpdated('password', event)) {
            event.entity.password = encrypt(event.entity.password);
        }
        if (event.entity.earned < event.entity.redeemed) {
            event.entity.earned = event.entity.redeemed;
        }
    }

    async afterLoad(entity: UserEntity): Promise<void> {
        let permissions = (entity.permissions ?? []) as PermissionEntity[];
        for (const role of entity.roles ?? []) {
            const roleEntity = await RoleEntity.findOneOrFail({
                relations: ['permissions'],
                where: { id: role.id },
            });
            permissions = [...permissions, ...(roleEntity.permissions ?? [])];
        }
        entity.permissions = permissions.reduce((o, n) => {
            if (o.find(({ name }) => name === n.name)) return o;
            return [...o, n];
        }, []);
        const couponValue = await App.configure.get<number>('coupon.value', 15);
        if (entity.redeemed && entity.redeemed > 0) {
            entity.coupons = Array(Math.floor(entity.redeemed / couponValue)).fill(couponValue);
            if (Math.abs(entity.redeemed % couponValue) !== 0) {
                entity.coupons.push(toNumber(Math.abs(entity.redeemed % couponValue).toFixed(2)));
            }
        }
    }
}
