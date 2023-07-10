import { MigrationInterface, QueryRunner } from 'typeorm';

export class FxFfBX1688957286344 implements MigrationInterface {
    name = 'FxFfBX1688957286344';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`imagePaths\` \`imagePaths\` text NULL COMMENT '图片列表'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`ip\` \`ip\` varchar(255) NOT NULL COMMENT 'ip' DEFAULT ''`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`location\` \`location\` varchar(255) NOT NULL COMMENT '位置' DEFAULT ''`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`longitude\` \`longitude\` decimal NOT NULL COMMENT '经度' DEFAULT '0'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`latitude\` \`latitude\` decimal NOT NULL COMMENT '维度' DEFAULT '0'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`latitude\` \`latitude\` decimal NOT NULL COMMENT '维度'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`longitude\` \`longitude\` decimal NOT NULL COMMENT '经度'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`location\` \`location\` varchar(255) NOT NULL COMMENT '位置'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`ip\` \`ip\` varchar(255) NOT NULL COMMENT 'ip'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`imagePaths\` \`imagePaths\` text NOT NULL COMMENT '图片列表'`,
        );
    }
}
