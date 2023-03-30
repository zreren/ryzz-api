import { Expose } from 'class-transformer';
import { BaseEntity, Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { UserEntity } from './user.entity';

@Entity('user_bans')
@Index('idx_baned_uid', ['baned_user'])
@Index('uniq_user_ban_id', ['user', 'baned_user'], { unique: true })
export class UserBanEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Expose()
    @ManyToOne(() => UserEntity)
    user: UserEntity;

    @Expose()
    @ManyToOne(() => UserEntity, (user) => user.bans)
    baned_user: UserEntity;

    @Column({
        comment: '拉黑时间戳',
        type: Number,
        unsigned: true,
    })
    create_time: number;
}
