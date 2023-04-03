import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('content_posts_user_view_records')
@Index('idx_user_post', ['userId', 'postId'])
export class PostUserViewRecordEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        comment: '帖子ID',
        type: String,
    })
    postId: string;

    @Column({
        comment: '用户ID',
        type: String,
    })
    userId: string;

    @CreateDateColumn({
        comment: '浏览时间',
    })
    createdAt: Date;
}
