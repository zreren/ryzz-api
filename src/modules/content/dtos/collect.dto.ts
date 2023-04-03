import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';
import { IsDataExist } from '@/modules/database/constraints';

import { PostEntity } from '../entities';

/**
 * 收藏夹新增验证
 */
@DtoValidation({ groups: ['create'] })
export class CreateCollectDto {
    @ApiProperty({
        description: '收藏夹名称',
        maxLength: 25,
    })
    @MaxLength(25, {
        always: true,
        message: '收藏夹名称长度不得超过$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '收藏夹名称不得为空' })
    @IsOptional({ groups: ['update'] })
    title!: string;
}

/**
 * 收藏夹更新验证
 */
@DtoValidation({ groups: ['update'] })
export class UpdateCollectDto extends PartialType(CreateCollectDto) {
    @ApiProperty({
        description: '待更新的收藏夹ID',
    })
    @IsUUID(undefined, { groups: ['update'], message: '收藏夹ID格式错误' })
    @IsDefined({ groups: ['update'], message: '收藏夹ID必须指定' })
    id!: string;
}

@DtoValidation({ groups: ['create'] })
export class PostCollectDto {
    @ApiProperty({
        description: '帖子id',
    })
    @IsDataExist(PostEntity, { always: true, message: '帖子不存在' })
    @IsUUID(undefined, { always: true, message: '帖子ID不合法' })
    post: string;

    @ApiProperty({
        description: '收藏夹id',
    })
    @IsUUID(undefined, { always: true, message: '收藏夹ID不合法' })
    collect: string;
}

@DtoValidation({ groups: ['create'] })
export class CancelPostCollectDto extends PostCollectDto {}
