import { Exclude, Expose, Type } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    Tree,
    UpdateDateColumn,
} from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

/**
 * 树形嵌套标签
 */
@Exclude()
@Tree('materialized-path')
@Entity('content_tags')
export class TagEntity extends BaseEntity {
    @Expose()
    @Column({ comment: '标签名称' })
    @Index('uniq_name', { unique: true })
    name: string;

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
