import { MigrationInterface, QueryRunner } from 'typeorm';

export class RclqST1680153197794 implements MigrationInterface {
    name = 'RclqST1680153197794';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` DROP FOREIGN KEY \`FK_b987c297409fada38a52ab9a049\``,
        );
        await queryRunner.query(
            `CREATE TABLE \`user_bans\` (\`id\` int NOT NULL AUTO_INCREMENT, \`create_time\` int UNSIGNED NOT NULL COMMENT '拉黑时间戳', \`userId\` varchar(36) NULL, \`banedUserId\` varchar(36) NULL, UNIQUE INDEX \`uniq_user_ban_id\` (\`userId\`, \`banedUserId\`), INDEX \`idx_baned_uid\` (\`banedUserId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`user_followers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`create_time\` int UNSIGNED NOT NULL COMMENT '关注时间戳', \`userId\` varchar(36) NULL, \`followerId\` varchar(36) NULL, UNIQUE INDEX \`uniq_user_follower_id\` (\`userId\`, \`followerId\`), INDEX \`idx_follower_uid\` (\`followerId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_feeds\` ADD \`publish_time\` int UNSIGNED NOT NULL COMMENT '发布时间戳'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`longitude\` \`longitude\` int NOT NULL COMMENT '经度'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`latitude\` \`latitude\` int NOT NULL COMMENT '维度'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`userId\` \`userId\` varchar(36) NULL`,
        );
        await queryRunner.query(
            `CREATE INDEX \`idx_publish_time\` ON \`content_feeds\` (\`publish_time\`)`,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_bans\` ADD CONSTRAINT \`FK_92ac403b4ae72ccffb7a551c5a5\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_bans\` ADD CONSTRAINT \`FK_2afb1954d6239db987c7a0c32da\` FOREIGN KEY (\`banedUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_followers\` ADD CONSTRAINT \`FK_347ce7a07457528a1779da8b8f3\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_followers\` ADD CONSTRAINT \`FK_c3f56a3157b50bc8adcc6acf278\` FOREIGN KEY (\`followerId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` ADD CONSTRAINT \`FK_b987c297409fada38a52ab9a049\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` DROP FOREIGN KEY \`FK_b987c297409fada38a52ab9a049\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_followers\` DROP FOREIGN KEY \`FK_c3f56a3157b50bc8adcc6acf278\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_followers\` DROP FOREIGN KEY \`FK_347ce7a07457528a1779da8b8f3\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_bans\` DROP FOREIGN KEY \`FK_2afb1954d6239db987c7a0c32da\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_bans\` DROP FOREIGN KEY \`FK_92ac403b4ae72ccffb7a551c5a5\``,
        );
        await queryRunner.query(`DROP INDEX \`idx_publish_time\` ON \`content_feeds\``);
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`userId\` \`userId\` varchar(36) NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`latitude\` \`latitude\` int NOT NULL COMMENT '维度'`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` CHANGE \`longitude\` \`longitude\` int NOT NULL COMMENT '经度'`,
        );
        await queryRunner.query(`ALTER TABLE \`content_feeds\` DROP COLUMN \`publish_time\``);
        await queryRunner.query(`DROP INDEX \`idx_follower_uid\` ON \`user_followers\``);
        await queryRunner.query(`DROP INDEX \`uniq_user_follower_id\` ON \`user_followers\``);
        await queryRunner.query(`DROP TABLE \`user_followers\``);
        await queryRunner.query(`DROP INDEX \`idx_baned_uid\` ON \`user_bans\``);
        await queryRunner.query(`DROP INDEX \`uniq_user_ban_id\` ON \`user_bans\``);
        await queryRunner.query(`DROP TABLE \`user_bans\``);
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` ADD CONSTRAINT \`FK_b987c297409fada38a52ab9a049\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
    }
}
