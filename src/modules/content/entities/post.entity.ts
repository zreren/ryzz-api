import { Exclude, Expose, Type } from 'class-transformer';
import {
    AfterLoad,
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

import { MediaEntity } from '@/modules/media/entities';
import { UserEntity } from '@/modules/user/entities';

import { Countries, PostType } from '../constants';

import { CategoryEntity } from './category.entity';
import { CommentEntity } from './comment.entity';
import { PostLikeEntity } from './like.entity';
import { PostReportEntity } from './report.entity';
import { TagEntity } from './tag.entity';
import { getCosResourceUrl } from '@/modules/core/helpers';

/**
 * 帖子模型
 */
@Exclude()
@Entity('content_posts')
@Index('idx_country_publishedAt', ['country', 'publishedAt'])
@Index('idx_likeCount_country', ['likeCount', 'country'])
@Index('idx_commentCount_country', ['commentCount', 'country'])
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

    @Column({ comment: '图片列表', type: 'simple-array' })
    imagePaths?: string[];

    @Expose()
    imageUrls?: string[];

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
    commentCount: number;

    @Expose()
    @Type(() => Number)
    @Column({ comment: '点赞数' })
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
    @Type(() => Number)
    @Column({ comment: '详情页浏览数' })
    detailCount: number;

    @Expose()
    @Type(() => String)
    @Column({ comment: 'ip' })
    ip: string;

    @Expose()
    @Column({
        comment: '国家',
        type: 'char',
        default: Countries.BT,
        length: 2,
    })
    country: string;

    @Expose()
    @Column({ comment: '位置' })
    @Type(() => String)
    location: string;

    @Expose()
    @Column({ comment: '经度', type: 'decimal' })
    longitude: number;

    @Expose()
    @Column({ comment: '维度', type: 'decimal' })
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

    @OneToMany((type) => CommentEntity, (comment) => comment.post, {
        cascade: true,
    })
    comments: CommentEntity[];

    @OneToMany((type) => PostReportEntity, (report) => report.post, {
        cascade: true,
    })
    reports: PostReportEntity[];

    @OneToMany(() => MediaEntity, (media) => media.post)
    medias: MediaEntity[];

    @Expose()
    @Type(() => Date)
    @DeleteDateColumn({
        comment: '删除时间',
    })
    deletedAt: Date;

    @AfterLoad()
    async generateImageUrls() {
        this.imageUrls = await Promise.all(this.imagePaths.map((key: string) => getCosResourceUrl(key)));
    }
}
