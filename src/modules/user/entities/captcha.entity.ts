import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { CaptchaActionType } from '../constants';

/**
 * 验证码模型
 */
@Entity('user_captchas')
export class CaptchaEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ comment: '验证码' })
    code!: string;

    @Column({
        type: 'enum',
        enum: CaptchaActionType,
        comment: '验证操作类型',
    })
    action!: CaptchaActionType;

    @Column({ comment: '邮箱地址' })
    value!: string;

    @CreateDateColumn({
        comment: '创建时间',
    })
    created_at!: Date;

    @UpdateDateColumn({
        comment: '更新时间',
    })
    updated_at!: Date;
}
