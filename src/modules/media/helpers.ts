import { randomBytes } from 'crypto';
import { createWriteStream } from 'fs';
import { extname, join, resolve } from 'path';

import axios from 'axios';
import { ensureDirSync, writeFileSync } from 'fs-extra';
import { isNil } from 'lodash';

import { getTime } from '@/modules/core/helpers';

import { App } from '../core/app';

import { MediaConfig, UploadFileType } from './types';

export async function downloadFile(url: string, path: string) {
    const response = await axios.get(url, {
        responseType: 'stream',
    });

    response.data.pipe(createWriteStream(path));

    return new Promise((r, j) => {
        response.data.on('end', () => {
            r(true);
        });

        response.data.on('error', (err: any) => {
            j(err);
        });
    });
}

/**
 * 上传文件
 * @param file 文件上传配置
 * @param dir 上传相对目录
 */
export async function uploadLocalFile(file: UploadFileType, dir?: string) {
    // 获取文件总存储路径
    const uploadConfig = await App.configure.get<string>('media.upload');
    // 上传文件的目录
    const uploadPath = isNil(dir) ? uploadConfig : join(uploadConfig, dir);
    // 使用base64解码上传文件的内容
    const buff = Buffer.from(file.value, 'base64');
    // 如果上传目录不存在则创建
    ensureDirSync(uploadPath, 0o2775);
    // 根据当前时间生成文件名
    const filename = await generateFileName(file.filename);
    // 最终文件存放的路径
    const filePath = join(uploadPath, filename);
    // 写入文件
    writeFileSync(filePath, buff);
    // 返回文件相对于总存储路径的相对位置
    return isNil(dir) ? filename : join(dir, filename);
}

export async function generateFileName(file: string) {
    const time = await getTime();
    return `${time.format('YYYYMMDDHHmmss')}${randomBytes(4).toString('hex').slice(0, 8)}${extname(
        file,
    )}`;
}

/**
 * 默认媒体模块配置
 */
export function defaultMediaConfig(): Required<MediaConfig> {
    return {
        relations: [],
        upload: resolve(__dirname, '../../../uploads'),
    };
}
