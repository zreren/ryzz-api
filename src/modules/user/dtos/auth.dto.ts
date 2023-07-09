import { PickType } from '@nestjs/swagger';

import { DtoValidation } from '@/modules/core/decorators';

import { CaptchaDtoGroups, UserDtoGroups } from '../constants';

import { GuestDto } from './guest.dto';

/**
 * google登录
 */
export class Google {
    idToken!: string;
}


/**
 * GoogleTokenPayload
 */
export interface GoogleTokenPayload {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
  iat: string;
  exp: string;
  alg: string;
  kid: string;
  typ: string;
}


/**
 * 用户正常方式登录
 */
export class CredentialDto extends PickType(GuestDto, ['credential', 'password']) {}

/**
 * 通过邮箱验证码登录
 */
@DtoValidation({ groups: [CaptchaDtoGroups.EMAIL_LOGIN] })
export class EmailLoginDto extends PickType(GuestDto, ['email', 'code'] as const) {}

/**
 * 普通方式注册用户
 */
@DtoValidation({ groups: [UserDtoGroups.REGISTER] })
export class RegisterDto extends PickType(GuestDto, [
    'username',
    'nickname',
    'password',
    'plainPassword',
] as const) {}

/**
 * 通过邮件验证码注册
 */
@DtoValidation({ groups: [CaptchaDtoGroups.EMAIL_REGISTER] })
export class EmailRegisterDto extends PickType(GuestDto, ['email', 'code'] as const) {}

/**
 * 通过登录凭证找回密码
 */
export class RetrievePasswordDto extends PickType(GuestDto, [
    'credential',
    'code',
    'password',
    'plainPassword',
] as const) {}

/**
 * 通过邮箱地址找回密码
 */
@DtoValidation({ groups: [CaptchaDtoGroups.EMAIL_RETRIEVE_PASSWORD] })
export class EmailRetrievePasswordDto extends PickType(GuestDto, [
    'email',
    'code',
    'password',
    'plainPassword',
] as const) {}
