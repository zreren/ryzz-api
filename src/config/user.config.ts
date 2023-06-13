import { EnvironmentType } from '@/modules/core/constants';
import { ConfigureFactory } from '@/modules/core/types';
import { defaultUserConfig } from '@/modules/user/helpers';
import { UserConfig } from '@/modules/user/types';

/**
 * 用户模块配置
 */
export const user: ConfigureFactory<UserConfig> = {
    register: (configure) => {
        const expiredTime =
            configure.getRunEnv() === EnvironmentType.DEVELOPMENT ? 3600 * 10000 : 3600;
        return {
            super: {
                username: configure.env('SUPER_ADMIN_USERNAME', 'admin'),
                password: configure.env('SUPER_ADMIN_PASSWORD', '123456aA$'),
            },
            users: [
                {
                    username: 'Jim',
                    password: '123456aA$',
                },
                {
                    username: 'John',
                    password: '123456aA$',
                },
            ],
            hash: 10,
            jwt: {
                secret: 'my-secret',
                token_expired: expiredTime,
                refresh_secret: 'my-refresh-secret',
                refresh_token_expired: expiredTime * 30,
            },
            captcha: {
                sms: {
                    login: {
                        template: configure.env('SMS_LOGIN_CAPTCHA_QCLOUD', 'your-id'),
                    },
                    register: {
                        template: configure.env('SMS_REGISTER_CAPTCHA_QCLOUD', 'your-id'),
                    },
                    'retrieve-password': {
                        template: configure.env('SMS_RETRIEVEPASSWORD_CAPTCHA_QCLOUD', 'your-id'),
                    },
                    'account-bound': {
                        template: configure.env('SMS_ACCOUNTBOUND_CAPTCHA_QCLOUD', 'your-id'),
                    },
                },
                email: {},
            },
            relations: [],
        };
    },
    defaultRegister: defaultUserConfig as any,
};
