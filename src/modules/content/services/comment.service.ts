import { ForbiddenException, Injectable } from '@nestjs/common';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { groupBy, isNil, keyBy } from 'lodash';

import { EntityNotFoundError, In, SelectQueryBuilder } from 'typeorm';

import { BaseService } from '@/modules/database/base';

import { manualPaginateWithItems } from '@/modules/database/helpers';
import { UserEntity } from '@/modules/user/entities';

import { CreateCommentDto, QueryCommentDto, QueryCommentTreeDto } from '../dtos';
import { PostEntity } from '../entities';
import { CommentEntity } from '../entities/comment.entity';
import { CommentPublishedEvent } from '../events/commentPublished.event';
import { CommentRepository } from '../repositories/comment.repository';
import { PostRepository } from '../repositories/post.repository';

import { LikeService } from './like.service';

/**
 * 评论数据操作
 */
@Injectable()
export class CommentService extends BaseService<CommentEntity, CommentRepository> {
    constructor(
        protected repository: CommentRepository,
        protected postRepository: PostRepository,
        private readonly eventEmitter: EventEmitter2,
        private readonly jwtService: JwtService,
        private readonly likeService: LikeService,
    ) {
        // 设置mpath可见
        repository.metadata.columns = repository.metadata.columns.map((x) => {
            if (x.databaseName === 'mpath') {
                x.isVirtual = false;
            }
            return x;
        });
        super(repository);
    }

