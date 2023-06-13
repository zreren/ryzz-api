import { Injectable } from '@nestjs/common';

import { PaginateReturn } from '../database/types';
import { UserEntity } from '../user/entities';

import { NoticeEntity } from './entities/notice.entity';
import { QueryDto } from './notice.dto';
import { NoticeTypes } from './types';

@Injectable()
export class NoticeService {
    async paginate(user: UserEntity, queryDto: QueryDto): Promise<PaginateReturn<NoticeEntity>> {
        const query = NoticeEntity.createQueryBuilder('notice').leftJoinAndSelect(
            'notice.user',
            'notice.operator',
        );
        switch (queryDto.type) {
            case NoticeTypes.COLLECT:
            case NoticeTypes.LIKE:
                query.leftJoinAndSelect('notice.post', 'post');
                break;
            case NoticeTypes.COMMENT:
                query.leftJoinAndSelect('notice.comment', 'comment');
                break;
            default:
                break;
        }
        query
            .where('notice.userId = :userId', { userId: user.id })
            .offset(queryDto.limit * (queryDto.page - 1))
            .limit(queryDto.limit);
        const data = await query.getManyAndCount();
        return {
            items: data[0],
            meta: {
                totalItems: data[1],
                itemCount: data[0].length,
                perPage: queryDto.limit,
                totalPages: Math.ceil(data[1] / queryDto.limit),
                currentPage: queryDto.page,
                nextPage: data[0].length > 0 ? queryDto.page + 1 : 0,
            },
        };
    }
}
