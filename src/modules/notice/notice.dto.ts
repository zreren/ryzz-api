import { PickType } from '@nestjs/swagger';

import { ListQueryDto } from '../restful/dtos';

import { NoticeTypes } from './types';

export class QueryDto extends ListQueryDto {
    /**
     * 类型
     * @example like
     */
    type: NoticeTypes;
}

export class MarkReadDto extends PickType(QueryDto, ['type']) {}
