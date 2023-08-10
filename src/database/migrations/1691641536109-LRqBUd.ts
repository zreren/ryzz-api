import { MigrationInterface, QueryRunner } from "typeorm";

export class LRqBUd1691641536109 implements MigrationInterface {
    name = 'LRqBUd1691641536109'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`content_comments\` ADD \`replyCount\` int NOT NULL COMMENT '回复数量，只有根节点存储该值' DEFAULT '0'`);
        await queryRunner.query(`CREATE INDEX \`IDX_052a7f47b44ead98d4659ae93d\` ON \`content_comments\` (\`replyCount\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_052a7f47b44ead98d4659ae93d\` ON \`content_comments\``);
        await queryRunner.query(`ALTER TABLE \`content_comments\` DROP COLUMN \`replyCount\``);
    }

}
