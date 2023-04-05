import { MigrationInterface, QueryRunner } from 'typeorm';

export class DwsiHP1680665511538 implements MigrationInterface {
    name = 'DwsiHP1680665511538';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`storage_medias\` ADD \`postId\` varchar(36) NULL`);
        await queryRunner.query(
            `ALTER TABLE \`storage_medias\` ADD CONSTRAINT \`FK_225f8734dfca1ee0b385fd58b48\` FOREIGN KEY (\`postId\`) REFERENCES \`content_posts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`storage_medias\` DROP FOREIGN KEY \`FK_225f8734dfca1ee0b385fd58b48\``,
        );
        await queryRunner.query(`ALTER TABLE \`storage_medias\` DROP COLUMN \`postId\``);
    }
}
