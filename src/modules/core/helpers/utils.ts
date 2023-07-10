import { createHmac } from 'crypto';

import { Module, ModuleMetadata, Type } from '@nestjs/common';
import chalk from 'chalk';
import dayjs from 'dayjs';

import 'dayjs/locale/en';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';

import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import localeData from 'dayjs/plugin/localeData';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import deepmerge from 'deepmerge';
import { isArray, isNil, isObject } from 'lodash';

import { App } from '@/modules/core/app';

import { AppConfig, TimeOptions, PanicOption, TencentCloudCosConfig } from '../types';

dayjs.extend(localeData);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(dayOfYear);

/**
 * 获取小于N的随机整数
 * @param count
 */
export const getRandomIndex = (count: number) => Math.floor(Math.random() * count);

/**
 * 从列表中获取一个随机项
 * @param list
 */
export const getRandItemData = <T extends Record<string, any>>(list: T[]) => {
    return list[getRandomIndex(list.length)];
};

/**
 * 从列表中获取多个随机项组成一个新列表
 * @param list
 */
export const getRandListData = <T extends Record<string, any>>(list: T[]) => {
    const result: T[] = [];
    for (let i = 0; i < getRandomIndex(list.length); i++) {
        const random = getRandItemData<T>(list);
        if (!result.find((item) => item.id === random.id)) {
            result.push(random);
        }
    }
    return result;
};

/**
 * 生成只包含字母的固定长度的字符串
 * @param length
 */
export const getRandomCharString = (length: number) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

/**
 * 用于请求验证中的boolean数据转义
 * @param value
 */
export function toBoolean(value?: string | boolean): boolean {
    if (isNil(value)) return false;
    if (typeof value === 'boolean') return value;
    try {
        return JSON.parse(value.toLowerCase());
    } catch (error) {
        return value as unknown as boolean;
    }
}

/**
 * 用于请求验证中转义null
 * @param value
 */
export function toNull(value?: string | null): string | null | undefined {
    return value === 'null' ? null : value;
}

/**
 * 检测当前函数是否为异步函数
 * @param callback
 */
export function isAsyncFn<R, A extends Array<any>>(
    callback: (...asgs: A) => Promise<R> | R,
): callback is (...asgs: A) => Promise<R> {
    const AsyncFunction = (async () => {}).constructor;
    return callback instanceof AsyncFunction === true;
}

/**
 * 深度合并对象
 * @param x 初始值
 * @param y 新值
 * @param arrayMode 对于数组采取的策略,`replace`为直接替换,`merge`为合并数组
 */
export const deepMerge = <T1, T2>(
    x: Partial<T1>,
    y: Partial<T2>,
    arrayMode: 'replace' | 'merge' = 'merge',
) => {
    const options: deepmerge.Options = {};
    if (arrayMode === 'replace') {
        options.arrayMerge = (_d, s, _o) => s;
    } else if (arrayMode === 'merge') {
        options.arrayMerge = (_d, s, _o) => Array.from(new Set([..._d, ...s]));
    }
    return deepmerge(x, y, options) as T2 extends T1 ? T1 : T1 & T2;
};

/**
 * 深度合并启动模块的metadata
 * @param meta 默认metadata
 * @param custom 自定义metadata
 */
export function mergeMeta(meta: ModuleMetadata, custom: ModuleMetadata) {
    const keys = Array.from(new Set([...Object.keys(meta), ...Object.keys(custom)]));
    const useMerge = <T>(i: T, p: T) => {
        if (isArray(p)) return [...((i as any[]) ?? []), ...((p as any[]) ?? [])];
        if (isObject(p)) return deepMerge(i, p);
        return p;
    };
    const merged = Object.fromEntries(
        keys
            .map((type) => [
                type,
                useMerge(meta[type as keyof ModuleMetadata], custom[type as keyof ModuleMetadata]),
            ])
            .filter(([_, item]) => (isArray(item) ? item.length > 0 : !!item)),
    );
    return { ...meta, ...merged };
}

