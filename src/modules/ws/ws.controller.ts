import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Depends } from '../restful/decorators';
import { ReqUser } from '../user/decorators';
import { UserEntity } from '../user/entities';
import { WsModule } from './ws.module';
import { WsService } from './ws.service';
import { MarkReadDto, QueryMessageDto, QueryUnreceivedMessageDto } from './ws.dto';

@ApiTags('聊天')
@ApiBearerAuth()
@Depends(WsModule)
@Controller('/')
export class WsController {
    constructor(private readonly service: WsService) {}

    @ApiOperation({ summary: '历史消息列表' })
    @Get('/messages')
    async messages(@Query() dto: QueryMessageDto, @ReqUser() user: UserEntity) {
        return this.service.getMessages(user.id, dto.sender, dto.currentMaxMessageId, dto.limit);
    }

    @ApiOperation({ summary: '未接收消息列表' })
    @Get('/unreceivedMessages')
    async unreceivedMessages(@Query() dto: QueryUnreceivedMessageDto, @ReqUser() user: UserEntity) {
        return this.service.getUnreceivedMessage(user, dto.currentMaxMessageId, dto.limit);
    }

    @ApiOperation({ summary: '标记消息已收到' })
    @Post('/markChatMessageReceived')
    async markChatMessageReceived(@Body() dto: MarkReadDto, @ReqUser() user: UserEntity) {
        const affectedRows = await this.service.markChatMessageReceived(user.id, dto.maxMessageId);
        return {
            affectedRows,
        }
    }
}
