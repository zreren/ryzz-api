import { resolve } from 'path';

import bcrypt from 'bcrypt';
import { isNil } from 'lodash';

import { App } from '../core/app';

import { CaptchaActionType } from './constants';
import { DefaultUserConfig } from './types';

const defaultCaptchaTime = { limit: 60, expired: 60 * 30 };
/**
 * 获取默认的验证码配置
 * @param type
 */
const getDefaultCaptcha = () => {
    const subjects: { [key in CaptchaActionType]: string } = {
        register: '【User registration】Verification code',
        login: '【User login】Verification code',
        'retrieve-password': '【Retrieve password】Verification code',
        'reset-password': '【Reset password】Verification code',
        'account-bound': '【Bind Email】Verification Code',
    };
    return Object.fromEntries(
        Object.values(CaptchaActionType).map((t) => [t, { subject: subjects[t] }]),
    );
};

/**
 * 默认用户配置
 */
export const defaultUserConfig = (): DefaultUserConfig => ({
    super: {
        username: 'admin',
        password: 'password',
    },
    hash: 10,
    avatar: resolve(__dirname, '../../assets/media', 'avatar.png'),
    jwt: {
        token_expired: 3600,
        refresh_token_expired: 3600 * 30,
    },
    captcha: {
        time: {
            register: defaultCaptchaTime,
            login: defaultCaptchaTime,
            'retrieve-password': defaultCaptchaTime,
            'reset-password': defaultCaptchaTime,
            'account-bound': defaultCaptchaTime,
        },
        email: getDefaultCaptcha() as any,
    },
    relations: [],
});

/**
 * 获取user模块配置的值
 * @param key
 */
export async function getUserConfig<T>(key?: string): Promise<T> {
    return App.configure.get<T>(isNil(key) ? 'user' : `user.${key}`);
}

/**
 * 生成随机验证码
 */
export function generateCatpchaCode() {
    return Math.random().toFixed(6).slice(-6);
}

/**
 * 加密明文密码
 * @param password
 */
export const encrypt = async (password: string) => {
    return bcrypt.hashSync(password, await getUserConfig<number>('hash'));
};

/**
 * 验证密码
 * @param password
 * @param hashed
 */
export const decrypt = (password: string, hashed: string) => {
    return bcrypt.compareSync(password, hashed);
};