    /**
     * 查询一级评论，附带固定数量的二级评论
     */
    async getPostComments(
        post: PostEntity,
        loginUserId: string | null,
        page = 1,
        limit = 10,
        childrenCommentCount = 3,
    ) {
        const query = CommentEntity.createQueryBuilder('comment')
            .withDeleted()
            .leftJoinAndSelect('comment.user', 'commentUser')
            .where(`comment.postId = :postId`, { postId: post.id })
            .andWhere('comment.parentId IS NULL')
            .orderBy('comment.id', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        const data = await query.getManyAndCount();

        // 每个根节点获取固定数量的叶子结点(可根据日期或点赞数排序)
        const rootCommentIds = data[0].map((v: CommentEntity) => v.id);
        if (rootCommentIds.length > 0) {
            const sql = `SELECT id, p FROM (
                SELECT *, substring(mpath, 1, instr(mpath, '.')) as p, ROW_NUMBER() OVER (PARTITION BY substring(mpath, 1, instr(mpath, '.')) ORDER BY id DESC) AS n
                FROM content_comments
                where parentId is not null and (${rootCommentIds
                    .map((v: string) => ` mpath like '${v}.%' or `)
                    .join('')} false)
            ) AS x WHERE n <= ${childrenCommentCount}`;
            const children = await CommentEntity.getRepository().manager.query(sql);
            const rootChildrenIds = groupBy(children, 'p');
            const childrenComments = keyBy(
                await CommentEntity.find({
                    where: {
                        id: In(children.map((v: CommentEntity) => v.id)),
                    },
                    relations: ['user', 'parent', 'parent.user'],
                    order: {
                        id: 'DESC',
                    },
                }),
                'id',
            );
            data[0] = data[0].map((v) => {
                const k = `${v.id}.`;
                v.children = [];
                if (!isNil(rootChildrenIds[k]) && rootChildrenIds[k].length !== 0) {
                    v.children = rootChildrenIds[k].map((c: CommentEntity) => {
                        return childrenComments[c.id];
                    });
                }
                return v;
            });
        }

        return manualPaginateWithItems(
            { page, limit },
            await this.renderCommentInfo(data[0], loginUserId),
            data[1],
        );
    }

    /**
     * 获取子评论列表
     */
    async getChildrenComments(
        parent: CommentEntity,
        loginUserId: string | null,
        page = 1,
        limit = 10,
    ) {
        const qb = CommentEntity.createQueryBuilder('comment')
            .withDeleted()
            .leftJoinAndSelect('comment.user', 'user')
            .leftJoinAndSelect('comment.parent', 'parent')
            .leftJoinAndSelect('parent.user', 'parentUser')
            .andWhere('comment.parent = :id', { id: parent.id })
            // .andWhere('comment.parent is not null')
            .skip((page - 1) * limit)
            .take(limit);
        const data = await qb.getManyAndCount();
        return manualPaginateWithItems(
            { page, limit },
            await this.renderCommentInfo(data[0], loginUserId),
            data[1],
        );
    }

    /**
     * 直接查询评论树
     * @param options
     */
    async findTrees(options: QueryCommentTreeDto = {}, requestToken = '') {
        const comments = await this.repository.findTrees({
            addQuery: async (qb) => {
                return isNil(options.post) ? qb : qb.where('post.id = :id', { id: options.post });
            },
        });

        // 登录用户
        if (comments.length > 0 && !isNil(requestToken)) {
            const { sub } = this.jwtService.decode(requestToken);
            if (!isNil(sub)) {
                const flatTrees = await this.repository.toFlatTrees(comments);
                const commentIds = flatTrees.map((v: CommentEntity) => v.id);
                const likedCommentIds = await this.likeService.getUserLikedCommentIds(
                    sub,
                    commentIds,
                );
                if (likedCommentIds.length > 0) {
                    return this.repository.toTrees(
                        flatTrees.map((v: CommentEntity) => {
                            v.isLiked = likedCommentIds.includes(v.id);
                            return v;
                        }),
                    );
                }
            }
        }
        return comments;
    }

    /**
     * 查找一篇文章的评论并分页
     * @param dto
     */
    async paginate(options: QueryCommentDto) {
        const { post } = options;
        const addQuery = async (qb: SelectQueryBuilder<CommentEntity>) => {
            const condition: Record<string, string> = {};
            if (!isNil(post)) condition.post = post;
            return Object.keys(condition).length > 0 ? qb.andWhere(condition) : qb;
        };
        return super.paginate({
            ...options,
            addQuery,
        });
    }

    /**
     * 新增评论
     * @param data
     * @param user
     */
    async create(data: CreateCommentDto, user: UserEntity) {
        const parent = await this.getParent(undefined, data.parent);
        if (!isNil(parent) && parent.post.id !== data.post) {
            throw new ForbiddenException('Parent comment and child comment must belong same post!');
        }
        const post = await this.getPost(data.post);
        const item = await this.repository.save({
            ...data,
            parent,
            post,
            user,
        });

        const rootCommentId = parent ? parent.mpath.substring(0, parent.mpath.indexOf('.')) : '';
        this.eventEmitter.emit(
            'comment.published',
            new CommentPublishedEvent({
                comment_id: item.id,
                user_id: user.id,
                target_user_id: post.user.id,
                root_comment_id: rootCommentId,
            }),
        );
        return this.repository.findOneOrFail({ where: { id: item.id } });
    }

    /**
     * 获取评论所属文章实例
     * @param id
     */
    protected async getPost(id: string) {
        return !isNil(id)
            ? this.postRepository.findOneOrFail({ where: { id }, relations: ['user'] })
            : id;
    }

    /**
     * 获取请求传入的父分类
     * @param current 当前分类的ID
     * @param id
     */
    protected async getParent(current?: string, id?: string) {
        if (current === id) return undefined;
        let parent: CommentEntity | undefined;
        if (id !== undefined) {
            if (id === null) return null;
            parent = await this.repository.findOne({
                relations: ['parent', 'post'],
                where: { id },
            });
            if (!parent) {
                throw new EntityNotFoundError(CommentEntity, `Parent comment ${id} not exists!`);
            }
        }
        return parent;
    }

    async renderCommentInfo(
        comments: CommentEntity[],
        userId: string | null,
    ): Promise<CommentEntity[]> {
        const commentIds: string[] = [];
        if (userId) {
            comments.forEach((v: CommentEntity) => {
                commentIds.push(v.id);
                v.children?.forEach((c: CommentEntity) => commentIds.push(c.id));
            });
        }
        const userLikedCommentIds =
            commentIds.length > 0
                ? await this.likeService.getUserLikedCommentIds(userId, commentIds)
                : [];
        return comments.map((v: CommentEntity) => {
            v.interaction_info = {
                liked: userLikedCommentIds.includes(v.id),
                like_count: v.like_count,
                reply_count: v.reply_count,
            };
            v.children = v.children?.map((c: CommentEntity) => {
                c.interaction_info = {
                    liked: userLikedCommentIds.includes(c.id),
                    like_count: c.like_count,
                    reply_count: c.reply_count,
                };
                return c;
            });
            return v;
        });
    }
}
