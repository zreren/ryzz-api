import { InternalServerErrorException, SerializeOptions } from '@nestjs/common';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { isArray, isFunction, isNil, omit, sampleSize } from 'lodash';

import { In, SelectQueryBuilder, EntityNotFoundError } from 'typeorm';

import { BaseService } from '@/modules/database/base';
import { manualPaginate, manualPaginateWithItems, paginate } from '@/modules/database/helpers';
import { QueryHook } from '@/modules/database/types';

import { UserBanEntity, UserEntity } from '@/modules/user/entities';

import { FollowService } from '@/modules/user/services';

import { Countries, PostOrderType } from '../constants';

import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos/post.dto';
import {
    CollectEntity,
    CollectPostEntity,
    PostLikeEntity,
    PostUserViewRecordEntity,
} from '../entities';
import { PostEntity } from '../entities/post.entity';
import { PostCollectEvent, PostPublishedEvent } from '../events';
import { CategoryRepository } from '../repositories/category.repository';
import { PostRepository } from '../repositories/post.repository';

import { SearchType } from '../types';

import { CategoryService } from './category.service';
import { LikeService } from './like.service';
import { SearchService } from './search.service';

// 文章查询接口
type FindParams = {
    [key in keyof Omit<QueryPostDto, 'limit' | 'page'>]: QueryPostDto[key];
};

/**
 * 文章数据操作
 */
export class PostService extends BaseService<PostEntity, PostRepository, FindParams> {
    protected enableTrash = true;

    constructor(
        protected repository: PostRepository,
        protected categoryRepository: CategoryRepository,
        protected categoryService: CategoryService,
        private readonly jwtService: JwtService,
        protected readonly eventEmitter: EventEmitter2,
        protected readonly likeService: LikeService,
        protected readonly followService: FollowService,
        protected searchService?: SearchService,
        protected search_type: SearchType = 'against',
    ) {
        super(repository);
    }

    /**
     * 获取首页帖子列表
     */
    async getHomeList(requestToken: string, country: string, page = 1, limit = 10) {
        // 普通分页数据
        const orderBy = PostOrderType.PUBLISHED;

        // 登录用户
        if (!isNil(requestToken)) {
            const { sub } = this.jwtService.decode(requestToken);
            if (!isNil(sub)) {
                const posts = await this.getUserHomeList(sub, country, limit);
                const data =
                    posts.length > 0
                        ? manualPaginateWithItems(
                              { page, limit },
                              posts.map((v) => Object.assign(v, { isLiked: false })),
                              0,
                          )
                        : await this.paginate({ page, limit, orderBy });
                data.items = await this.renderPostInfo<PostEntity>(sub, data.items);
                return data;
            }
        }

        // 游客
        return this.paginate({ page, limit, orderBy });
    }

