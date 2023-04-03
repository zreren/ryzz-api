import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsUUID } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';
import { IsDataExist } from '@/modules/database/constraints';

import { PostEntity } from '../entities';

@DtoValidation({ groups: ['create'] })
export class LikeDto {
    @ApiProperty({
        description: '帖子id',
    })
    @IsDataExist(PostEntity, { always: true, message: '帖子不存在' })
    @IsUUID(undefined, { always: true, message: '帖子ID不合法' })
    @Transform(({ value }) => (value === 'null' ? null : value))
    post: string;
}

@DtoValidation({ groups: ['create'] })
export class UnlikeDto extends LikeDto {}
