import { MigrationInterface, QueryRunner } from 'typeorm';

export class SMjgic1689220365297 implements MigrationInterface {
    name = 'SMjgic1689220365297';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` ADD \`is_draft\` tinyint NOT NULL COMMENT '是否草稿' DEFAULT 0`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`content_posts\` DROP COLUMN \`is_draft\``);
    }
}
