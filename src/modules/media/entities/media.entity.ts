import { Exclude, Expose, Type } from 'class-transformer';

import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { PostEntity } from '@/modules/content/entities';
import { App } from '@/modules/core/app';
import { AddRelations } from '@/modules/database/decorators/dynamic-relation.decorator';
import { DynamicRelation } from '@/modules/database/types';
import { UserEntity } from '@/modules/user/entities';

@Exclude()
@Entity('storage_medias')
@AddRelations(async () => App.configure.get<DynamicRelation[]>('media.relations', []))
export class MediaEntity extends BaseEntity {
    [key: string]: any;

    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ comment: '文件存储位置' })
    file: string;

    @Expose()
    @Column({ comment: '文件后缀' })
    ext: string;

    @Expose()
    @ManyToOne((type) => UserEntity, (user) => user.medias, {
        nullable: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    user?: UserEntity;

    @ManyToOne((type) => PostEntity, (post) => post.medias, {
        nullable: true,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    post?: PostEntity;

    @Expose()
    @Type(() => Date)
    @CreateDateColumn({
        comment: '创建时间',
    })
    createdAt!: Date;
}
