import { MigrationInterface, QueryRunner } from 'typeorm';

export class WzHwJG1680424021676 implements MigrationInterface {
    name = 'WzHwJG1680424021676';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`uniq_user_post\` ON \`content_feeds\``);
        await queryRunner.query(
            `CREATE UNIQUE INDEX \`uniq_user_post\` ON \`content_feeds\` (\`user_id\`, \`post_id\`)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`uniq_user_post\` ON \`content_feeds\``);
        await queryRunner.query(
            `CREATE INDEX \`uniq_user_post\` ON \`content_feeds\` (\`user_id\`, \`post_id\`)`,
        );
    }
}
