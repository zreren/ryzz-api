import { Socket } from 'socket.io';

// 用户信息
export interface SocketWithUserData extends Socket {
    user: {
        id: string;
        lastActiveTime: number;
    };
}

export type UserSocket = Map<string, string>;

// 心跳间隔(ms)
export const HEART_BEAT_INTERVAL = 3000;

// 允许掉线次数
export const HEART_BEAT_ALLOWABLE_DROPED_TIMES = 1;

// 聊天消息类型
export enum MESSAGE_TYPE {
    TEXT = 'text',
    IMAGE = 'image',
}

// 聊天消息状态
export enum MESSAGE_STATUS {
    SEND_FAILED = 'failed',                 // 发送失败(暂时不用)
    SENT = 'sent',                          // 发送成功(接收方ws在线)
    RECEIVED = 'received',                  // 接收成功(接收方客户端调用接口更新的状态)
    READ = 'read',                          // 已读
    SENDER_DELETE = 'send_delete',          // 发送者删除
    RECEIVER_DELETE = 'receiver_delete',    // 接受者删除
}

/**
 * 聊天消息体
 */
export interface ChatMessage {
    toUserId: string;
    contentType: MESSAGE_TYPE;
    content: string;
    sendTime: number;
    extra?: any;
}

export enum MESSAGE_EVENT {
    CHAT = 'chat',
}