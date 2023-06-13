import { RecordNever } from '@/modules/core/types';

import { DynamicRelation } from '../database/types';

import { CaptchaActionType } from './constants';
import { CaptchaEntity } from './entities';

/**
 * 自定义用户模块配置
 */
export interface UserConfig {
    super: {
        username: string;
        password: string;
    };
    users: {
        username: string;
        password: string;
    }[];
    hash?: number;
    jwt: JwtConfig;
    captcha?: CustomCaptchaConfig;
    relations?: DynamicRelation[];
    /**
     * 默认用户头像
     */
    avatar?: string;
}

/**
 * 默认用户模块配置
 */
export interface DefaultUserConfig {
    super: {
        username: string;
        password: string;
    };
    hash: number;
    jwt: Pick<Required<JwtConfig>, 'token_expired' | 'refresh_token_expired'>;
    captcha: DefaultCaptchaConfig;
    relations: DynamicRelation[];
    /**
     * 默认用户头像
     */
    avatar?: string;
}

/**
 * 自定义验证码配置
 */
export interface CustomCaptchaConfig {
    time?: {
        [key in CaptchaActionType]?: CaptchaTimeOption;
    };
    email?: {
        [key in CaptchaActionType]?: Partial<EmailCaptchaOption>;
    };
}

/**
 * 默认验证码配置
 */
export interface DefaultCaptchaConfig {
    time: {
        [key in CaptchaActionType]: CaptchaTimeOption;
    };
    email: {
        [key in CaptchaActionType]: Omit<EmailCaptchaOption, 'template'>;
    };
}

/**
 * JWT配置
 */
export interface JwtConfig {
    secret: string;
    token_expired: number;
    refresh_secret: string;
    refresh_token_expired: number;
}

/**
 * JWT荷载
 *
 * @export
 * @interface JwtPayload
 */
export interface JwtPayload {
    sub: string;
    username: string;
    iat: number;
}
/**
 * 通用验证码选项
 */
export interface CaptchaTimeOption {
    limit: number; // 验证码发送间隔时间
    expired: number; // 验证码有效时间
}

/**
 * 手机验证码选项
 */
export interface SmsCaptchaOption {
    template: string; // 云厂商短信推送模板ID
}

/**
 * 邮件验证码选项
 */
export interface EmailCaptchaOption {
    subject: string; // 邮件主题
    template?: string; // 模板路径
}

/**
 * 任务传给消费者的数据类型
 */
export interface SendCaptchaQueueJob {
    captcha: { [key in keyof CaptchaEntity]: CaptchaEntity[key] };
    option: SmsCaptchaOption | EmailCaptchaOption;
    otherVars?: Record<string, any>;
}

/**
 * 验证码正确性验证
 */
export type CaptchaValidate<T extends Record<string, any> = RecordNever> = T & {
    value: string;
    code: string;
};
