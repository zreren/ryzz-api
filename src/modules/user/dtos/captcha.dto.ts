import { PickType } from '@nestjs/swagger';

import { DtoValidation } from '@/modules/core/decorators';

import { CaptchaDtoGroups } from '../constants';

import { GuestDto } from './guest.dto';

/**
 * 发送邮件验证码消息
 */
export class CaptchaMessage extends PickType(GuestDto, ['email']) {}

/**
 * 发送邮件验证码DTO类型
 */
export class EmailCaptchaMessageDto extends PickType(CaptchaMessage, ['email'] as const) {}

/**
 * 通过用户凭证发送验证码消息
 */
export class CredentialCaptchaMessageDto extends PickType(GuestDto, ['credential']) {}

/**
 * 发送登录验证码邮件
 */
@DtoValidation({ groups: [CaptchaDtoGroups.EMAIL_LOGIN] })
export class LoginEmailCaptchaDto extends EmailCaptchaMessageDto {}

/**
 * 发送注册验证码邮件
 */
@DtoValidation({ groups: [CaptchaDtoGroups.EMAIL_REGISTER] })
export class RegisterEmailCaptchaDto extends EmailCaptchaMessageDto {}

/**
 * 发送找回密码邮件
 */
@DtoValidation({ groups: [CaptchaDtoGroups.EMAIL_RETRIEVE_PASSWORD] })
export class RetrievePasswordEmailCaptchaDto extends EmailCaptchaMessageDto {}

/**
 * 发送邮箱绑定邮件
 */
@DtoValidation({ groups: [CaptchaDtoGroups.BOUND_EMAIL] })
export class BoundEmailCaptchaDto extends EmailCaptchaMessageDto {}
