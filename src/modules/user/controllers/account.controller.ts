import { createReadStream, existsSync } from 'fs';

import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    Res,
    SerializeOptions,
    StreamableFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { isNil } from 'lodash';

import { lookup } from 'mime-types';

import { Configure } from '@/modules/core/configure';
import { OptionalUUIDPipe } from '@/modules/core/pipes';
import { MediaModule } from '@/modules/media/media.module';
import { MediaService } from '@/modules/media/services';

import { Depends } from '@/modules/restful/decorators';

import { CaptchaActionType } from '../constants';
import { Guest, ReqUser } from '../decorators';

import {
    AccountBoundDto,
    BoundEmailCaptchaDto,
    UpdateAccountDto,
    UpdatePasswordDto,
    UploadAvatarDto,
} from '../dtos';
import { UserEntity } from '../entities';
import { getUserConfig } from '../helpers';
import { CaptchaJob } from '../queue';
import { AuthService, UserService } from '../services';
import { UserModule } from '../user.module';

/**
 * 账户中心控制器
 */

@ApiTags('账户操作')
@ApiBearerAuth()
@Depends(UserModule, MediaModule)
@Controller('account')
export class AccountController {
    constructor(
        protected readonly userService: UserService,
        protected readonly authService: AuthService,
        protected readonly captchaJob: CaptchaJob,
        protected configure: Configure,
        protected mediaService: MediaService,
    ) {}

    /**
     * 获取用户个人信息
     * @param user
     */
    @Get(['profile', 'profile/:item'])
    @ApiOperation({ summary: '查询账户信息(只有用户自己才能查询)' })
    @SerializeOptions({
        groups: ['user-detail'],
    })
    async profile(
        @ReqUser() user: ClassToPlain<UserEntity>,
        @Param('item', new OptionalUUIDPipe()) item?: string,
    ) {
        console.log(user);
        if (isNil(item) && isNil(user)) throw new NotFoundException();
        return this.userService.detail(item ?? user.id);
    }

    /**
     * 更新账户信息
     * @param user
     * @param data
     */
    @Patch()
    @ApiOperation({ summary: '修改账户信息' })
    @SerializeOptions({
        groups: ['user-detail'],
    })
    async update(
        @ReqUser() user: ClassToPlain<UserEntity>,
        @Body()
        data: UpdateAccountDto,
    ) {
        return this.userService.updateNickname(user, data);
    }

    /**
     * 更改密码
     * @param user
     * @param data
     */
    @Patch('reset-passowrd')
    @ApiOperation({ summary: '重置密码' })
    @SerializeOptions({
        groups: ['user-detail'],
    })
    async resetPassword(
        @ReqUser() user: ClassToPlain<UserEntity>,
        @Body() data: UpdatePasswordDto,
    ): Promise<UserEntity> {
        return this.userService.updatePassword(user, data);
    }

    /**
     * 发送邮件绑定验证码
     * @param data
     */
    @ApiOperation({ summary: '绑定或换绑邮箱' })
    @Post('send-email-bound')
    async sendEmailBound(@Body() data: BoundEmailCaptchaDto) {
        return this.captchaJob.send({
            data,
            action: CaptchaActionType.ACCOUNTBOUND,
            message: 'can not send email for bind',
        });
    }

    /**
     * 绑定或更改邮箱
     * @param user
     * @param data
     */
    @Patch('bound-email')
    @ApiOperation({ summary: '绑定或换绑邮箱' })
    @SerializeOptions({
        groups: ['user-detail'],
    })
    async boundEmail(
        @ReqUser() user: ClassToPlain<UserEntity>,
        @Body() data: AccountBoundDto,
    ): Promise<UserEntity> {
        return this.authService.boundCaptcha(user, {
            ...data,
            value: data.email,
        });
    }

    @Post('avatar')
    @ApiOperation({ summary: '上传头像' })
    @ApiConsumes('multipart/form-data')
    async uploadAvatar(
        @Body() { image }: UploadAvatarDto,
        @ReqUser() user: ClassToPlain<UserEntity>,
    ) {
        return this.mediaService.upload({
            file: image,
            dir: 'avatars',
            user,
            relation: { entity: UserEntity, field: 'avatar', id: user.id },
        });
    }

    @Get('avatar')
    @ApiOperation({ summary: '获取默认头像' })
    @Guest()
    async defaultAvatar(@Res({ passthrough: true }) res: FastifyReply) {
        const avatar = await getUserConfig<string>('avatar');
        if (!existsSync(avatar)) throw new NotFoundException('file not exists!');
        const image = createReadStream(avatar);
        res.type(lookup(avatar) as string);
        return new StreamableFile(image);
    }
}
