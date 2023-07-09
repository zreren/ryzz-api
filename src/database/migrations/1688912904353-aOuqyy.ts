import { MigrationInterface, QueryRunner } from 'typeorm';

export class AOuqyy1688912904353 implements MigrationInterface {
    name = 'AOuqyy1688912904353';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`commentCount\` \`commentCount\` int NOT NULL COMMENT '评论数' DEFAULT '0'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`likeCount\` \`likeCount\` int NOT NULL COMMENT '点赞数' DEFAULT '0'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`repostCount\` \`repostCount\` int NOT NULL COMMENT '转发数' DEFAULT '0'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`collectCount\` \`collectCount\` int NOT NULL COMMENT '收藏数' DEFAULT '0'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`detailCount\` \`detailCount\` int NOT NULL COMMENT '详情页浏览数' DEFAULT '0'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`detailCount\` \`detailCount\` int NOT NULL COMMENT '详情页浏览数'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`collectCount\` \`collectCount\` int NOT NULL COMMENT '收藏数'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`repostCount\` \`repostCount\` int NOT NULL COMMENT '转发数'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`likeCount\` \`likeCount\` int NOT NULL COMMENT '点赞数'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`commentCount\` \`commentCount\` int NOT NULL COMMENT '评论数'`,
        );
    }
}
