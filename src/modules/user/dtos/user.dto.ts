import { Injectable } from '@nestjs/common';
import { PickType, PartialType, ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

import { DtoValidation } from '@/modules/core/decorators';
import { tBoolean, tNumber } from '@/modules/core/helpers';
import { IsDataExist } from '@/modules/database/constraints';
import { PermissionEntity, RoleEntity } from '@/modules/rbac/entities';

import { ListQueryDto } from '@/modules/restful/dtos';

import { UserDtoGroups, UserOrderType } from '../constants';

import { UserEntity } from '../entities';

import { GuestDto } from './guest.dto';

/**
 * 创建用的请求数据验证
 */
@DtoValidation({ groups: [UserDtoGroups.CREATE] })
export class CreateUserDto extends PickType(GuestDto, [
    'username',
    'nickname',
    'password',
    'email',
    'avatar',
]) {
    @ApiPropertyOptional({
        description: '用户激活状态(无法禁用第一个超级管理员用户)',
    })
    @IsBoolean({ always: true, message: 'actived必须为布尔值' })
    @IsOptional({ always: true })
    actived?: boolean;

    @ApiPropertyOptional({
        description: '用户关联的角色ID列表',
        type: [String],
    })
    @IsDataExist(RoleEntity, {
        each: true,
        always: true,
        message: '角色不存在',
    })
    @IsUUID(undefined, {
        each: true,
        always: true,
        message: '角色ID格式不正确',
    })
    @IsOptional({ always: true })
    roles?: string[];

    @ApiPropertyOptional({
        description: '用户直接关联的权限ID列表',
        type: [String],
    })
    @IsDataExist(PermissionEntity, {
        each: true,
        always: true,
        message: '权限不存在',
    })
    @IsUUID(undefined, {
        each: true,
        always: true,
        message: '权限ID格式不正确',
    })
    @IsOptional({ always: true })
    permissions?: string[];
}

/**
 * 更新用户
 */
@DtoValidation({ groups: [UserDtoGroups.UPDATE] })
export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiProperty({
        description: '待更新的用户ID',
    })
    @IsDataExist(UserEntity, {
        groups: ['update'],
        message: '指定的用户不存在',
    })
    @IsUUID(undefined, { groups: [UserDtoGroups.UPDATE], message: '用户ID格式不正确' })
    id!: string;

    @ApiPropertyOptional({ description: '添加优惠金额', minimum: 0 })
    @Transform(({ value }) => tNumber(value))
    @Min(0, { message: 'reward must exceed 0' })
    @IsNumber(undefined)
    @IsOptional()
    reward?: number;

    @ApiPropertyOptional({ description: '扣除优惠金额', minimum: 0 })
    @Transform(({ value }) => tNumber(value))
    @Min(0, { message: 'redeemed must exceed 0' })
    @IsNumber(undefined)
    @IsOptional()
    balance?: number;
}

/**
 * 查询用户列表的Query数据验证
 */
@Injectable()
@DtoValidation({
    type: 'query',
    skipMissingProperties: true,
})
export class QueryUserDto extends ListQueryDto {
    @ApiPropertyOptional({
        description: '角色ID:根据角色来过滤用户',
    })
    @IsDataExist(RoleEntity, {
        message: '角色不存在',
    })
    @IsUUID(undefined, { message: '角色ID格式错误' })
    @IsOptional()
    role?: string;

    @ApiPropertyOptional({
        description:
            '权限ID:根据权限来过滤用户(权限包含用户关联的所有角色的权限以及直接关联的权限)',
    })
    @IsDataExist(PermissionEntity, {
        message: '权限不存在',
    })
    @IsUUID(undefined, { message: '权限ID格式错误' })
    @IsOptional()
    permission?: string;

    @ApiPropertyOptional({
        description: '根据是否激活来过滤用户',
    })
    @Transform(({ value }) => tBoolean(value))
    @IsBoolean()
    actived?: boolean;

    @ApiPropertyOptional({
        description: '排序规则:可指定用户列表的排序规则,默认为按创建时间降序排序',
        enum: UserOrderType,
    })
    @IsEnum(UserOrderType)
    declare orderBy?: UserOrderType;
}

@Injectable()
export class UserFollowDto {
    @ApiPropertyOptional({
        description: '被关注者的用户ID',
        type: String,
    })
    @IsDataExist(UserEntity, {
        always: true,
        message: '用户不存在',
    })
    @IsUUID(undefined, {
        always: true,
        message: '用户ID格式不正确',
    })
    @IsOptional({ always: true })
    user?: string;
}

@Injectable()
export class UserUnfollowDto {
    @ApiPropertyOptional({
        description: '被关注者的用户ID',
        type: String,
    })
    @IsUUID(undefined, {
        always: true,
        message: '用户ID格式不正确',
    })
    @IsOptional({ always: true })
    user?: string;
}

@Injectable()
export class BanDto {
    @ApiPropertyOptional({
        description: '被拉黑的用户ID',
        type: String,
    })
    @IsUUID(undefined, {
        always: true,
        message: '用户ID格式不正确',
    })
    user?: string;
}

@Injectable()
export class CancelBanDto extends BanDto {}
