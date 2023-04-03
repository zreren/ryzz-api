import { MigrationInterface, QueryRunner } from "typeorm";

export class FYrfKy1680424740455 implements MigrationInterface {
    name = 'FYrfKy1680424740455'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`idx_author_id\` ON \`content_feeds\``);
        await queryRunner.query(`CREATE INDEX \`idx_author_user\` ON \`content_feeds\` (\`author_id\`, \`user_id\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`idx_author_user\` ON \`content_feeds\``);
        await queryRunner.query(`CREATE INDEX \`idx_author_id\` ON \`content_feeds\` (\`author_id\`)`);
    }

}
