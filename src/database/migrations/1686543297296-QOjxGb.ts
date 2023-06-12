import { MigrationInterface, QueryRunner } from 'typeorm';

export class QOjxGb1686543297296 implements MigrationInterface {
    name = 'QOjxGb1686543297296';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`idx_comment\` ON \`content_posts\``);
        await queryRunner.query(`DROP INDEX \`idx_like\` ON \`content_posts\``);
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` ADD \`imagePaths\` text NOT NULL COMMENT '图片列表'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`content_posts\` DROP COLUMN \`imagePaths\``);
        await queryRunner.query(`CREATE INDEX \`idx_like\` ON \`content_posts\` (\`likeCount\`)`);
        await queryRunner.query(
            `CREATE INDEX \`idx_comment\` ON \`content_posts\` (\`commentCount\`)`,
        );
    }
}
