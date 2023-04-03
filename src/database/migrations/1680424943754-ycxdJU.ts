import { MigrationInterface, QueryRunner } from "typeorm";

export class YcxdJU1680424943754 implements MigrationInterface {
    name = 'YcxdJU1680424943754'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`idx_publish_time\` ON \`content_feeds\``);
        await queryRunner.query(`CREATE INDEX \`idx_publish_time_user\` ON \`content_feeds\` (\`publish_time\`, \`user_id\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`idx_publish_time_user\` ON \`content_feeds\``);
        await queryRunner.query(`CREATE INDEX \`idx_publish_time\` ON \`content_feeds\` (\`publish_time\`)`);
    }

}
