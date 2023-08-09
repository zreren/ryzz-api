import { Type } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    ManyToOne,
    UpdateDateColumn,
} from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

import { UserEntity } from '@/modules/user/entities';

import { ReportStatus } from '../constants';

import { CommentEntity } from './comment.entity';
import { PostEntity } from './post.entity';

@Entity('content_reports')
export class ReportEntity extends BaseEntity {
    @ManyToOne(() => UserEntity, (user) => user.reporters, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @Index('idx_uid')
    reporter: UserEntity;

    @ManyToOne(() => PostEntity, (post) => post.reports)
    post: PostEntity;

    @ManyToOne(() => CommentEntity, (comment) => comment.reports)
    comment: CommentEntity;

    @ManyToOne(() => UserEntity, (user) => user.reports)
    user: UserEntity;

    @Column({
        comment: '举报内容',
        default: '',
    })
    content: string;

    @Column({
        comment: '处理状态',
        type: 'enum',
        enum: ReportStatus,
        default: ReportStatus.HANDLING,
    })
    status: ReportStatus;

    @Column({
        comment: '处理结果',
        default: '',
    })
    result: string;

    @Type(() => Date)
    @CreateDateColumn({
        comment: '创建时间',
    })
    createdAt: Date;

    @Type(() => Date)
    @UpdateDateColumn({
        comment: '更新时间',
    })
    updatedAt: Date;

    @Type(() => Date)
    @DeleteDateColumn({
        comment: '删除时间',
    })
    deletedAt: Date;
}
