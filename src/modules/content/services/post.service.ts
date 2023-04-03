import { InternalServerErrorException } from '@nestjs/common';

import { isArray, isFunction, isNil, omit, sampleSize } from 'lodash';

import { In, SelectQueryBuilder, EntityNotFoundError } from 'typeorm';

import { BaseService } from '@/modules/database/base';
import { manualPaginate, paginate } from '@/modules/database/helpers';
import { QueryHook } from '@/modules/database/types';

import { UserBanEntity, UserEntity } from '@/modules/user/entities';

import { TokenService } from '@/modules/user/services';

import { Countries, PostOrderType } from '../constants';

import { CreatePostDto, QueryPostDto, UpdatePostDto } from '../dtos/post.dto';
import { CollectEntity, PostUserViewRecordEntity } from '../entities';
import { PostEntity } from '../entities/post.entity';
import { CategoryRepository } from '../repositories/category.repository';
import { PostRepository } from '../repositories/post.repository';

import { SearchType } from '../types';

import { CategoryService } from './category.service';
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
        private readonly tokenService: TokenService,
        protected searchService?: SearchService,
        protected search_type: SearchType = 'against',
    ) {
        super(repository);
    }

    /**
     * 获取首页帖子列表
     */
    async getHomeList(requestToken: string, country: string, page = 1, limit = 10) {
        // 登录用户
        if (!isNil(requestToken)) {
            const token = await this.tokenService.checkAccessToken(requestToken);
            if (!isNil(token) && !isNil(token.user)) {
                const posts = await this.getUserHomeList(token.user.id, country, limit);
                if (posts.length > 0) {
                    return posts;
                }
            }
        }

        // 普通分页数据
        const orderBy = PostOrderType.PUBLISHED;
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
        console.log(`view post ids:${viewedPostIds.join(',')}`);
        console.log(`ban user ids:${banedUserIds.join(',')}`);

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
        console.log(`country: ${country}`);
        console.log(`sameCountryPostIds:${sameCountryPostIds.join(',')}`);
        console.log(`differentCountryPostIds:${differentCountryPostIds.join(',')}`);

        const postSame = sampleSize(sameCountryPostIds, limit * 0.7);
        const postDifferent = sampleSize(differentCountryPostIds, limit - postSame.length);
        console.log(1);
        console.log(postSame, postDifferent);
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

        console.log(`results: ${postIds.join(',')}, ${postSame.join(',')}`);
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

    /**
     * 查询单篇文章
     * @param id
     * @param callback 添加额外的查询
     */
    async detail(id: string, callback?: QueryHook<PostEntity>) {
        let qb = this.repository.buildBaseQB();
        qb.where(`post.id = :id`, { id });
        qb = !isNil(callback) && isFunction(callback) ? await callback(qb) : qb;
        const item = await qb.getOne();
        if (!item) throw new EntityNotFoundError(PostEntity, `The post ${id} not exists!`);
        return item;
    }

    /**
     * 创建文章
     * @param data
     */
    async create(data: CreatePostDto) {
        const createPostDto = {
            ...data,
            // 文章所属分类
            categories: isArray(data.categories)
                ? await this.categoryRepository.findBy({
                      id: In(data.categories),
                  })
                : [],
        };
        const item = await this.repository.save(createPostDto);
        if (!isNil(this.searchService)) {
            try {
                await this.searchService.create(item);
            } catch (err) {
                throw new InternalServerErrorException(err);
            }
        }

        return this.detail(item.id);
    }

    /**
     * 更新文章
     * @param data
     */
    async update(data: UpdatePostDto) {
        const post = await this.detail(data.id);
        if (isArray(data.categories)) {
            // 更新文章所属分类
            await this.repository
                .createQueryBuilder('post')
                .relation(PostEntity, 'categories')
                .of(post)
                .addAndRemove(data.categories, post.categories ?? []);
        }
        await this.repository.update(data.id, omit(data, ['id', 'categories']));
        if (!isNil(this.searchService)) {
            try {
                await this.searchService.update(post);
            } catch (err) {
                throw new InternalServerErrorException(err);
            }
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
        const collect = await CollectEntity.findOneBy({ id: collectId });
        const post = await PostEntity.findOneBy({ id: postId });
        if (isNil(post) || isNil(collect) || collect.user !== user) {
            return;
        }
        this.repository
            .createQueryBuilder('post')
            .relation(CollectEntity, 'collects')
            .of(post)
            .add([collectId]);
    }

    /**
     * 取消收藏
     * @param user
     * @param postId
     * @param collectId
     */
    async cancelCollect(user: UserEntity, postId: string, collectId: string) {
        const collect = await CollectEntity.findOneBy({ id: collectId });
        const post = await PostEntity.findOneBy({ id: postId });
        if (isNil(post) || isNil(collect) || collect.user !== user) {
            return;
        }
        this.repository
            .createQueryBuilder('post')
            .relation(CollectEntity, 'collects')
            .of(post)
            .remove([collectId]);
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
        const { category, orderBy, search } = options;
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
}
