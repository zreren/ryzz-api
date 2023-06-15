import { Injectable } from '@nestjs/common';
import { MESSAGE_EVENT, MESSAGE_STATUS, SocketWithUserData, UserSocket } from './types';
import { Server } from 'socket.io';
import { UserEntity } from '../user/entities';
import { In } from 'typeorm';
import { ChatMessageEntity } from './entities/message.entity';
import { ChatMessageDto } from './ws.dto';

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

    async pushMessageToUser(event: MESSAGE_EVENT, data: ChatMessageDto | any, fromUserId?: string) {
        switch (event) {
            case MESSAGE_EVENT.CHAT:
                const users = await UserEntity.find({where: {id: In([fromUserId, data.toUserId])}, select: ['id', 'username', 'avatarPath']});
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
                this.server.to(this.getUserSocketId(data.toUserId)).emit(event, {
                    fromUser,
                    contentType: data.contentType,
                    content: data.content,
                    sendTime: Date.now()
                });
                message.status = MESSAGE_STATUS.SENT;
                message.save();
                break;
            default:
                break;
        }
    }

    /**
     * 标记消息已收到
     * @param userId 
     * @param maxMessageId 
     */
    async markChatMessageReceived(userId: string, maxMessageId: number): Promise<number> {
        const result = await ChatMessageEntity.createQueryBuilder()
            .where('receiverId = :userId', { userId })
            .andWhere('status IN (:...status)', { status: [MESSAGE_STATUS.SEND_FAILED, MESSAGE_STATUS.SENT]})
            .andWhere('id <= :maxMessageId', { maxMessageId })
            .update({
                status: MESSAGE_STATUS.RECEIVED,
            }).execute();
        return result.affected;
    }

    /**
     * 获取消息列表
     * @param receiverId 
     * @param senderId 
     * @param currentMaxMessageId 
     * @param limit 
     */
    async getMessages(receiverId: string, senderId?: string, currentMaxMessageId = 0, limit = 50) {
        const query = ChatMessageEntity.createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('message.receiver', 'receiver')
            .where('message.receiverId = :receiverId', { receiverId })
            .andWhere('message.status NOT IN(:...status)', { status: [MESSAGE_STATUS.RECEIVER_DELETE]})
            .andWhere('message.id > :currentMaxMessageId', { currentMaxMessageId });
        if (senderId) {
            query.where('message.senderId = :senderId', { senderId });
        }
        return query.take(limit)
            .orderBy('message.id', 'ASC')
            .getMany();
    }

    /**
     * 获取未接收消息列表
     * @param user 
     * @param currentMaxMessageId 
     * @param limit 
     */
    async getUnreceivedMessage(user: UserEntity, currentMaxMessageId = 0, limit = 50) {
        return ChatMessageEntity.createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .where('message.receiverId = :receiverId', { receiverId: user.id })
            .andWhere('message.status IN(:...status)', { status: [MESSAGE_STATUS.SEND_FAILED, MESSAGE_STATUS.SENT]})
            .andWhere('message.id > :currentMaxMessageId', { currentMaxMessageId })
            .take(limit)
            .orderBy('message.id', 'ASC')
            .getMany();
    }
}
