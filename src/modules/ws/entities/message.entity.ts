import { UserEntity } from "@/modules/user/entities";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MESSAGE_STATUS, MESSAGE_TYPE } from "../types";
import { Exclude } from "class-transformer";

@Entity('chat_messages')
export class ChatMessageEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity)
    sender: UserEntity;

    @ManyToOne(() => UserEntity)
    receiver: UserEntity;

    @Column({comment: '消息内容'})
    content: string;

    @Column({comment: '消息类型', type: 'enum', enum: MESSAGE_TYPE})
    content_type: MESSAGE_TYPE;

    @Exclude()
    @Column({comment: '消息状态', type: 'enum', enum: MESSAGE_STATUS})
    status: MESSAGE_STATUS;

    @CreateDateColumn()
    createad_at: Date;
}