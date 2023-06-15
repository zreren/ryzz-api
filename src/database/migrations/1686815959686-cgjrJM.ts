import { MigrationInterface, QueryRunner } from "typeorm";

export class CgjrJM1686815959686 implements MigrationInterface {
    name = 'CgjrJM1686815959686'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`earned\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`redeemed\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`avatarPath\` varchar(255) NOT NULL COMMENT '头像路径'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`avatarPath\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`redeemed\` float NOT NULL COMMENT '优惠券余额' DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`earned\` float NOT NULL COMMENT '优惠券总额' DEFAULT '0'`);
    }

}
