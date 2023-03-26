import { stringify } from 'querystring';

import { HttpModule, HttpService } from '@nestjs/axios';
import { Body, Controller, Get, Patch, Post, Req, Request, Res, UseGuards } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';

import { Configure } from '@/modules/core/configure';
import { Depends } from '@/modules/restful/decorators';

import { Guest, ReqUser } from '../decorators';
import {
    CredentialDto,
    EmailLoginDto,
    EmailRegisterDto,
    EmailRetrievePasswordDto,
    RegisterDto,
    RetrievePasswordDto,
} from '../dtos';
import { UserEntity } from '../entities';
import { LocalAuthGuard } from '../guards';
import { CaptchaJob } from '../queue';
import { AuthService } from '../services';

import { UserModule } from '../user.module';

import { AuthCaptchaController } from './captcha.controller';

/**
 * Auth操作控制器
 */

@ApiTags('Auth操作')
@Depends(UserModule, HttpModule)
@Controller('auth')
export class AuthController extends AuthCaptchaController {
    constructor(
        protected readonly authService: AuthService,
        protected readonly captchaJob: CaptchaJob,
        protected configure: Configure,
        protected httpService: HttpService,
    ) {
        super(captchaJob);
    }

    @Post('login')
    @ApiOperation({ summary: '用户通过凭证(可以是用户名,邮箱,手机号等)+密码登录' })
    @Guest()
    @UseGuards(LocalAuthGuard)
    async login(@ReqUser() user: ClassToPlain<UserEntity>, @Body() _data: CredentialDto) {
        return { token: await this.authService.createToken(user.id) };
    }

    /**
     * 通过邮件验证码登录
     * @param param0
     */
    @Post('email-login')
    @ApiOperation({ summary: '用户通过邮箱+验证码' })
    @Guest()
    async loginByEmail(@Body() { email, code }: EmailLoginDto) {
        const user = await this.authService.loginByCaptcha(email, code);
        return { token: await this.authService.createToken(user.id) };
    }

    @Get('google')
    @ApiOperation({ summary: '谷歌OAuth2登录' })
    @Guest()
    @UseGuards(AuthGuard('google'))
    async googleLogin(@Res() res: FastifyReply) {
        return res.status(302).redirect(
            `https://accounts.google.com/o/oauth2/v2/auth?${stringify({
                response_type: 'code',
                client_id: this.configure.env('GOOGLE_CLIENT_ID'),
                redirect_uri: `https://${this.configure.env('APP_URL')}/google/login`,
                scope: 'profile email',
            })}`,
        );
    }

    @Get('google/callback')
    @ApiOperation({ summary: '谷歌OAuth2回调' })
    @Guest()
    async googleLoginCallback(@Req() req: FastifyRequest) {
        const user = await this.authService.loginByGoogle(req);
        return { token: await this.authService.createToken(user.id) };
    }

    /**
     * 注销登录
     * @param req
     */
    @Post('logout')
    @ApiOperation({ summary: '用户登出账户' })
    @ApiBearerAuth()
    async logout(@Request() req: any) {
        return this.authService.logout(req);
    }

    /**
     * 使用用户名密码注册
     * @param data
     */
    @Post('register')
    @ApiOperation({ summary: '通过用户名+密码注册账户' })
    @Guest()
    async register(
        @Body()
        data: RegisterDto,
    ) {
        return this.authService.register(data);
    }

    /**
     * 通过邮箱验证注册用户
     * @param data
     */
    @Post('email-register')
    @ApiOperation({ summary: '用户通过邮箱+验证码' })
    @Guest()
    async registerByEmail(
        @Body()
        data: EmailRegisterDto,
    ) {
        return this.authService.registerByCaptcha({
            ...data,
            value: data.email,
        });
    }

    /**
     * 通过用户凭证(用户名,短信,邮件)发送邮件和短信验证码后找回密码
     * @param data
     */
    @Patch('retrieve-password')
    @ApiOperation({ summary: '通过对凭证绑定的手机号和邮箱同时发送验证码来找回密码' })
    @Guest()
    async retrievePassword(
        @Body()
        data: RetrievePasswordDto,
    ) {
        return this.authService.retrievePassword({
            ...data,
            value: data.credential,
        });
    }

    /**
     * 通过邮件验证码找回密码
     * @param data
     */
    @Patch('retrieve-password-email')
    @ApiOperation({ summary: '通过邮件验证码找回密码' })
    @Guest()
    async retrievePasswordByEmail(
        @Body()
        data: EmailRetrievePasswordDto,
    ) {
        return this.authService.retrievePassword({
            ...data,
            value: data.email,
        });
    }
}
