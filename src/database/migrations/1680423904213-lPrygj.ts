import { MigrationInterface, QueryRunner } from 'typeorm';

export class LPrygj1680423904213 implements MigrationInterface {
    name = 'LPrygj1680423904213';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`idx_user_id\` ON \`content_feeds\``);
        await queryRunner.query(
            `CREATE INDEX \`uniq_user_post\` ON \`content_feeds\` (\`user_id\`, \`post_id\`)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`uniq_user_post\` ON \`content_feeds\``);
        await queryRunner.query(`CREATE INDEX \`idx_user_id\` ON \`content_feeds\` (\`user_id\`)`);
    }
}
