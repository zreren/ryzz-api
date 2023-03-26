import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

import { Configure } from '@/modules/core/configure';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(protected configure: Configure) {
        super({
            clientID: configure.env('GOOGLE_CLIENT_ID', null),
            clientSecret: configure.env('GOOGLE_CLIENT_SECRET', null),
            callbackURL: `https://${configure.env('APP_URL')}/google/login`,
            scope: ['profile', 'email'],
            proxy: true,
        });
    }
}