/**
 * 创建一个动态模块
 * @param target
 * @param metaSetter
 */
export function CreateModule(
    target: string | Type<any>,
    metaSetter: () => ModuleMetadata = () => ({}),
): Type<any> {
    let ModuleClass: Type<any>;
    if (typeof target === 'string') {
        ModuleClass = class {};
        Object.defineProperty(ModuleClass, 'name', { value: target });
    } else {
        ModuleClass = target;
    }
    Module(metaSetter())(ModuleClass);
    return ModuleClass;
}

/**
 * 输出命令行错误消息
 * @param option
 */
export function panic(option: PanicOption | string) {
    if (typeof option === 'string') {
        console.log(chalk.red(`\n❌ ${option}`));
        process.exit(1);
    }
    const { error, spinner, message, exit = true } = option;
    if (error) console.log(chalk.red(error));
    spinner ? spinner.fail(chalk.red(`\n❌${message}`)) : console.log(chalk.red(`\n❌ ${message}`));
    if (exit) process.exit(1);
}

/**
 * 获取一个dayjs时间对象
 * @param options
 */
export const getTime = async (options?: TimeOptions) => {
    const { date, format, locale, strict, zonetime } = options ?? {};
    const config = await App.configure.get<AppConfig>('app');
    // 每次创建一个新的时间对象
    // 如果没有传入local或timezone则使用应用配置
    const now = dayjs(date, format, locale ?? config.locale, strict).clone();
    return now.tz(zonetime ?? config.timezone);
};

/**
 * 用于请求验证中的number数据转义
 *
 * @export
 * @param {(string | number)} [value]
 * @returns {*}  {(number | undefined)}
 */
export function tNumber(value?: string | number): string | number | undefined {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        try {
            return Number(value);
        } catch (error) {
            return value;
        }
    }

    return value;
}

/**
 * 用于请求验证中的boolean数据转义
 *
 * @export
 * @param {(string | boolean)} [value]
 * @return {*}
 */
export function tBoolean(value?: string | boolean): string | boolean | undefined {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        try {
            return JSON.parse(value.toLowerCase());
        } catch (error) {
            return value;
        }
    }
    return value;
}

export const getDefaultAvatar = async () => {
    const cosConfig = await App.configure.get<TencentCloudCosConfig>('cos');
    return `https://${cosConfig.publicBucket}.cos.${cosConfig.region}.myqcloud.com/images/default-avatar.jpg`;
};

export const getCosResourceUrl = async (
    key: string,
    isPrivate = true,
    expiredTime = 900,
): Promise<string> => {
    const cosConfig = await App.configure.get<TencentCloudCosConfig>('cos');
    if (!isPrivate) {
        return `https://${cosConfig.publicBucket}.cos.${cosConfig.region}.myqcloud.com${key}`;
    }
    const longBucket = cosConfig.bucket;
    const shortBucket = longBucket.substring(0, longBucket.lastIndexOf('-'));
    const appId = longBucket.substring(longBucket.lastIndexOf('-') + 1);
    const random = Math.round(Math.random() * 2 ** 32);
    const now = Math.round(Date.now() / 1000);
    const e = now + expiredTime;
    const path = `/${appId}/${shortBucket}/${encodeURIComponent(
        (key || '').replace(/(^\/*)/g, ''),
    ).replace(/%2F/g, '/')}`;
    const plainText = `a=${appId}&b=${shortBucket}&k=${cosConfig.secretId}&t=${now}&e=${e}&r=${random}&f=${path}`;
    const signKey = createHmac('sha1', cosConfig.secretKey).update(plainText).digest();
    const sign = Buffer.concat([signKey, Buffer.from(plainText)]).toString('base64');
    return `https://${cosConfig.bucket}.cos.${
        cosConfig.region
    }.myqcloud.com${key}?sign=${encodeURIComponent(sign)}`;
};
