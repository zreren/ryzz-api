import { MigrationInterface, QueryRunner } from 'typeorm';

export class VOyTxo1680422005609 implements MigrationInterface {
    name = 'VOyTxo1680422005609';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`content_feeds\` ADD \`author_id\` varchar(255) NOT NULL COMMENT '楼主ID'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`longitude\` \`longitude\` int NOT NULL COMMENT '经度'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`latitude\` \`latitude\` int NOT NULL COMMENT '维度'`,
        );
        await queryRunner.query(`ALTER TABLE \`content_feeds\` DROP COLUMN \`post_id\``);
        await queryRunner.query(
            `ALTER TABLE \`content_feeds\` ADD \`post_id\` varchar(255) NOT NULL COMMENT '帖子ID'`,
        );
        await queryRunner.query(`DROP INDEX \`idx_user_id\` ON \`content_feeds\``);
        await queryRunner.query(`ALTER TABLE \`content_feeds\` DROP COLUMN \`user_id\``);
        await queryRunner.query(
            `ALTER TABLE \`content_feeds\` ADD \`user_id\` varchar(255) NOT NULL COMMENT '用户ID'`,
        );
        await queryRunner.query(
            `CREATE INDEX \`idx_author_id\` ON \`content_feeds\` (\`author_id\`)`,
        );
        await queryRunner.query(`CREATE INDEX \`idx_user_id\` ON \`content_feeds\` (\`user_id\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`idx_user_id\` ON \`content_feeds\``);
        await queryRunner.query(`DROP INDEX \`idx_author_id\` ON \`content_feeds\``);
        await queryRunner.query(`ALTER TABLE \`content_feeds\` DROP COLUMN \`user_id\``);
        await queryRunner.query(
            `ALTER TABLE \`content_feeds\` ADD \`user_id\` int UNSIGNED NOT NULL COMMENT '用户ID' DEFAULT '0'`,
        );
        await queryRunner.query(`CREATE INDEX \`idx_user_id\` ON \`content_feeds\` (\`user_id\`)`);
        await queryRunner.query(`ALTER TABLE \`content_feeds\` DROP COLUMN \`post_id\``);
        await queryRunner.query(
            `ALTER TABLE \`content_feeds\` ADD \`post_id\` int UNSIGNED NOT NULL COMMENT '帖子ID' DEFAULT '0'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`latitude\` \`latitude\` int NOT NULL COMMENT '维度'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`longitude\` \`longitude\` int NOT NULL COMMENT '经度'`,
        );
        await queryRunner.query(`ALTER TABLE \`content_feeds\` DROP COLUMN \`author_id\``);
    }
}
