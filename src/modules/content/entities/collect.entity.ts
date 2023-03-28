import { Exclude, Expose, Type } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    ManyToMany,
    ManyToOne,
    UpdateDateColumn,
} from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

import { UserEntity } from '@/modules/user/entities';

import { PostEntity } from './post.entity';

/**
 * 收藏夹模型
 */
@Exclude()
@Entity('content_collects')
export class CollectEntity extends BaseEntity {
    @Expose()
    @ManyToOne(() => UserEntity, (user) => user.collects, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @Index('idx_uid')
    user: UserEntity;

    @Expose()
    @ManyToMany((type) => PostEntity, (post) => post.collects)
    posts: PostEntity[];

    @Expose()
    @Column({ comment: '收藏夹名称' })
    @Index({ fulltext: true })
    title: string;

    @Expose()
    @Type(() => Date)
    @CreateDateColumn({
        comment: '创建时间',
    })
    createdAt: Date;

    @Expose()
    @Type(() => Date)
    @UpdateDateColumn({
        comment: '更新时间',
    })
    updatedAt: Date;

    @Expose()
    @Type(() => Date)
    @DeleteDateColumn({
        comment: '删除时间',
    })
    deletedAt: Date;
}
