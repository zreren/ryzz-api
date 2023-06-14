import { IsNotEmpty } from 'class-validator';
import { ListQueryDto } from '../restful/dtos';

export class QueryDto extends ListQueryDto {}

export class MarkReadDto {
    /**
     * 消息ID数组
     */
    @IsNotEmpty()
    messageIds: number[];
}
