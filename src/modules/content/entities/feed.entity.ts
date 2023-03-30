import { Exclude } from 'class-transformer';
import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 关注feed流
 */
@Exclude()
@Entity('content_feeds')
export class FeedEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        comment: '帖子ID',
        type: Number,
        default: 0,
        unsigned: true,
    })
    post_id: number;

    @Column({
        comment: '用户ID',
        type: Number,
        default: 0,
        unsigned: true,
    })
    @Index('idx_user_id')
    user_id: number;

    @Column({
        comment: '发布时间戳',
        type: Number,
        unsigned: true,
    })
    @Index('idx_publish_time')
    publish_time: number;
}
