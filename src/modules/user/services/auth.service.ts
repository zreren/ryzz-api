import { readFileSync } from 'fs';

import { HttpService } from '@nestjs/axios';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosError } from 'axios';
import { FastifyRequest as Request, FastifyRequest } from 'fastify';
import { has, isNil, pick } from 'lodash';
import { lookup } from 'mime-types';
import { ExtractJwt } from 'passport-jwt';

import { catchError, firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

import { App } from '@/modules/core/app';
import { Configure } from '@/modules/core/configure';
import { EnvironmentType } from '@/modules/core/constants';
import { getTime } from '@/modules/core/helpers';
import { MediaEntity } from '@/modules/media/entities';
import { downloadFile, generateFileName, uploadLocalFile } from '@/modules/media/helpers';
import { PermissionRepository, RoleRepository } from '@/modules/rbac/repositories';

import { CaptchaActionType } from '../constants';
import { Google, RegisterDto } from '../dtos/auth.dto';
import { CaptchaEntity } from '../entities/captcha.entity';
import { UserEntity } from '../entities/user.entity';
import { decrypt, encrypt, getUserConfig } from '../helpers';
import { UserRepository } from '../repositories/user.repository';

import { CaptchaTimeOption, CaptchaValidate, UserConfig } from '../types';

import { TokenService } from './token.service';

import { UserService } from './user.service';

import {GoogleTokenPayload} from '../dtos/auth.dto';

/**
 * 户认证服务
 */
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(CaptchaEntity)
        private captchaRepository: Repository<CaptchaEntity>,
        private readonly userRepository: UserRepository,
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        protected readonly roleRepository: RoleRepository,
        private readonly jwtService:JwtService,
        protected permissionRepository: PermissionRepository,
        protected httpService: HttpService,
        protected configure: Configure,
    ) {}

    /**
     * 用户登录验证
     * @param credential
     * @param password
     */
    async validateUser(credential: string, password: string) {
        const user = await this.userService.findOneByCredential(credential, async (query) =>
            query.addSelect('user.password'),
        );
        if (user && decrypt(password, user.password)) {
            return user;
        }
        return false;
    }

    /**
     * 登录用户,并生成新的token和refreshToken
     * @param user
     */
    async login(user: UserEntity) {
        const now = await getTime();
        const { accessToken } = await this.tokenService.generateAccessToken(user, now);
        return accessToken.value;
    }

    /**
     * 用户手机号/邮箱+验证码登录用户
     * @param value
     * @param code
     * @param type
     * @param message
     */
    async loginByCaptcha(value: string, code: string, message?: string) {
        const expired = await this.checkCodeExpired({ value, code }, CaptchaActionType.LOGIN);
        if (expired) {
            throw new BadRequestException('captcha has been expired,cannot used to login');
        }
        const user = await this.userService.findOneByCondition({ email: value });
        if (!user) {
            const error = message ?? `your email or captcha code not correct`;
            throw new UnauthorizedException(error);
        }
        return user;
    }

    async loginByGoogle(request: FastifyRequest) {
        const { data = {} } = (await this.getGoogleUser(request)) as Record<string, any>;
        const nickname = data.name ?? undefined;
        const exists = await this.userRepository.findOneBy({ email: data.email });
        const user = isNil(exists)
            ? await this.userService.create({
                  nickname,
                  email: data.email,
              } as any)
            : exists;
        if (isNil(exists) && !isNil(data.picture)) {
            try {
                const filename = `/tmp/${generateFileName(data.picture)}.png`;
                await downloadFile(data.picture, filename);
                const avatarPath = await uploadLocalFile(
                    {
                        filename,
                        mimetype: lookup(filename) as string,
                        value: readFileSync(filename, { encoding: 'base64' }),
                    },
                    'avatars',
                );
                const media = new MediaEntity();
                media.file = avatarPath;
                media.user = user;
                media.member = user;
                await MediaEntity.save(media);
            } catch (err) {
                throw new UnauthorizedException();
            }
        }
        return user;
    }

    /**
     * 注销登录
     * @param req
     */
    async logout(req: Request) {
        const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req as any);
        if (accessToken) {
            await this.tokenService.removeAccessToken(accessToken);
        }

        return {
            msg: 'logout_success',
        };
    }

    /**
     * 登录用户后生成新的token和refreshToken
     * @param id
     */
    async createToken(id: string) {
        const now = await getTime();
        let user: UserEntity;
        try {
            user = await this.userService.detail(id);
        } catch (error) {
            throw new ForbiddenException();
        }
        return this.tokenService.generateAccessTokenRedis(user.id, user.username, now);
    }

    /**
     * 通过idtoken进行注册
     */
    async registerByGoogle(request: Google) {
        // JwtService.
        const decoded:GoogleTokenPayload | any = await this.jwtService.decode(request.idToken);
        if(!!decoded &&'email' in decoded){
            const {email, name} = decoded;
            const user = await this.userService.findOneByCondition({email});
            if(user){
                return { token: await this.createToken(user.id) };
            }
            const createUser = new UserEntity();
            createUser.actived = true;
            createUser.email = email;
            createUser.nickname = name;
            createUser.username = name;
            createUser.avatarUrl = decoded.picture;
            // 储存用户
            await createUser.save();
            // const data = await this.userService.findOneByCondition({ id: createUser.id });
            return { token: await this.createToken(createUser.id)};
        }else{
            throw new BadRequestException('google token is not valid');
        }
    }

    /**
     * 使用用户名密码注册用户
     * @param data
     */
    async register(data: RegisterDto) {
        const { username, nickname, password } = data;
        const user = await this.userService.create({
            username,
            nickname,
            password,
            actived: true,
        } as any);
        return this.userService.findOneByCondition({ id: user.id });
    }

    /**
     * 通过验证码注册
     * @param data
     */
    async registerByCaptcha(data: CaptchaValidate<{ password?: string }>) {
        const { value, password } = data;
        const expired = await this.checkCodeExpired(data, CaptchaActionType.REGISTER);
        if (expired) {
            throw new BadRequestException('captcha has been expired,cannot used to register');
        }
        const user = new UserEntity();
        if (password) user.password = password;
        user.actived = true;
        user.email = value;
        // 储存用户
        await user.save();
        return this.userService.findOneByCondition({ id: user.id });
    }

    /**
     * 通过验证码重置密码
     * @param data
     */
    async retrievePassword(data: CaptchaValidate<{ password: string }>) {
        const { value, password } = data;
        const expired = await this.checkCodeExpired(data, CaptchaActionType.RETRIEVEPASSWORD);
        if (expired) {
            throw new ForbiddenException(
                'captcha has been expired,cannot to used to retrieve password',
            );
        }
        const user = await this.userService.findOneByCredential(value);
        const error = `user not exists of credential ${value}`;
        if (!user) {
            throw new ForbiddenException(error);
        }
        user.password = await encrypt(password);
        await this.userRepository.save(pick(user, ['id', 'password']));
        return this.userService.findOneByCondition({ id: user.id });
    }

    /**
     * 绑定或更改手机号/邮箱
     * @param user
     * @param data
     */
    async boundCaptcha(user: UserEntity, data: CaptchaValidate) {
        const { code, value } = data;
        const error = {
            code: 2002,
            message: 'new email captcha code is error',
        };

        const captcha = await this.captchaRepository.findOne({
            where: {
                code,
                value,
                action: CaptchaActionType.ACCOUNTBOUND,
            },
        });
        if (!captcha) {
            throw new ForbiddenException(error);
        }
        user.email = value;
        await this.userRepository.save(user);
        return this.userService.findOneByCondition({ id: user.id });
    }

    /**
     * 检测验证码是否过期
     * @param data
     * @param action
     */
    protected async checkCodeExpired(data: CaptchaValidate, action: CaptchaActionType) {
        const { value, code } = data;
        const conditional: Record<string, any> = { code, value, action };
        const codeItem = await this.captchaRepository.findOne({
            where: conditional,
        });
        if (!codeItem) {
            throw new ForbiddenException('captcha code is not incorrect');
        }
        const { expired } = await getUserConfig<CaptchaTimeOption>(`captcha.time.${action}`);
        return (await getTime({ date: codeItem.updated_at }))
            .add(expired, 'second')
            .isBefore(await getTime());
    }

    protected async getGoogleUser(request: FastifyRequest) {
        if (!has(request.query, 'code')) throw new UnauthorizedException();
        const { code } = request.query as any;
        const result = await firstValueFrom(
            this.httpService
                .post('https://oauth2.googleapis.com/token', {
                    code,
                    client_id: this.configure.env('GOOGLE_CLIENT_ID', null),
                    client_secret: this.configure.env('GOOGLE_CLIENT_SECRET', null),
                    redirect_uri: `https://${this.configure.env('APP_URL')}/google/login`,
                    grant_type: 'authorization_code',
                })
                .pipe(
                    catchError((error: AxiosError) => {
                        throw new UnauthorizedException();
                    }),
                ),
        );
        if (!has(result, 'data.access_token')) throw new UnauthorizedException();
        const googleToken = (result.data as any).access_token;
        const googleUser = await firstValueFrom(
            this.httpService
                .get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    params: {
                        access_token: googleToken,
                        // personFields: 'names,emailAddresses',
                    },
                })
                .pipe(
                    catchError((error: AxiosError) => {
                        throw new UnauthorizedException();
                    }),
                ),
        );
        return googleUser as Record<string, any>;
    }

    /**
     * 导入Jwt模块
     */
    static jwtModuleFactory() {
        return JwtModule.registerAsync({
            useFactory: async () => {
                const config = await getUserConfig<UserConfig>();
                return {
                    secret: config.jwt.secret,
                    ignoreExpiration: App.configure.getRunEnv() === EnvironmentType.DEVELOPMENT,
                    signOptions: { expiresIn: `${config.jwt.token_expired}s` },
                };
            },
        });
    }
}
