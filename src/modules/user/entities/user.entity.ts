import { Exclude, Expose, Type } from 'class-transformer';

import {
    AfterLoad,
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { AddRelations } from '@/modules/database/decorators/dynamic-relation.decorator';
import { DynamicRelation } from '@/modules/database/types';
import { PermissionEntity, RoleEntity } from '@/modules/rbac/entities';
import { getUserConfig } from '@/modules/user/helpers';

import { UserBanEntity } from './user-bans.entity';
import { getCosResourceUrl, getDefaultAvatar } from '@/modules/core/helpers';

/**
 * 用户模型
 */
@AddRelations(async () => getUserConfig<DynamicRelation[]>('relations'))
@Exclude()
@Entity('users')
export class UserEntity extends BaseEntity {
    [key: string]: any;

    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Expose()
    @Column({
        comment: '姓名',
        nullable: true,
    })
    nickname?: string;

    @Expose()
    @Column({ comment: '用户名', unique: true })
    username!: string;

    @Column({ comment: '密码', length: 500, select: false })
    password!: string;

    @Expose({ groups: ['user-detail', 'user-list'] })
    @Column({ comment: '手机号', nullable: true, unique: true })
    phone?: string;

    @Expose({ groups: ['user-detail', 'user-list'] })
    @Column({ comment: '邮箱', nullable: true, unique: true })
    email?: string;

    @Expose()
    @Column({ comment: '用户状态,是否激活', default: true })
    actived?: boolean;

    @Expose()
    @Column({ comment: '是否是创始人', default: false })
    isCreator?: boolean;

    @Expose()
    @Type(() => Date)
    @CreateDateColumn({
        comment: '用户创建时间',
    })
    createdAt!: Date;

    @Expose()
    @Type(() => Date)
    @UpdateDateColumn({
        comment: '用户更新时间',
    })
    updatedAt!: Date;

    @Expose({ groups: ['user-detail', 'user-list'] })
    @Expose()
    @Type(() => Date)
    @DeleteDateColumn({
        comment: '删除时间',
    })
    deletedAt!: Date;

    @Expose({ groups: ['user-detail', 'user-list'] })
    trashed!: boolean;

    @Column({ comment: '头像路径' })
    avatarPath: string;

    @Expose()
    avatarUrl: string;

    @Expose()
    @ManyToMany(() => RoleEntity, (role) => role.users, { cascade: true })
    roles!: RoleEntity[];

    @Expose()
    @ManyToMany(() => PermissionEntity, (permisson) => permisson.users, {
        cascade: true,
    })
    permissions!: PermissionEntity[];

    @Expose()
    @OneToMany(() => UserBanEntity, (bans) => bans.baned_user)
    @JoinTable()
    bans: UserEntity[];

    @AfterLoad()
    async generateAvatarUrl() {
        this.avatarUrl = this.avatarPath ? await getCosResourceUrl(this.avatarPath) : await getDefaultAvatar();
    }
}
