import { Injectable } from '@nestjs/common';
import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';

import { Server } from 'socket.io';

@Injectable()
@WebSocketGateway(8200, { cors: true })
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
        console.log('init');
    }

    async handleConnection() {
        // A client has connected
        // this.users++;
        // Notify connected clients of current users
        console.log('connect');
        // this.server.emit('users', this.users);
    }

    async handleDisconnect() {
        // A client has disconnected
        // this.users--;
        // Notify connected clients of current users
        // this.server.emit('users', this.users);
        console.log('disconnect');
    }

    @SubscribeMessage('test')
    handleEvent(@MessageBody() data: string): string {
        return data;
    }
}
