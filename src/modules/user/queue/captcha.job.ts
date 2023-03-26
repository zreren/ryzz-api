import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { instanceToPlain } from 'class-transformer';
import { isNil } from 'lodash';
import { Repository } from 'typeorm';

import { getTime } from '@/modules/core/helpers';

import { CaptchaActionType, EMAIL_CAPTCHA_JOB, SEND_CAPTCHA_QUEUE } from '../constants';
import { CredentialCaptchaMessageDto, EmailCaptchaMessageDto } from '../dtos/captcha.dto';
import { CaptchaEntity } from '../entities/captcha.entity';
import { UserEntity } from '../entities/user.entity';
import { generateCatpchaCode, getUserConfig } from '../helpers';
import { UserService } from '../services/user.service';
import { CaptchaTimeOption, UserConfig } from '../types';

import { CaptchaWorker } from './captcha.worker';

interface CommonSendParams {
    action: CaptchaActionType;
    message?: string;
}
interface SendParams extends CommonSendParams {
    data: EmailCaptchaMessageDto;
    code?: string;
}
interface UserSendParams extends Omit<CommonSendParams, 'type'> {
    user: UserEntity;
}

interface CredentialSendParams extends Omit<CommonSendParams, 'type'> {
    credential: CredentialCaptchaMessageDto['credential'];
}

interface TypeSendParams extends CommonSendParams {
    data: EmailCaptchaMessageDto;
}

/**
 * 验证码发送服务
 */
@Injectable()
export class CaptchaJob {
    protected config: UserConfig;

    constructor(
        @InjectRepository(CaptchaEntity)
        protected captchaRepository: Repository<CaptchaEntity>,
        @InjectQueue(SEND_CAPTCHA_QUEUE) protected captchaQueue: Queue,
        protected userService: UserService,
        protected worker: CaptchaWorker,
    ) {
        // this.config = getUserConfig();
        this.worker.addWorker();
    }

    /**
     * 根据消息类型(短信/邮件)添加发送任务
     * @param params
     */
    async sendByType(params: TypeSendParams) {
        const { data, action, message } = params;
        const conditional = { email: data.email };
        const user = await this.userService.findOneByCondition(conditional);
        if (!user) {
            throw new BadRequestException(`user with email ${data.email} not exists`);
        }
        return this.sendByUser({
            user,
            action,
            message,
        });
    }

    /**
     * 通过登录凭证添加发送任务
     * @param params
     */
    async sendByCredential(params: CredentialSendParams) {
        const { credential, ...others } = params;
        const user = await this.userService.findOneByCredential(credential);
        if (!user) {
            throw new BadRequestException(`user ${credential} not exists`);
        }
        return this.sendByUser({ user, ...others });
    }

    /**
     * 通过用户对象发送验证码
     * @param params
     */
    async sendByUser(params: UserSendParams) {
        const { user, action, message } = params;
        // 添加异步任务返回的结果
        const logs: Record<string, any> = {};
        // 运行结果
        const results: Record<string, boolean> = {};
        // 错误消息
        const error = isNil(message) ? `can not send email for you!` : message;
        // 生成随机验证码
        const code = generateCatpchaCode();
        if (user.email) {
            try {
                // 添加发送任务
                const { result, log } = await this.send({
                    data: { email: user.email },
                    action,
                    code,
                });
                results.email = result;
                logs.email = log;
            } catch (err) {
                throw new BadRequestException(error);
            }
        }
        return results;
    }

    /**
     * 添加验证码发送任务
     * @param params
     */
    async send(params: SendParams): Promise<{ result: boolean; log: any }> {
        const { data, action, message, code } = params;
        let log: any;
        const result = true;
        const captchaCode = code ?? generateCatpchaCode();
        const error = message ?? `send email captcha failed`;
        try {
            // 获取验证码发送配置
            const time = await getUserConfig<CaptchaTimeOption | undefined>(
                `captcha.time.${action}`,
            );
            const config = await getUserConfig<CaptchaTimeOption | undefined>(
                `captcha.email.${action}`,
            );
            if (isNil(config) || isNil(time)) throw new BadRequestException(error);
            // 创建验证码模型实例
            const captcha = await this.createCaptcha(data, action, time, captchaCode);
            const expired = await getUserConfig<number>(`captcha.time.${action}.expired`);
            const otherVars =
                action === CaptchaActionType.LOGIN ? { expired: Math.floor(expired / 60) } : {};
            // 加入异步发送任务
            await this.captchaQueue.add(EMAIL_CAPTCHA_JOB, {
                captcha: instanceToPlain(captcha),
                option: { ...config, ...time },
                otherVars,
            });
        } catch (err) {
            throw new BadRequestException(err);
        }
        return { result, log };
    }

    /**
     * 创建验证码模型对象
     * @param data
     * @param action
     * @param config
     * @param code
     */
    protected async createCaptcha(
        data: EmailCaptchaMessageDto,
        action: CaptchaActionType,
        config: CaptchaTimeOption,
        code?: string,
    ) {
        const value = data.email;
        // 查询验证码是否存在
        const captcha = await this.captchaRepository.findOne({ where: { value, action } });
        // 如果没有传入code参数,则生成一个随机验证码
        const captchaCode = code ?? generateCatpchaCode();
        // 如果不存在则创建一个新的模型对象并返回
        if (isNil(captcha)) {
            return this.captchaRepository.create({
                value,
                action,
                code: captchaCode,
            });
        }
        // 发送频率限制
        const now = await getTime();
        // 判断是否超过发送频率
        const canSend = now.isAfter(
            (await getTime({ date: captcha.updated_at })).add(config.limit, 'second'),
        );
        if (!canSend) {
            throw new Error(`Can't repeat send in ${config.limit}s `);
        }
        // 改变当前模型对象的code字段为新的验证码
        captcha.code = captchaCode;
        return captcha;
    }
}
