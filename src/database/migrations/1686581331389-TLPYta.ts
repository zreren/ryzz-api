import { MigrationInterface, QueryRunner } from 'typeorm';

export class TLPYta1686581331389 implements MigrationInterface {
    name = 'TLPYta1686581331389';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notices\` ADD \`operatorId\` varchar(36) NULL`);
        await queryRunner.query(
            `ALTER TABLE \`notices\` ADD CONSTRAINT \`FK_33cc34d83dafa017a42e977f3f3\` FOREIGN KEY (\`operatorId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`notices\` DROP FOREIGN KEY \`FK_33cc34d83dafa017a42e977f3f3\``,
        );
        await queryRunner.query(`ALTER TABLE \`notices\` DROP COLUMN \`operatorId\``);
    }
}
