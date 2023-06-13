import { MigrationInterface, QueryRunner } from 'typeorm';

export class ZOfdOG1686561456025 implements MigrationInterface {
    name = 'ZOfdOG1686561456025';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`content_collect_posts\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`collectId\` varchar(36) NULL, \`postId\` varchar(36) NULL, UNIQUE INDEX \`uniq_collect_post\` (\`collectId\`, \`postId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`notices\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('follow', 'like', 'collect', 'comment') NOT NULL COMMENT '类型', \`content\` varchar(1000) NOT NULL COMMENT '内容', \`is_read\` tinyint NOT NULL COMMENT '是否已读', \`created_at\` datetime(6) NOT NULL COMMENT '创建日期' DEFAULT CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`userId\` varchar(36) NULL, \`postId\` varchar(36) NULL, \`commentId\` varchar(36) NULL, INDEX \`idx_user_type_created\` (\`userId\`, \`type\`, \`created_at\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_collect_posts\` ADD CONSTRAINT \`FK_84f2cb087bb561945cf9d822954\` FOREIGN KEY (\`collectId\`) REFERENCES \`content_collects\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_collect_posts\` ADD CONSTRAINT \`FK_285a7157ad9f05e320f52dc8955\` FOREIGN KEY (\`postId\`) REFERENCES \`content_posts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`notices\` ADD CONSTRAINT \`FK_79364067097eea7912bb08855b6\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`notices\` ADD CONSTRAINT \`FK_0f6eddabf51a7a71abf0befc2c8\` FOREIGN KEY (\`postId\`) REFERENCES \`content_posts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`notices\` ADD CONSTRAINT \`FK_2fee6b75e702c6aa393110dfafc\` FOREIGN KEY (\`commentId\`) REFERENCES \`content_comments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`notices\` DROP FOREIGN KEY \`FK_2fee6b75e702c6aa393110dfafc\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`notices\` DROP FOREIGN KEY \`FK_0f6eddabf51a7a71abf0befc2c8\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`notices\` DROP FOREIGN KEY \`FK_79364067097eea7912bb08855b6\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_collect_posts\` DROP FOREIGN KEY \`FK_285a7157ad9f05e320f52dc8955\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_collect_posts\` DROP FOREIGN KEY \`FK_84f2cb087bb561945cf9d822954\``,
        );
        await queryRunner.query(`DROP INDEX \`idx_user_type_created\` ON \`notices\``);
        await queryRunner.query(`DROP TABLE \`notices\``);
        await queryRunner.query(`DROP INDEX \`uniq_collect_post\` ON \`content_collect_posts\``);
        await queryRunner.query(`DROP TABLE \`content_collect_posts\``);
    }
}
