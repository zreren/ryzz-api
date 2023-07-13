import {
    Injectable,
    UnauthorizedException,
    UseFilters,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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

import { Observable, of } from 'rxjs';
import { Server } from 'socket.io';

import { BadRequestTransformationFilter } from './BadRequestTransformation.filter';
import { MESSAGE_EVENT, SocketWithUserData } from './types';
import { ChatMessageDto } from './ws.dto';
import { WsService } from './ws.service';
// import { JwtWsGuard } from '../user/guards';

@Injectable()
@UsePipes(ValidationPipe)
@UseFilters(BadRequestTransformationFilter)
// @UseGuards(JwtWsGuard)
@WebSocketGateway(3002, { cors: true, transports: ['polling', 'websocket'] })
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    constructor(private readonly jwtService: JwtService, private readonly wsService: WsService) {}

    async afterInit(ws: Server) {
        this.wsService.setServer(ws);
    }

    async handleConnection(client: SocketWithUserData) {
        try {
            const token = client.handshake.headers.authorization.replace('Bearer ', '');
            const { sub } = this.jwtService.decode(token);
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
        console.log(`connect ${client.user.id}`);
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
    chat(
        @ConnectedSocket() client: SocketWithUserData,
        @MessageBody() data: ChatMessageDto,
    ): Observable<WsResponse<number> | any> {
        console.log(`${client.user.id} send message: ${data.content} to ${data.toUserId}`);
        this.wsService.pushMessageToUser(MESSAGE_EVENT.CHAT, data, client.user.id);
        return null;
    }
}
