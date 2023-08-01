import { Injectable } from '@nestjs/common';

import { PaginateReturn } from '../database/types';
import { UserEntity } from '../user/entities';

import { NoticeEntity } from './entities/notice.entity';
import { QueryDto } from './notice.dto';

@Injectable()
export class NoticeService {
    async paginate(user: UserEntity, queryDto: QueryDto): Promise<PaginateReturn<NoticeEntity>> {
        const query = NoticeEntity.createQueryBuilder('notice')
            .leftJoinAndSelect('notice.user', 'user')
            .leftJoinAndSelect('notice.operator', 'operator')
            .leftJoinAndSelect('notice.post', 'post')
            .leftJoinAndSelect('notice.comment', 'comment')
            .where('notice.userId = :userId', { userId: user.id })
            .andWhere('notice.type = :type', { type: queryDto.type })
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