    /**
     * 获取登录用户首页帖子列表
     * 70%当地贴 + 30%其他贴
     * @param userId
     * @param clientCountry
     * @param page
     * @param count
     */
    async getUserHomeList(userId: string, clientCountry: string, limit = 10) {
        if (isNil(clientCountry)) {
            // todo 使用用户信息中的国家信息
        }
        const viewedPosts = await PostUserViewRecordEntity.query(
            ...PostUserViewRecordEntity.createQueryBuilder(PostUserViewRecordEntity.name)
                .where('userId = :userId', { userId })
                .select(['postId'])
                .getQueryAndParameters(),
        );
        const banedUsers = await UserBanEntity.query(
            ...UserBanEntity.createQueryBuilder(UserBanEntity.name)
                .where('userId = :userId', { userId })
                .select(['banedUserId'])
                .getQueryAndParameters(),
        );
        const viewedPostIds = viewedPosts
            .map((item: any) => {
                return item.postId;
            })
            .concat(['']);
        const banedUserIds = banedUsers
            .map((item: any) => {
                return item.banedUserId;
            })
            .concat(['']);
        const country =
            clientCountry in Countries
                ? Object.values(Countries)[Object.keys(Countries).indexOf(clientCountry)]
                : 'bt';
        const minPublishedAt = 0;
        const sameQuery = PostEntity.createQueryBuilder(PostEntity.name)
            .where('country = :country', { country })
            .andWhere('userId NOT IN (:...banedUserIds)', { banedUserIds })
            .andWhere('id NOT IN (:...viewedPostIds)', { viewedPostIds })
            .andWhere('publishedAt > :minPublishedAt', { minPublishedAt })
            .select(['id'])
            .orderBy('publishedAt', 'DESC')
            .limit(5000);
        const sameCountryPosts = await PostEntity.query(...sameQuery.getQueryAndParameters());
        const differentCountryPosts = await PostEntity.query(
            ...PostEntity.createQueryBuilder(PostEntity.name)
                .where('country != :country', { country })
                .andWhere('userId NOT IN (:...banedUserIds)', { banedUserIds })
                .andWhere('id NOT IN (:...viewedPostIds)', { viewedPostIds })
                .andWhere('publishedAt > :minPublishedAt', { minPublishedAt })
                .select(['id'])
                .orderBy('publishedAt', 'DESC')
                .limit(5000)
                .getQueryAndParameters(),
        );
        const sameCountryPostIds = isNil(sameCountryPosts)
            ? []
            : sameCountryPosts.map((item: any) => {
                  return item.id;
              });
        const differentCountryPostIds = isNil(differentCountryPosts)
            ? []
            : differentCountryPosts.map((item: any) => {
                  return item.id;
              });

        const postSame = sampleSize(sameCountryPostIds, limit * 0.7);
        const postDifferent = sampleSize(differentCountryPostIds, limit - postSame.length);
        // 补齐数目
        if (postDifferent.length < limit - postSame.length) {
            const postSameNew = sampleSize(sameCountryPostIds, limit - postDifferent.length);
            postSame.length = 0;
            postSame.push(...postSameNew);
        }
        const postIds = postSame.concat(postDifferent);
        if (postIds.length === 0) {
            return [];
        }

        const newViewedPosts = postIds.map((postId) => {
            return {
                postId,
                userId,
            };
        });
        PostUserViewRecordEntity.insert(newViewedPosts);

        return this.repository.find({ where: { id: In(postIds) } });
    }

    /**
     * 获取分页数据
     * @param options 分页选项
     * @param callback 添加额外的查询
     */
    async paginate(options: QueryPostDto, callback?: QueryHook<PostEntity>) {
        if (
            !isNil(this.searchService) &&
            !isNil(options.search) &&
            this.search_type === 'elastic'
        ) {
            const { search: text, page, limit } = options;
            const results = await this.searchService.search(text);
            const ids = results.map((result) => result.id);
            const posts =
                ids.length <= 0 ? [] : await this.repository.find({ where: { id: In(ids) } });
            return manualPaginate({ page, limit }, posts);
        }
        const qb = await this.buildListQB(this.repository.buildBaseQB(), options, callback);
        return paginate(qb, options);
    }

    async getLikePosts(userId: string, page = 1, limit = 10) {
        const data = await PostLikeEntity.createQueryBuilder('post_like')
            .leftJoinAndSelect('post_like.post', 'post')
            .leftJoinAndSelect('post.user', 'user')
            .where('post_like.userId = :userId', { userId })
            .orderBy('post_like.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        data[0] = data[0].map((v) => {
            v.post.isLiked = true;
            return v;
        });

