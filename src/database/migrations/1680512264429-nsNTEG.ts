import { MigrationInterface, QueryRunner } from 'typeorm';

export class NsNTEG1680512264429 implements MigrationInterface {
    name = 'NsNTEG1680512264429';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` ADD \`detailCount\` int NOT NULL COMMENT '详情页浏览数'`,
        );
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
        await queryRunner.query(`ALTER TABLE \`content_posts\` DROP COLUMN \`detailCount\``);
    }
}
