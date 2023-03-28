import { Exclude, Expose, Type } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    UpdateDateColumn,
} from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

import { UserEntity } from '@/modules/user/entities';

import { Countries, PostType } from '../constants';

import { CategoryEntity } from './category.entity';
import { CollectEntity } from './collect.entity';
import { CommentEntity } from './comment.entity';
import { PostLikeEntity } from './like.entity';
import { PostReportEntity } from './report.entity';
import { TagEntity } from './tag.entity';

/**
 * 帖子模型
 */
@Exclude()
@Entity('content_posts')
export class PostEntity extends BaseEntity {
    @Expose()
    @ManyToOne(() => UserEntity, (user) => user.posts)
    @Index('idx_uid')
    user: UserEntity;

    @Expose()
    @OneToMany(() => PostLikeEntity, (postLike) => postLike.post)
    post_likes: PostLikeEntity[];

    @Expose()
    @ManyToOne(() => PostEntity, (post) => post.repost, {
        nullable: true,
    })
    @Index('idx_repost')
    repost: PostEntity;

    @Expose()
    @Column({ comment: '帖子标题' })
    @Index({ fulltext: true })
    title: string;

    @Expose({ groups: ['post-detail'] })
    @Column({ comment: '帖子内容', type: 'longtext' })
    @Index({ fulltext: true })
    body: string;

    @Expose()
    @Column({
        comment: '帖子类型',
        type: 'enum',
        enum: PostType,
        default: PostType.NORMAL,
    })
    type: PostType;

    @Expose()
    @Type(() => Number)
    @Column({ comment: '评论数' })
    @Index('idx_comment')
    commentCount: number;

    @Expose()
    @Type(() => Number)
    @Column({ comment: '点赞数' })
    @Index('idx_like')
    likeCount: number;

    @Expose()
    @Type(() => Number)
    @Column({ comment: '转发数' })
    repostCount: number;

    @Expose()
    @Type(() => Number)
    @Column({ comment: '收藏数' })
    collectCount: number;

    @Expose()
    @Type(() => String)
    @Column({ comment: 'ip' })
    ip: string;

    @Expose()
    @Column({
        comment: '国家',
        type: 'enum',
        enum: Countries,
        default: Countries.US,
    })
    @Index('idx_country')
    country: Countries;

    @Expose()
    @Column({ comment: '位置' })
    @Type(() => String)
    location: string;

    @Expose()
    @Column({ comment: '经度', scale: 6 })
    @Type(() => Number)
    longitude: number;

    @Expose()
    @Column({ comment: '维度', scale: 6 })
    @Type(() => Number)
    latitude: number;

    @Expose()
    @Column({
        comment: '发布时间戳',
        type: Number,
        default: 0,
        unsigned: true,
    })
    publishedAt?: number;

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
    @Type(() => CategoryEntity)
    @ManyToMany(() => CategoryEntity, (category) => category.posts, {
        // 在新增帖子时,如果所属分类不存在则直接创建
        cascade: true,
    })
    @JoinTable()
    categories: CategoryEntity[];

    @Expose()
    @ManyToMany(() => TagEntity)
    @JoinTable()
    tags: TagEntity[];

    @Type(() => CollectEntity)
    @ManyToMany(() => CollectEntity, (collect) => collect.posts)
    @JoinTable()
    collects: CollectEntity[];

    @OneToMany((type) => CommentEntity, (comment) => comment.post, {
        cascade: true,
    })
    comments: CommentEntity[];

    @OneToMany((type) => PostReportEntity, (report) => report.post, {
        cascade: true,
    })
    reports: PostReportEntity[];

    @Expose()
    @Type(() => Date)
    @DeleteDateColumn({
        comment: '删除时间',
    })
    deletedAt: Date;
}
