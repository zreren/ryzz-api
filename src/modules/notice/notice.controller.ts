import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Depends } from '../restful/decorators';
import { ReqUser } from '../user/decorators';
import { UserEntity } from '../user/entities';

import { NoticeEntity } from './entities/notice.entity';
import { MarkReadDto, QueryDto } from './notice.dto';
import { NoticeModule } from './notice.module';
import { NoticeService } from './notice.service';
import { NoticeTypes } from './types';

@ApiTags('通知消息')
@ApiBearerAuth()
@Depends(NoticeModule)
@Controller('/')
export class NoticeController {
    constructor(private readonly service: NoticeService) {}

    @ApiOperation({ summary: '消息列表' })
    @Get('/list')
    async list(@Query() dto: QueryDto, @ReqUser() user: UserEntity) {
        console.log('list');
        return this.service.paginate(user, dto);
    }

    @ApiOperation({ summary: '通知概要' })
    @Get('/summary')
    async summary(@ReqUser() user: UserEntity) {
        console.log('summary');
        return NoticeEntity.createQueryBuilder()
            .where('userId = :userId', { userId: user.id })
            .where(`type IN(:...types)`, { types: Object.values(NoticeTypes) })
            .andWhere('is_read = :is_read', { is_read: false })
            .groupBy('type')
            .select('`type`, COUNT(`id`) AS `c`')
            .getRawMany();
    }

    @ApiOperation({ summary: '标记已读' })
    @Post('/markRead')
    async markRead(@Body() dto: MarkReadDto, @ReqUser() user: UserEntity) {
        console.log('read');
        NoticeEntity.createQueryBuilder()
            .where('userId = :userId', { userId: user.id })
            .andWhere('type = :type', { type: dto.type })
            .andWhere('is_read = :is_read', { is_read: false })
            .update({
                is_read: true,
            });
    }
}
