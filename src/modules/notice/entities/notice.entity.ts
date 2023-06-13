import { Exclude } from 'class-transformer';
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { CommentEntity, PostEntity } from '@/modules/content/entities';
import { UserEntity } from '@/modules/user/entities';

import { NoticeTypes } from '../types';

@Entity('notices')
@Index('idx_user_type_created', ['user', 'type', 'created_at'])
export class NoticeEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity)
    user: UserEntity;

    @ManyToOne(() => UserEntity)
    operator?: UserEntity;

    @Column({ comment: '类型', type: 'enum', enum: NoticeTypes })
    type: NoticeTypes;

    @ManyToOne(() => PostEntity)
    post?: PostEntity;

    @ManyToOne(() => CommentEntity)
    comment?: CommentEntity;

    @Column({ comment: '内容', length: 1000 })
    content?: string;

    @Exclude()
    @Column({ comment: '是否已读' })
    is_read: boolean;

    @Exclude()
    @CreateDateColumn({ comment: '创建日期' })
    created_at: Date;

    @Exclude()
    @DeleteDateColumn()
    deleted_at?: Date;
}
