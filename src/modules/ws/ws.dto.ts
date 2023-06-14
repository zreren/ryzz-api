import { IsEnum, IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { ListQueryDto } from '../restful/dtos';
import { MESSAGE_TYPE } from './types';
import { OmitType, PickType } from '@nestjs/swagger';

export class QueryDto extends ListQueryDto {}

export class QueryMessageDto extends PickType(ListQueryDto, ['limit']) {
    /**
     * 当前最大的消息ID
     */
    @IsNotEmpty()
    currentMaxMessageId: number;

    /**
     * 发送者uid
     */
    @IsNumber()
    sender?: string;
}

export class QueryUnreceivedMessageDto extends OmitType(QueryMessageDto, ['sender']) {}

export class MarkReadDto {
    /**
     * 消息ID数组
     */
    // messageIds?: number[];

    /**
     * 最大的消息ID
     */
    @IsNotEmpty()
    maxMessageId: number;
}

export class ChatMessageDto {
    @IsString()
    @IsNotEmpty()
    toUserId: string;

    @IsEnum(MESSAGE_TYPE)
    contentType: MESSAGE_TYPE;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    content: string;

    extra?: any;
}
