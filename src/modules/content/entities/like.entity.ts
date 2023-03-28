import { Expose, Type } from 'class-transformer';
import { BaseEntity, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { UserEntity } from '@/modules/user/entities';

import { CommentEntity } from './comment.entity';
import { PostEntity } from './post.entity';

class LikeEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Expose()
    @Type(() => Date)
    @CreateDateColumn({
        comment: '创建时间',
    })
    createdAt: Date;
}

@Entity('content_posts_likes')
export class PostLikeEntity extends LikeEntity {
    @Expose()
    @ManyToOne((type) => UserEntity, (user) => user.post_likes)
    user: UserEntity;

    @Expose()
    @ManyToOne((type) => PostEntity, (post) => post.post_likes)
    post: PostEntity;
}

@Entity('content_comments_likes')
export class CommentLikeEntity extends LikeEntity {
    @Expose()
    @ManyToOne((type) => UserEntity, (user) => user.comment_likes)
    user: UserEntity;

    @Expose()
    @ManyToOne((type) => CommentEntity, (comment) => comment.comment_likes)
    comment: CommentEntity;
}
