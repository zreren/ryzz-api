import { Faker } from '@faker-js/faker';

import { CategoryEntity, CommentEntity, PostEntity } from '@/modules/content/entities';
import { getTime } from '@/modules/core/helpers';
import { defineFactory } from '@/modules/database/helpers';
import { UserEntity } from '@/modules/user/entities';

export type IPostFactoryOptions = Partial<{
    title: string;
    summary: string;
    body: string;
    isPublished: boolean;
    categories: CategoryEntity[];
    comments: CommentEntity[];
    user: UserEntity;
}>;
export const ContentFactory = defineFactory(
    PostEntity,
    async (faker: Faker, options: IPostFactoryOptions) => {
        faker.setLocale('zh_CN');
        const post = new PostEntity();
        const { title, body, categories, user } = options;
        post.title = title ?? faker.lorem.sentence(Math.floor(Math.random() * 10) + 6);
        post.body = body ?? faker.lorem.paragraph(Math.floor(Math.random() * 500) + 1);
        post.publishedAt = (await getTime()).unix();
        post.user = user;
        if (Math.random() >= 0.5) {
            post.deletedAt = (await getTime()).toDate();
        }
        if (categories) {
            post.categories = categories;
        }
        return post;
    },
);
