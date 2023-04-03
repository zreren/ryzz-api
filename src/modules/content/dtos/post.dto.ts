import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDefined, IsEnum, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';

import { IsDataExist } from '@/modules/database/constraints';

import { ListQueryDto } from '@/modules/restful/dtos';

import { PostOrderType } from '../constants';
import { CategoryEntity } from '../entities';

/**
 * 帖子分页查询验证
 */
@DtoValidation({ type: 'query' })
export class QueryPostDto extends ListQueryDto {
    @ApiPropertyOptional({
        description: '搜索关键字:帖子全文搜索字符串',
        maxLength: 100,
    })
    @MaxLength(100, {
        always: true,
        message: '搜索字符串长度不得超过$constraint1',
    })
    @IsOptional({ always: true })
    search?: string;

    @ApiPropertyOptional({
        description: '分类ID:过滤一个分类及其子孙分类下的帖子',
    })
    @IsDataExist(CategoryEntity, {
        message: '指定的分类不存在',
    })
    @IsUUID(undefined, { message: '分类ID格式错误' })
    @IsOptional()
    category?: string;

    @ApiPropertyOptional({
        description: '排序规则:可指定帖子列表的排序规则,默认为综合排序',
        enum: PostOrderType,
    })
    @IsEnum(PostOrderType, {
        message: `排序规则必须是${Object.values(PostOrderType).join(',')}其中一项`,
    })
    @IsOptional()
    orderBy?: PostOrderType;
}

/**
 * 帖子创建验证
 */
@DtoValidation({ groups: ['create'] })
export class CreatePostDto {
    @ApiProperty({ description: '帖子标题', maxLength: 255 })
    @MaxLength(255, {
        always: true,
        message: '帖子标题长度最大为$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '帖子标题必须填写' })
    @IsOptional({ groups: ['update'] })
    title!: string;

    @ApiProperty({ description: '帖子内容' })
    @IsNotEmpty({ groups: ['create'], message: '帖子内容必须填写' })
    @IsOptional({ groups: ['update'] })
    body!: string;

    @ApiPropertyOptional({
        description: '关联分类ID列表:一篇帖子可以关联多个分类',
        type: [String],
    })
    @IsDataExist(CategoryEntity, {
        each: true,
        always: true,
        message: '分类不存在',
    })
    @IsUUID(undefined, {
        each: true,
        always: true,
        message: '分类ID格式不正确',
    })
    @IsOptional({ always: true })
    categories?: string[];
}

/**
 * 帖子更新验证
 */
@DtoValidation({ groups: ['update'] })
export class UpdatePostDto extends PartialType(CreatePostDto) {
    @ApiProperty({
        description: '待更新的帖子ID',
    })
    @IsUUID(undefined, { groups: ['update'], message: '帖子ID格式错误' })
    @IsDefined({ groups: ['update'], message: '帖子ID必须指定' })
    id!: string;
}
