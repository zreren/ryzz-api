import { Injectable, UnauthorizedException, UseGuards } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WsResponse,
} from '@nestjs/websockets';

import { Server } from 'socket.io';

import { JwtService } from '@nestjs/jwt';
import { SocketWithUserData } from './types';
import { Observable, of } from 'rxjs';
import { WsService } from './ws.service';
import { JwtWsGuard } from '../user/guards';

@Injectable()
@UseGuards(JwtWsGuard)
@WebSocketGateway(3002, { cors: true, transports: ['polling', 'websocket'] })
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    constructor(
        private readonly jwtService: JwtService,
        private readonly wsService: WsService,
    ) {}

    async afterInit(ws: Server) {
        this.wsService.setServer(ws);
    }

    async handleConnection(client: SocketWithUserData) {
        try {
            const token = client.handshake.headers.authorization.replace('Bearer ', '');
            const { sub } = await this.jwtService.decode(token);
            client.user = {
                id: sub,
                lastActiveTime: client.handshake.issued,
            };
            this.wsService.addUserSocket(sub, client);
        } catch (error) {
            console.log('connection error');
            console.log(error);
            throw new UnauthorizedException();
        }

        // todo ws用户登录事件
        // console.log('connect ' + client.user.id);
    }

    async handleDisconnect(client: SocketWithUserData) {
        this.wsService.removeUserSocket(client.user.id);
        console.log('disconnect');
    }

    @SubscribeMessage('heartbeat')
    heartbeat(@ConnectedSocket() client: SocketWithUserData): Observable<WsResponse<number> | any> {
        console.log('heartbeat');
        client.user.lastActiveTime = Date.now();
        return of(client.user);
    }

    @SubscribeMessage('chat')
    chat(@MessageBody() data: any): Observable<WsResponse<number> | any> {
        console.log(`send message: ${data.message}`);
        this.wsService.pushMessageToUser(data.toUserId, 'chat', data.message);
        return null;
    }
}
