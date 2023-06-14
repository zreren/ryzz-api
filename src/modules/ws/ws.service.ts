import { Injectable } from '@nestjs/common';
import { ChatMessage, MESSAGE_EVENT, MESSAGE_STATUS, SocketWithUserData, UserSocket } from './types';
import { Server } from 'socket.io';
import { UserEntity } from '../user/entities';
import { In } from 'typeorm';
import { ChatMessageEntity } from './entities/message.entity';
import { isNil } from 'lodash';

@Injectable()
export class WsService {
    // userId => socket id
    private userSocket: UserSocket;

    private server: Server;

    constructor() {
        this.userSocket = new Map();
    }

    setServer(server: Server) {
        this.server = server;
    }

    initUserSocket() {
        this.userSocket = new Map();
    }

    getUserSocketId(userId: string) {
        return this.userSocket.get(userId);
    }

    addUserSocket(userId: string, client: SocketWithUserData) {
        this.userSocket.set(userId, client.id);
    }

    removeUserSocket(userId: string) {
        this.userSocket.delete(userId);
    }

    async pushMessageToUser(event: MESSAGE_EVENT, data: ChatMessage | any, fromUserId?: string) {
        switch (event) {
            case MESSAGE_EVENT.CHAT:
                const users = await UserEntity.findBy({id: In([fromUserId, data.toUserId])});
                if (users.length !== 2) {
                    console.log('用户不存在');
                    break;
                }
                const fromUser = users.filter((user) => user.id === fromUserId)[0];
                const toUser = users.filter((user) => user.id === data.toUserId)[0];
                const message = new ChatMessageEntity();
                message.sender = fromUser;
                message.receiver = toUser;
                message.content = data.content;
                message.content_type = data.contentType;
                message.status = MESSAGE_STATUS.SEND_FAILED;
                if (!this.userSocket.has(data.toUserId)) {
                    console.log(`${data.toUserId}不在线`);
                    message.save();
                    break;
                }
                this.server.to(this.getUserSocketId(data.toUserId)).emit(event, data);
                message.status = MESSAGE_STATUS.SENT;
                message.save();
                break;
            default:
                break;
        }
    }

    async markChatMessageRead(userId: string, messageIds: number[]) {
        if (messageIds.length === 0) {
            return;
        }
        ChatMessageEntity.createQueryBuilder()
            .where('receiverId = :userId', { userId })
            .andWhere('status = :stauts', { status: MESSAGE_STATUS.SENT})
            .andWhere('id IN (:...messageIds)', { messageIds })
            .update({
                status: MESSAGE_STATUS.RECEIVED,
            }).execute();
    }
}
