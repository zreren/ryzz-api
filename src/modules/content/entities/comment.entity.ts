import { Exclude, Expose, Type } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
    Tree,
    TreeChildren,
    TreeParent,
} from 'typeorm';

import { BaseEntity } from '@/modules/database/base';

import { UserEntity } from '@/modules/user/entities';

import { CommentLikeEntity } from './like.entity';
import { PostEntity } from './post.entity';

/**
 * 树形嵌套评论
 */
@Exclude()
@Tree('materialized-path')
@Entity('content_comments')
export class CommentEntity extends BaseEntity {
    [key: string]: any;

    @Expose()
    @ManyToOne(() => UserEntity, (user) => user.comments, {
        nullable: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @Index('idx_uid')
    user: UserEntity;

    @Expose()
    @OneToMany(() => CommentLikeEntity, (commentLike) => commentLike.comment)
    post_likes: CommentLikeEntity[];

    @Expose()
    @Column({ comment: '评论内容', type: 'longtext' })
    body: string;

    @Expose()
    @Type(() => Date)
    @CreateDateColumn({
        comment: '创建时间',
    })
    createdAt: Date;

    @Expose()
    depth = 0;

    @Expose()
    @ManyToOne((type) => PostEntity, (post) => post.comments, {
        // 文章不能为空
        nullable: false,
        // 跟随父表删除与更新
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    post: PostEntity;

    @TreeParent({ onDelete: 'CASCADE' })
    parent: CommentEntity | null;

    @Expose()
    @TreeChildren({ cascade: true })
    children: CommentEntity[];
}
