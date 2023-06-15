import { MigrationInterface, QueryRunner } from "typeorm";

export class PUjBrf1686818076952 implements MigrationInterface {
    name = 'PUjBrf1686818076952'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`storage_medias\` DROP FOREIGN KEY \`FK_a4b8f72d2e7cdd5dc21ea5512a4\``);
        await queryRunner.query(`DROP INDEX \`REL_a4b8f72d2e7cdd5dc21ea5512a\` ON \`storage_medias\``);
        await queryRunner.query(`ALTER TABLE \`storage_medias\` DROP COLUMN \`memberId\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`storage_medias\` ADD \`memberId\` varchar(36) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_a4b8f72d2e7cdd5dc21ea5512a\` ON \`storage_medias\` (\`memberId\`)`);
        await queryRunner.query(`ALTER TABLE \`storage_medias\` ADD CONSTRAINT \`FK_a4b8f72d2e7cdd5dc21ea5512a4\` FOREIGN KEY (\`memberId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
