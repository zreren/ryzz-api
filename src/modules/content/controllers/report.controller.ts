import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { isNil } from 'lodash';

import { manualPaginateWithItems } from '@/modules/database/helpers';
import { Depends } from '@/modules/restful/decorators';

import { ListQueryDto } from '@/modules/restful/dtos';
import { ReqUser } from '@/modules/user/decorators';

import { UserEntity } from '@/modules/user/entities';

import { ContentModule } from '../content.module';
import { CreateReportDto } from '../dtos/report.dto';
import { CommentEntity, PostEntity, ReportEntity } from '../entities';

@ApiTags('举报')
@ApiBearerAuth()
@Depends(ContentModule)
@Controller('/report')
export class ReportController {
    @ApiOperation({ summary: '列表' })
    @Get()
    async list(@Query() query: ListQueryDto, @ReqUser() user: UserEntity) {
        const data = await ReportEntity.createQueryBuilder('report')
            .leftJoinAndSelect('report.reporter', 'reporter')
            .leftJoinAndSelect('report.post', 'post')
            .leftJoinAndSelect('report.comment', 'comment')
            .leftJoinAndSelect('report.user', 'user')
            .where('reporter.id = :userId', { userId: user.id })
            .skip((query.page - 1) * query.limit)
            .take(query.limit)
            .getManyAndCount();
        return manualPaginateWithItems(query, data[0], data[1]);
    }

    @Post()
    async create(@Body() data: CreateReportDto, @ReqUser() user: UserEntity) {
        return ReportEntity.save({
            reporter: user,
            content: data.content,
            post: data.post ? await PostEntity.findOneBy({ id: data.post }) : null,
            comment: data.comment ? await CommentEntity.findOneBy({ id: data.comment }) : null,
            user: data.user ? await UserEntity.findOneBy({ id: data.user }) : null,
        });
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @ReqUser() user: UserEntity) {
        const report = await ReportEntity.createQueryBuilder()
            .where('id = :id', { id })
            .andWhere('reporterId = :reporterId', { reporterId: user.id })
            .getOne();
        if (!isNil(report)) {
            report.remove();
        }
    }
}
