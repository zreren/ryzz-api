import { MigrationInterface, QueryRunner } from "typeorm";

export class SPpTWi1687528391364 implements MigrationInterface {
    name = 'SPpTWi1687528391364'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`introduction\` varchar(255) NOT NULL COMMENT '个人介绍' DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`gender\` varchar(255) NOT NULL COMMENT '性别' DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`birthday\` varchar(255) NOT NULL COMMENT '生日' DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`address\` varchar(255) NOT NULL COMMENT '地址' DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`address\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`birthday\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`gender\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`introduction\``);
    }

}
