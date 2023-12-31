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

import { getCosResourceUrl } from '@/modules/core/helpers';
import { BaseEntity } from '@/modules/database/base';

import { MediaEntity } from '@/modules/media/entities';
import { UserEntity } from '@/modules/user/entities';

import { Countries, PostType } from '../constants';

import { CategoryEntity } from './category.entity';
import { CommentEntity } from './comment.entity';
import { PostLikeEntity } from './like.entity';
import { TagEntity } from './tag.entity';

/**
 * 帖子模型
 */
@Exclude()
@Entity('content_posts')
@Index('idx_country_publishedAt', ['country', 'publishedAt'])
@Index('idx_likeCount_country', ['likeCount', 'country'])
@Index('idx_commentCount_country', ['commentCount', 'country'])
export class PostEntity extends BaseEntity {
    [key: string]: any;

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

    @Column({ comment: '图片列表', type: 'simple-array', nullable: true })
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
    @Column({ comment: '评论数', default: 0 })
    commentCount: number;

    @Expose()
    @Type(() => Number)
    @Column({ comment: '点赞数', default: 0 })
    likeCount: number;

    @Expose()
    @Type(() => Number)
    @Column({ comment: '转发数', default: 0 })
    repostCount: number;

    @Expose()
    @Type(() => Number)
    @Column({ comment: '收藏数', default: 0 })
    collectCount: number;

    @Expose()
    @Type(() => Number)
    @Column({ comment: '详情页浏览数', default: 0 })
    detailCount: number;

    @Expose()
    @Type(() => String)
    @Column({ comment: 'ip', default: '' })
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
    @Column({ comment: '位置', default: '' })
    @Type(() => String)
    location: string;

    @Expose()
    @Column({ comment: '经度', type: 'decimal', default: 0 })
    longitude: number;

    @Expose()
    @Column({ comment: '维度', type: 'decimal', default: 0 })
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

    @Column({ comment: '是否草稿', default: false })
    is_draft: boolean;

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

    @OneToMany(() => MediaEntity, (media) => media.post)
    medias: MediaEntity[];

    @Expose()
    @Type(() => Date)
    @DeleteDateColumn({
        comment: '删除时间',
    })
    deletedAt: Date;

    @Expose()
    isLiked = false;

    @Expose({ groups: ['post-detail'] })
    isCollected = false;

    @AfterLoad()
    async generateImageUrls() {
        this.imageUrls = this.imagePaths
            ? await Promise.all(this.imagePaths?.map((key: string) => getCosResourceUrl(key)))
            : [];
    }
}
