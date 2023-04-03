import { MigrationInterface, QueryRunner } from 'typeorm';

export class SkMOHo1680449754303 implements MigrationInterface {
    name = 'SkMOHo1680449754303';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE UNIQUE INDEX \`uniq_user_post\` ON \`content_posts_likes\` (\`userId\`, \`postId\`)`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX \`uniq_user_comment\` ON \`content_comments_likes\` (\`commentId\`, \`userId\`)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`uniq_user_comment\` ON \`content_comments_likes\``);
        await queryRunner.query(`DROP INDEX \`uniq_user_post\` ON \`content_posts_likes\``);
    }
}
