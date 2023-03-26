import { ApiProperty, PickType } from '@nestjs/swagger';
import { Length } from 'class-validator';

import { IsPassword } from '@/modules/core/constraints';
import { DtoValidation } from '@/modules/core/decorators';
import { UploadFileDto } from '@/modules/media/dtos';

import { UserDtoGroups } from '../constants';

import { GuestDto } from './guest.dto';

/**
 * 对手机/邮箱绑定验证码进行验证
 */
export class AccountBoundDto extends PickType(GuestDto, ['code', 'email']) {}

/**
 * 更新用户信息
 */
@DtoValidation({ groups: [UserDtoGroups.UPDATE] })
export class UpdateAccountDto extends PickType(GuestDto, ['username', 'nickname']) {}

/**
 * 更改用户密码
 */
export class UpdatePasswordDto extends PickType(GuestDto, ['password', 'plainPassword']) {
    @ApiProperty({
        description: '旧密码:用户在更改密码时需要输入的原密码',
        minLength: 8,
        maxLength: 50,
    })
    @IsPassword(5, {
        message: '密码必须由小写字母,大写字母,数字以及特殊字符组成',
        always: true,
    })
    @Length(8, 50, {
        message: '密码长度不得少于$constraint1',
        always: true,
    })
    oldPassword!: string;
}

export class UploadAvatarDto extends PickType(UploadFileDto, ['image']) {}
