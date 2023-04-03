import { MigrationInterface, QueryRunner } from "typeorm";

export class ERssip1680422515248 implements MigrationInterface {
    name = 'ERssip1680422515248'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`content_posts\` DROP COLUMN \`longitude\``);
        await queryRunner.query(`ALTER TABLE \`content_posts\` ADD \`longitude\` decimal NOT NULL COMMENT '经度'`);
        await queryRunner.query(`ALTER TABLE \`content_posts\` DROP COLUMN \`latitude\``);
        await queryRunner.query(`ALTER TABLE \`content_posts\` ADD \`latitude\` decimal NOT NULL COMMENT '维度'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`content_posts\` DROP COLUMN \`latitude\``);
        await queryRunner.query(`ALTER TABLE \`content_posts\` ADD \`latitude\` int NOT NULL COMMENT '维度'`);
        await queryRunner.query(`ALTER TABLE \`content_posts\` DROP COLUMN \`longitude\``);
        await queryRunner.query(`ALTER TABLE \`content_posts\` ADD \`longitude\` int NOT NULL COMMENT '经度'`);
    }

}