        return manualPaginateWithItems({ page, limit }, data[0], data[1]);
    }

    /**
     * 查询单篇文章
     * @param id
     * @param callback 添加额外的查询
     */
    @SerializeOptions({
        groups: ['post-detail'],
    })
    async detail(id: string, loginUser?: UserEntity, callback?: QueryHook<PostEntity>) {
        let qb = this.repository.buildBaseQB();
        qb.where(`post.id = :id`, { id });
        qb = !isNil(callback) && isFunction(callback) ? await callback(qb) : qb;
        const item = await qb.getOne();
        if (!item) throw new EntityNotFoundError(PostEntity, `The post ${id} not exists!`);
        if (loginUser) {
            item.user.isFollowing = await this.followService.isFollowing(
                loginUser.id,
                item.user.id,
            );
            item.isLiked =
                (await this.likeService.getUserLikedPostIds(loginUser.id, [id])).length === 1;
            item.isCollected = await CollectPostEntity.createQueryBuilder('collect_post')
                .leftJoinAndSelect('collect_post.collect', 'collect')
                .leftJoinAndSelect('collect_post.post', 'post')
                .leftJoinAndSelect('collect.user', 'user')
                .where('post.id = :postId', { postId: id })
                .andWhere('user.id = :userId', { userId: loginUser.id })
                .getExists();
        }

        return item;
    }

    /**
     * 创建文章
     * @param data
     */
    async create(data: CreatePostDto, user: UserEntity) {
        const createPostDto = {
            ...data,
            // 文章所属分类
            categories: isArray(data.categories)
                ? await this.categoryRepository.findBy({
                      id: In(data.categories),
                  })
                : [],
            user,
            publishedAt: isNil(data.isDraft) || !data.isDraft ? Date.now() / 1000 : 0,
        };
        const item = await this.repository.save(createPostDto);
        if (!isNil(this.searchService)) {
            try {
                await this.searchService.create(item);
            } catch (err) {
                throw new InternalServerErrorException(err);
            }
        }

        if (!item.is_draft) {
            this.eventEmitter.emit(
                'post.published',
                new PostPublishedEvent({
                    post_id: item.id,
                    user_id: user.id,
                    publish_time: item.publishedAt,
                }),
            );
        }

        return this.detail(item.id);
    }

    /**
     * 更新文章
     * @param data
     */
    async update(data: UpdatePostDto) {
        const post = await this.detail(data.id);
        if (!post.is_draft && !isNil(data.isDraft) && data.isDraft) {
            throw new InternalServerErrorException('published post cannot change to draft!');
        }
        if (isArray(data.categories)) {
            // 更新文章所属分类
            await this.repository
                .createQueryBuilder('post')
                .relation(PostEntity, 'categories')
                .of(post)
                .addAndRemove(data.categories, post.categories ?? []);
        }
        const updateData = omit(data, ['id', 'categories', 'isDraft']);
        const publishedAt =
            post.is_draft && !isNil(data.isDraft) && !data.isDraft ? Date.now() / 1000 : 0;
        await this.repository.update(
            data.id,
            Object.assign(updateData, { publishedAt, is_draft: data.isDraft }),
        );
        if (!isNil(this.searchService)) {
            try {
                await this.searchService.update(post);
            } catch (err) {
                throw new InternalServerErrorException(err);
            }
        }

        if (publishedAt > 0) {
            this.eventEmitter.emit(
                'post.published',
                new PostPublishedEvent({
                    post_id: post.id,
                    user_id: post.user.id,
                    publish_time: publishedAt,
                }),
            );
        }

        return this.detail(data.id);
    }

    /**
     * 删除文章
     * @param ids
     * @param trash
     */
    async delete(ids: string[], trash?: boolean) {
        const result = await super.delete(ids, trash);
        if (!isNil(this.searchService)) {
            try {
                for (const id of ids) await this.searchService.remove(id);
            } catch (err) {
                throw new InternalServerErrorException(err);
            }
        }
        return result;
    }

    /**
     * 恢复文章
     * @param ids
     */
    async restore(ids: string[]) {
        const result = await super.restore(ids);
        if (!isNil(this.searchService)) {
            try {
                for (const item of result) await this.searchService.create(item);
            } catch (err) {
                throw new InternalServerErrorException(err);
            }
        }
        return result;
    }

    /**
     * 收藏
     * @param user
     * @param postId
     * @param collectId
     */
    async collect(user: UserEntity, postId: string, collectId: string) {
        const collect = await CollectEntity.findOne({
            where: { id: collectId },
            relations: ['user'],
        });
        const post = await PostEntity.findOne({ where: { id: postId }, relations: ['user'] });
        if (isNil(post) || isNil(collect) || collect.user.id !== user.id) {
            return;
        }
        const now = new Date();
        const result = await CollectPostEntity.createQueryBuilder('collect_post')
            .insert()
            .orIgnore()
            .updateEntity(false)
            .values({
                collect,
                post,
                createdAt: now,
            })
            .execute();
        if (result.raw.affectedRows === 1) {
            this.eventEmitter.emit(
                'post.collect',
                new PostCollectEvent({
                    post_id: post.id,
                    collect_id: collect.id,
                    user_id: user.id,
                    target_user_id: post.user.id,
                    created_at: now,
                }),
            );
        }
    }

    /**
     * 取消收藏
     * @param user
     * @param postId
     * @param collectId
     */
    async cancelCollect(user: UserEntity, postId: string, collectId: string) {
        CollectPostEntity.createQueryBuilder()
            .where('postId = :postId', { postId })
            .andWhere('collectId = :collectId', { collectId })
            .delete()
            .execute();
    }

    /**
     * 构建文章列表查询器
     * @param querBuilder 初始查询构造器
     * @param options 排查分页选项后的查询选项
     * @param callback 添加额外的查询
     */
    protected async buildListQB(
        querBuilder: SelectQueryBuilder<PostEntity>,
        options: FindParams,
        callback?: QueryHook<PostEntity>,
    ) {
        const { category, orderBy, search, isDraft, user } = options;
        const qb = await super.buildListQB(querBuilder, options, callback);
        if (!isNil(search)) {
            if (this.search_type === 'like') {
                qb.andWhere('title LIKE :search', { search: `%${search}%` })
                    .orWhere('body LIKE :search', { search: `%${search}%` })
                    .orWhere('post.categories LIKE :search', {
                        search: `%${search}%`,
                    });
            } else {
                qb.andWhere('MATCH(title) AGAINST (:search IN BOOLEAN MODE)', {
                    search: `${search}*`,
                })
                    .orWhere('MATCH(body) AGAINST (:search IN BOOLEAN MODE)', {
                        search: `${search}*`,
                    })
                    .orWhere('MATCH(categories.name) AGAINST (:search IN BOOLEAN MODE)', {
                        search: `${search}*`,
                    });
            }
        }

        qb.andWhere('is_draft = :is_draft', { is_draft: !isNil(isDraft) && isDraft });

        if (!isNil(user)) {
            qb.andWhere('user.id = user', { user });
        }

        this.addOrderByQuery(qb, orderBy);
        if (category) await this.queryByCategory(category, qb);
        return qb;
    }

    /**
     *  对文章进行排序的Query构建
     * @param qb
     * @param orderBy 排序方式
     */
    protected addOrderByQuery(qb: SelectQueryBuilder<PostEntity>, orderBy?: PostOrderType) {
        switch (orderBy) {
            case PostOrderType.CREATED:
                return qb.orderBy('post.createdAt', 'DESC');
            case PostOrderType.UPDATED:
                return qb.orderBy('post.updatedAt', 'DESC');
            case PostOrderType.PUBLISHED:
                return qb.orderBy('post.publishedAt', 'DESC');
            case PostOrderType.COMMENTCOUNT:
                return qb.orderBy('commentCount', 'DESC');
            default:
                return qb.orderBy('post.publishedAt', 'DESC');
        }
    }

    /**
     * 查询出分类及其后代分类下的所有文章的Query构建
     * @param id
     * @param qb
     */
    protected async queryByCategory(id: string, qb: SelectQueryBuilder<PostEntity>) {
        const root = await this.categoryService.detail(id);
        const tree = await this.categoryRepository.findDescendantsTree(root);
        const flatDes = await this.categoryRepository.toFlatTrees(tree.children);
        const ids = [tree.id, ...flatDes.map((item) => item.id)];
        return qb.where('categories.id IN (:...ids)', {
            ids,
        });
    }

    /**
     * 渲染post信息
     * @param userId
     * @param posts
     */
    protected async renderPostInfo<T>(userId: string, posts: PostEntity[]): Promise<T[]> {
        const userLikedPostIds = await this.likeService.getUserLikedPostIds(
            userId,
            posts.map((v: PostEntity) => v.id),
        );
        return posts.map((v) => {
            v.isLiked = userLikedPostIds.includes(v.id);
            return v as T;
        });
    }
}
