import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Depends } from '../restful/decorators';
import { ReqUser } from '../user/decorators';
import { UserEntity } from '../user/entities';
import { WsModule } from './ws.module';
import { WsService } from './ws.service';
import { MarkReadDto, QueryDto } from './ws.dto';


@ApiTags('聊天')
@ApiBearerAuth()
@Depends(WsModule)
@Controller('/')
export class WsController {
    constructor(private readonly service: WsService) {}

    @ApiOperation({ summary: '未读消息' })
    @Get('/unread')
    async unread(@Query() dto: QueryDto, @ReqUser() user: UserEntity) {
        console.log('unread');
    }

    @ApiOperation({ summary: '标记已读' })
    @Post('/markRead')
    async markRead(@Body() dto: MarkReadDto, @ReqUser() user: UserEntity) {
        this.service.markChatMessageRead(user.id, dto.messageIds);
        console.log('read');
    }
}
