import { MigrationInterface, QueryRunner } from 'typeorm';

export class WQgnHa1691571056664 implements MigrationInterface {
    name = 'WQgnHa1691571056664';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`content_reports\` (\`id\` varchar(36) NOT NULL, \`content\` varchar(255) NOT NULL COMMENT '举报内容' DEFAULT '', \`status\` enum ('handling', 'done') NOT NULL COMMENT '处理状态' DEFAULT 'handling', \`result\` varchar(255) NOT NULL COMMENT '处理结果' DEFAULT '', \`createdAt\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL COMMENT '删除时间', \`reporterId\` varchar(36) NOT NULL, \`postId\` varchar(36) NULL, \`commentId\` varchar(36) NULL, \`userId\` varchar(36) NULL, INDEX \`idx_uid\` (\`reporterId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports\` ADD CONSTRAINT \`FK_d687e5407cb85be0c24463f86ea\` FOREIGN KEY (\`reporterId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports\` ADD CONSTRAINT \`FK_31c0c51e9514b35d8a92ce7eec3\` FOREIGN KEY (\`postId\`) REFERENCES \`content_posts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports\` ADD CONSTRAINT \`FK_32e5c4ad8f2df2b9eeff72e696c\` FOREIGN KEY (\`commentId\`) REFERENCES \`content_comments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports\` ADD CONSTRAINT \`FK_856fe038fa08b1a24eb10d32c27\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`content_reports\` DROP FOREIGN KEY \`FK_856fe038fa08b1a24eb10d32c27\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports\` DROP FOREIGN KEY \`FK_32e5c4ad8f2df2b9eeff72e696c\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports\` DROP FOREIGN KEY \`FK_31c0c51e9514b35d8a92ce7eec3\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports\` DROP FOREIGN KEY \`FK_d687e5407cb85be0c24463f86ea\``,
        );
        await queryRunner.query(`DROP INDEX \`idx_uid\` ON \`content_reports\``);
        await queryRunner.query(`DROP TABLE \`content_reports\``);
    }
}
