import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Depends } from '@/modules/restful/decorators';

import { Guest } from '@/modules/user/decorators';

import { ContentModule } from '../content.module';
import { TencentCloudService } from '../services/cloud.tencent.service';

@ApiTags('通用')
@ApiBearerAuth()
@Depends(ContentModule)
@Controller('/common')
export class CommonController {
    constructor(private readonly tecentCloudService: TencentCloudService){}

    @ApiOperation({ summary: '配置' })
    @Get('/configs')
    @Guest()
    async configs() {
        return {
            socket: {
                server: process.env.WEBSOCKET_SERVER,
                heartbeat: 10,
            }
        };
    }

    @ApiOperation({ summary: '上传凭证' })
    @Get('/uploadToken')
    async getUploadToken() {
        return this.tecentCloudService.getFederationToken();
    }
}
