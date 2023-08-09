import { IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateReportDto {
    @MaxLength(100, {
        always: true,
        message: '理由长度不得超过$constraint1',
    })
    @IsNotEmpty({ groups: ['create'], message: '理由不得为空' })
    content: string;

    @IsOptional()
    @IsUUID(undefined, { always: true, message: '帖子ID不合法' })
    post?: string;

    @IsOptional()
    @IsUUID(undefined, { always: true, message: '评论ID不合法' })
    comment?: string;

    @IsOptional()
    @IsUUID(undefined, { always: true, message: '用户ID不合法' })
    user?: string;
}
