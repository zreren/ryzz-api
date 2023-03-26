import { Body, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { CaptchaActionType } from '../constants';
import { Guest } from '../decorators';
import {
    CredentialCaptchaMessageDto,
    LoginEmailCaptchaDto,
    RegisterEmailCaptchaDto,
    RetrievePasswordEmailCaptchaDto,
} from '../dtos';
import { CaptchaJob } from '../queue';

/**
 * 发送用户验证码控制器
 */
export abstract class AuthCaptchaController {
    constructor(protected readonly captchaJob: CaptchaJob) {}

    /**
     * 发送登录验证码邮件
     * @param data
     */
    @Post('send-login-email')
    @ApiOperation({ summary: '发送登录验证码邮件' })
    @Guest()
    async sendLoginEmail(
        @Body()
        data: LoginEmailCaptchaDto,
    ) {
        return this.captchaJob.sendByCredential({
            ...data,
            credential: data.email,
            action: CaptchaActionType.LOGIN,
        });
    }

    /**
     * 发送用户注册验证码邮件
     * @param data
     */
    @Post('send-register-email')
    @ApiOperation({ summary: '发送用户注册验证码邮件' })
    @Guest()
    async sendRegisterEmail(
        @Body()
        data: RegisterEmailCaptchaDto,
    ) {
        const { result } = await this.captchaJob.send({
            data,
            action: CaptchaActionType.REGISTER,
            message: 'can not send email for register user!',
        });
        return { result };
    }

    /**
     * 发送找回密码的验证码邮件
     * @param data
     */
    @Post('send-retrieve-password-email')
    @ApiOperation({ summary: '发送找回密码的验证码邮件' })
    @Guest()
    async sendRetrievePasswordEmail(
        @Body()
        data: RetrievePasswordEmailCaptchaDto,
    ) {
        return this.captchaJob.sendByType({
            data,
            action: CaptchaActionType.RETRIEVEPASSWORD,
            message: 'can not send email for reset-password!',
        });
    }

    /**
     * 通过登录凭证找回密码时同时发送短信和邮件
     * @param param0
     */
    @Post('send-retrieve-password')
    @ApiOperation({ summary: '通过登录凭证找回密码时同时发送短信和邮件' })
    @Guest()
    async sendRetrievePasswordCaptcha(
        @Body()
        { credential }: CredentialCaptchaMessageDto,
    ) {
        return this.captchaJob.sendByCredential({
            credential,
            action: CaptchaActionType.RETRIEVEPASSWORD,
            message: 'can not send sms or email for reset-password!',
        });
    }
}
