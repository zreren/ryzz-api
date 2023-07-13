import { INestApplicationContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as SocketIO from 'socket.io';

export class AuthenticatedSocketIoAdapter extends IoAdapter {
    private readonly jwtService: JwtService;

    constructor(private app: INestApplicationContext) {
        super(app);
        this.jwtService = this.app.get(JwtService);
    }

    createIOServer(port: number, options?: SocketIO.ServerOptions): any {
        options.allowRequest = async (request, allowFunction) => {
            try {
                const token = request.headers.authorization?.replace('Bearer ', '');
                const verified = token && (await this.jwtService.verify(token));
                if (verified) {
                    console.log('allowRequest passed');
                    return allowFunction(null, true);
                }
            } catch (error) {
                console.log('allowRequest error');
                console.log(error);
                return allowFunction('Unauthorized', false);
            }
            console.log('allowRequest failed');
            return allowFunction(null, false);
        };

        return super.createIOServer(port, options);
    }
}
