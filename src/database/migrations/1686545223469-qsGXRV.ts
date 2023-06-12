import { MigrationInterface, QueryRunner } from "typeorm";

export class QsGXRV1686545223469 implements MigrationInterface {
    name = 'QsGXRV1686545223469'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`content_categories\` ADD \`coverPath\` varchar(255) NOT NULL COMMENT '封面图片路径'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`content_categories\` DROP COLUMN \`coverPath\``);
    }

}
