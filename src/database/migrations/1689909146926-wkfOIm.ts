import { MigrationInterface, QueryRunner } from 'typeorm';

export class WkfOIm1689909146926 implements MigrationInterface {
    name = 'WkfOIm1689909146926';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`content_comments\` ADD \`likeCount\` int NOT NULL COMMENT '点赞数' DEFAULT '0'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`content_comments\` DROP COLUMN \`likeCount\``);
    }
}
