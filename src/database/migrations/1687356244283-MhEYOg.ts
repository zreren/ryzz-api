import { MigrationInterface, QueryRunner } from "typeorm";

export class MhEYOg1687356244283 implements MigrationInterface {
    name = 'MhEYOg1687356244283'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`avatarPath\` \`avatarPath\` varchar(255) NOT NULL COMMENT '头像路径' DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`avatarPath\` \`avatarPath\` varchar(255) NOT NULL COMMENT '头像路径'`);
    }

}
