import { Expose, Type } from 'class-transformer';
import { Column, CreateDateColumn, Entity, Index, ManyToOne, UpdateDateColumn } from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

import { UserEntity } from '@/modules/user/entities';

import { ReportStatus } from '../constants';

import { CommentEntity } from './comment.entity';
import { PostEntity } from './post.entity';

class ReportEntity extends BaseEntity {
    @Expose()
    @ManyToOne(() => UserEntity, (user) => user.reporters, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @Index('idx_uid')
    reporter: UserEntity;

    @Expose()
    @Column({
        comment: '举报内容',
        nullable: false,
    })
    content: string;

    @Expose()
    @Column({
        comment: '处理状态',
        type: 'enum',
        enum: ReportStatus,
        default: ReportStatus.HANDLING,
    })
    status: ReportStatus;

    @Expose()
    @Column({
        comment: '处理结果',
        nullable: false,
    })
    result: string;

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
}

@Entity('content_reports_user')
export class UserReportEntity extends ReportEntity {
    @Expose()
    @ManyToOne((type) => UserEntity, (user) => user.reports)
    user: UserEntity;
}

@Entity('content_reports_post')
export class PostReportEntity extends ReportEntity {
    @Expose()
    @ManyToOne((type) => PostEntity, (post) => post.reports)
    post: PostEntity;
}

@Entity('content_reports_comment')
export class CommentReportEntity extends ReportEntity {
    @Expose()
    @ManyToOne((type) => CommentEntity, (comment) => comment.reports)
    comment: CommentEntity;
}
