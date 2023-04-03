import { MigrationInterface, QueryRunner } from 'typeorm';

export class ZRbIwP1680522583480 implements MigrationInterface {
    name = 'ZRbIwP1680522583480';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`idx_commentCount_country\` ON \`content_posts\``);
        await queryRunner.query(`DROP INDEX \`idx_country_publishedAt\` ON \`content_posts\``);
        await queryRunner.query(`DROP INDEX \`idx_likeCount_country\` ON \`content_posts\``);
        await queryRunner.query(`ALTER TABLE \`content_posts\` DROP COLUMN \`country\``);
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` ADD \`country\` char(2) NOT NULL COMMENT '国家' DEFAULT 'bt'`,
        );
        await queryRunner.query(
            `CREATE INDEX \`idx_value\` ON \`user_refresh_tokens\` (\`value\`)`,
        );
        await queryRunner.query(`CREATE INDEX \`idx_value\` ON \`user_access_tokens\` (\`value\`)`);
        await queryRunner.query(
            `CREATE INDEX \`idx_commentCount_country\` ON \`content_posts\` (\`commentCount\`, \`country\`)`,
        );
        await queryRunner.query(
            `CREATE INDEX \`idx_likeCount_country\` ON \`content_posts\` (\`likeCount\`, \`country\`)`,
        );
        await queryRunner.query(
            `CREATE INDEX \`idx_country_publishedAt\` ON \`content_posts\` (\`country\`, \`publishedAt\`)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`idx_country_publishedAt\` ON \`content_posts\``);
        await queryRunner.query(`DROP INDEX \`idx_likeCount_country\` ON \`content_posts\``);
        await queryRunner.query(`DROP INDEX \`idx_commentCount_country\` ON \`content_posts\``);
        await queryRunner.query(`DROP INDEX \`idx_value\` ON \`user_access_tokens\``);
        await queryRunner.query(`DROP INDEX \`idx_value\` ON \`user_refresh_tokens\``);
        await queryRunner.query(`ALTER TABLE \`content_posts\` DROP COLUMN \`country\``);
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` ADD \`country\` enum ('us', 'gb', 'de', 'ca', 'jp', 'es', 'fr', 'it', 'cn') NOT NULL COMMENT '国家' DEFAULT 'us'`,
        );
        await queryRunner.query(
            `CREATE INDEX \`idx_likeCount_country\` ON \`content_posts\` (\`likeCount\`, \`country\`)`,
        );
        await queryRunner.query(
            `CREATE INDEX \`idx_country_publishedAt\` ON \`content_posts\` (\`country\`, \`publishedAt\`)`,
        );
        await queryRunner.query(
            `CREATE INDEX \`idx_commentCount_country\` ON \`content_posts\` (\`commentCount\`, \`country\`)`,
        );
    }
}
