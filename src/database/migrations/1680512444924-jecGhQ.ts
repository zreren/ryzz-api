import { MigrationInterface, QueryRunner } from 'typeorm';

export class JecGhQ1680512444924 implements MigrationInterface {
    name = 'JecGhQ1680512444924';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`content_posts_user_view_records\` (\`id\` int NOT NULL AUTO_INCREMENT, \`postId\` varchar(255) NOT NULL COMMENT '帖子ID', \`userId\` varchar(255) NOT NULL COMMENT '用户ID', \`createdAt\` datetime(6) NOT NULL COMMENT '浏览时间' DEFAULT CURRENT_TIMESTAMP(6), INDEX \`idx_user_post\` (\`userId\`, \`postId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX \`idx_user_post\` ON \`content_posts_user_view_records\``,
        );
        await queryRunner.query(`DROP TABLE \`content_posts_user_view_records\``);
    }
}
