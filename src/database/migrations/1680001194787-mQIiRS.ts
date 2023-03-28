import { MigrationInterface, QueryRunner } from 'typeorm';

export class MQIiRS1680001194787 implements MigrationInterface {
    name = 'MQIiRS1680001194787';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`user_refresh_tokens\` (\`id\` varchar(36) NOT NULL, \`value\` varchar(500) NOT NULL, \`expired_at\` datetime NOT NULL COMMENT '令牌过期时间', \`createdAt\` datetime(6) NOT NULL COMMENT '令牌创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`accessTokenId\` varchar(36) NULL, UNIQUE INDEX \`REL_1dfd080c2abf42198691b60ae3\` (\`accessTokenId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`storage_medias\` (\`id\` varchar(36) NOT NULL, \`file\` varchar(255) NOT NULL COMMENT '文件存储位置', \`ext\` varchar(255) NOT NULL COMMENT '文件后缀', \`createdAt\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, \`memberId\` varchar(36) NULL, UNIQUE INDEX \`REL_a4b8f72d2e7cdd5dc21ea5512a\` (\`memberId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`rbac_roles\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL COMMENT '角色名称', \`label\` varchar(255) NULL COMMENT '显示名称', \`description\` text NULL COMMENT '角色描述', \`systemed\` tinyint NOT NULL COMMENT '是否为不可更改的系统权限' DEFAULT 0, \`deletedAt\` datetime(6) NULL COMMENT '删除时间', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`rbac_permissions\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL COMMENT '权限名称', \`label\` varchar(255) NULL COMMENT '权限显示名', \`description\` text NULL COMMENT '权限描述', \`rule\` text NOT NULL COMMENT '权限规则', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`nickname\` varchar(255) NULL COMMENT '姓名', \`username\` varchar(255) NOT NULL COMMENT '用户名', \`password\` varchar(500) NOT NULL COMMENT '密码', \`phone\` varchar(255) NULL COMMENT '手机号', \`email\` varchar(255) NULL COMMENT '邮箱', \`actived\` tinyint NOT NULL COMMENT '用户状态,是否激活' DEFAULT 1, \`isCreator\` tinyint NOT NULL COMMENT '是否是创始人' DEFAULT 0, \`createdAt\` datetime(6) NOT NULL COMMENT '用户创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL COMMENT '用户更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`earned\` float NOT NULL COMMENT '优惠券总额' DEFAULT '0', \`redeemed\` float NOT NULL COMMENT '优惠券余额' DEFAULT '0', \`deletedAt\` datetime(6) NULL COMMENT '删除时间', UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`), UNIQUE INDEX \`IDX_a000cca60bcf04454e72769949\` (\`phone\`), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`user_access_tokens\` (\`id\` varchar(36) NOT NULL, \`value\` varchar(500) NOT NULL, \`expired_at\` datetime NOT NULL COMMENT '令牌过期时间', \`createdAt\` datetime(6) NOT NULL COMMENT '令牌创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`user_captchas\` (\`id\` varchar(36) NOT NULL, \`code\` varchar(255) NOT NULL COMMENT '验证码', \`action\` enum ('login', 'register', 'retrieve-password', 'reset-password', 'account-bound') NOT NULL COMMENT '验证操作类型', \`value\` varchar(255) NOT NULL COMMENT '邮箱地址', \`created_at\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`content_categories\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL COMMENT '分类名称', \`customOrder\` int NOT NULL COMMENT '分类排序' DEFAULT '0', \`deletedAt\` datetime(6) NULL COMMENT '删除时间', \`mpath\` varchar(255) NULL DEFAULT '', \`parentId\` varchar(36) NULL, FULLTEXT INDEX \`IDX_d6aaf8517ca57297a8c3a44d3d\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`content_collects\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL COMMENT '收藏夹名称', \`createdAt\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL COMMENT '删除时间', \`userId\` varchar(36) NOT NULL, INDEX \`idx_uid\` (\`userId\`), FULLTEXT INDEX \`IDX_fbeb7cd614e9bdf521e7095261\` (\`title\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`content_posts_likes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, \`postId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`content_comments_likes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, \`commentId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`content_comments\` (\`id\` varchar(36) NOT NULL, \`body\` longtext NOT NULL COMMENT '评论内容', \`createdAt\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`mpath\` varchar(255) NULL DEFAULT '', \`userId\` varchar(36) NOT NULL, \`postId\` varchar(36) NOT NULL, \`parentId\` varchar(36) NULL, INDEX \`idx_uid\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`content_reports_user\` (\`id\` varchar(36) NOT NULL, \`content\` varchar(255) NOT NULL COMMENT '举报内容', \`status\` enum ('handling', 'done') NOT NULL COMMENT '处理状态' DEFAULT 'handling', \`result\` varchar(255) NOT NULL COMMENT '处理结果', \`createdAt\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`reporterId\` varchar(36) NOT NULL, \`userId\` varchar(36) NULL, INDEX \`idx_uid\` (\`reporterId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`content_reports_post\` (\`id\` varchar(36) NOT NULL, \`content\` varchar(255) NOT NULL COMMENT '举报内容', \`status\` enum ('handling', 'done') NOT NULL COMMENT '处理状态' DEFAULT 'handling', \`result\` varchar(255) NOT NULL COMMENT '处理结果', \`createdAt\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`reporterId\` varchar(36) NOT NULL, \`postId\` varchar(36) NULL, INDEX \`idx_uid\` (\`reporterId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`content_reports_comment\` (\`id\` varchar(36) NOT NULL, \`content\` varchar(255) NOT NULL COMMENT '举报内容', \`status\` enum ('handling', 'done') NOT NULL COMMENT '处理状态' DEFAULT 'handling', \`result\` varchar(255) NOT NULL COMMENT '处理结果', \`createdAt\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`reporterId\` varchar(36) NOT NULL, \`commentId\` varchar(36) NULL, INDEX \`idx_uid\` (\`reporterId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`content_tags\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL COMMENT '标签名称', \`createdAt\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL COMMENT '删除时间', \`mpath\` varchar(255) NULL DEFAULT '', UNIQUE INDEX \`uniq_name\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`content_posts\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL COMMENT '帖子标题', \`body\` longtext NOT NULL COMMENT '帖子内容', \`type\` enum ('1', '2') NOT NULL COMMENT '帖子类型' DEFAULT '1', \`commentCount\` int NOT NULL COMMENT '评论数', \`likeCount\` int NOT NULL COMMENT '点赞数', \`repostCount\` int NOT NULL COMMENT '转发数', \`collectCount\` int NOT NULL COMMENT '收藏数', \`ip\` varchar(255) NOT NULL COMMENT 'ip', \`country\` enum ('us', 'gb', 'de', 'ca', 'jp', 'es', 'fr', 'it', 'cn') NOT NULL COMMENT '国家' DEFAULT 'us', \`location\` varchar(255) NOT NULL COMMENT '位置', \`longitude\` int NOT NULL COMMENT '经度', \`latitude\` int NOT NULL COMMENT '维度', \`publishedAt\` int UNSIGNED NOT NULL COMMENT '发布时间戳' DEFAULT '0', \`createdAt\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL COMMENT '删除时间', \`userId\` varchar(36) NOT NULL, \`repostId\` varchar(36) NULL, INDEX \`idx_uid\` (\`userId\`), INDEX \`idx_repost\` (\`repostId\`), FULLTEXT INDEX \`IDX_9ef6db9d13df6882d36c8af0cc\` (\`title\`), FULLTEXT INDEX \`IDX_e51068c39974ca11fae5d44c88\` (\`body\`), INDEX \`idx_comment\` (\`commentCount\`), INDEX \`idx_like\` (\`likeCount\`), INDEX \`idx_country\` (\`country\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`content_feeds\` (\`id\` int NOT NULL AUTO_INCREMENT, \`post_id\` int UNSIGNED NOT NULL COMMENT '帖子ID' DEFAULT '0', \`user_id\` int UNSIGNED NOT NULL COMMENT '用户ID' DEFAULT '0', INDEX \`idx_user_id\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`rbac_roles_users_users\` (\`rbacRolesId\` varchar(36) NOT NULL, \`usersId\` varchar(36) NOT NULL, INDEX \`IDX_3c933e8c0950496fa3a616e4b2\` (\`rbacRolesId\`), INDEX \`IDX_789b5818a876ba2c4f058bdeb9\` (\`usersId\`), PRIMARY KEY (\`rbacRolesId\`, \`usersId\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`rbac_permissions_roles_rbac_roles\` (\`rbacPermissionsId\` varchar(36) NOT NULL, \`rbacRolesId\` varchar(36) NOT NULL, INDEX \`IDX_a3fab43faecb8e0f9b0345cedb\` (\`rbacPermissionsId\`), INDEX \`IDX_df26ec979184812b60c1c1a4e3\` (\`rbacRolesId\`), PRIMARY KEY (\`rbacPermissionsId\`, \`rbacRolesId\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`rbac_permissions_users_users\` (\`rbacPermissionsId\` varchar(36) NOT NULL, \`usersId\` varchar(36) NOT NULL, INDEX \`IDX_d12a35b88ace69f10656e31e58\` (\`rbacPermissionsId\`), INDEX \`IDX_5910a3c31c94389248bd34afc4\` (\`usersId\`), PRIMARY KEY (\`rbacPermissionsId\`, \`usersId\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`content_posts_categories_content_categories\` (\`contentPostsId\` varchar(36) NOT NULL, \`contentCategoriesId\` varchar(36) NOT NULL, INDEX \`IDX_9172320639056856745c6bc21a\` (\`contentPostsId\`), INDEX \`IDX_82926fe45def38f6a53838347a\` (\`contentCategoriesId\`), PRIMARY KEY (\`contentPostsId\`, \`contentCategoriesId\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`content_posts_tags_content_tags\` (\`contentPostsId\` varchar(36) NOT NULL, \`contentTagsId\` varchar(36) NOT NULL, INDEX \`IDX_1e8c41827d0d509e70de1f6b70\` (\`contentPostsId\`), INDEX \`IDX_888e6754015ee17f9e22faae57\` (\`contentTagsId\`), PRIMARY KEY (\`contentPostsId\`, \`contentTagsId\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `CREATE TABLE \`content_posts_collects_content_collects\` (\`contentPostsId\` varchar(36) NOT NULL, \`contentCollectsId\` varchar(36) NOT NULL, INDEX \`IDX_dc19fc151ae8695376fbe7f8d1\` (\`contentPostsId\`), INDEX \`IDX_6b73c9e8cd4e7b0a759951e9a1\` (\`contentCollectsId\`), PRIMARY KEY (\`contentPostsId\`, \`contentCollectsId\`)) ENGINE=InnoDB`,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_refresh_tokens\` ADD CONSTRAINT \`FK_1dfd080c2abf42198691b60ae39\` FOREIGN KEY (\`accessTokenId\`) REFERENCES \`user_access_tokens\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`storage_medias\` ADD CONSTRAINT \`FK_86b01412473b2f9db17faf7bac0\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`storage_medias\` ADD CONSTRAINT \`FK_a4b8f72d2e7cdd5dc21ea5512a4\` FOREIGN KEY (\`memberId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_access_tokens\` ADD CONSTRAINT \`FK_71a030e491d5c8547fc1e38ef82\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_categories\` ADD CONSTRAINT \`FK_a03aea27707893300382b6f18ae\` FOREIGN KEY (\`parentId\`) REFERENCES \`content_categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_collects\` ADD CONSTRAINT \`FK_64c63f02e22689d23aa2c4cc6ea\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts_likes\` ADD CONSTRAINT \`FK_cb27adbb1f780804d6f11a57251\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts_likes\` ADD CONSTRAINT \`FK_ab50091a76d0b03c4f03ac8e606\` FOREIGN KEY (\`postId\`) REFERENCES \`content_posts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_comments_likes\` ADD CONSTRAINT \`FK_1b804c4ea25ba7b28660b6af838\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_comments_likes\` ADD CONSTRAINT \`FK_ac7ecce8caf00cacdaa6ea7dec0\` FOREIGN KEY (\`commentId\`) REFERENCES \`content_comments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_comments\` ADD CONSTRAINT \`FK_3ec3e32832bd75f0fe472f2cc03\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_comments\` ADD CONSTRAINT \`FK_5e1c3747a0031f305e94493361f\` FOREIGN KEY (\`postId\`) REFERENCES \`content_posts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_comments\` ADD CONSTRAINT \`FK_982a849f676860e5d6beb607f20\` FOREIGN KEY (\`parentId\`) REFERENCES \`content_comments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports_user\` ADD CONSTRAINT \`FK_c7eab640bd98835bb902ac9a8e8\` FOREIGN KEY (\`reporterId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports_user\` ADD CONSTRAINT \`FK_6f71e27705922f23ed9c0550da0\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports_post\` ADD CONSTRAINT \`FK_c48d187afdab08ea6b1686c4e86\` FOREIGN KEY (\`reporterId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports_post\` ADD CONSTRAINT \`FK_c771bac04bc816fa9d0e2f129d4\` FOREIGN KEY (\`postId\`) REFERENCES \`content_posts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports_comment\` ADD CONSTRAINT \`FK_b4b461e85583741882d94cb1a7e\` FOREIGN KEY (\`reporterId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports_comment\` ADD CONSTRAINT \`FK_f949e7bf9cc90ce9867c24512e1\` FOREIGN KEY (\`commentId\`) REFERENCES \`content_comments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` ADD CONSTRAINT \`FK_b987c297409fada38a52ab9a049\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` ADD CONSTRAINT \`FK_a06fc80bdb04af4572a9cae76de\` FOREIGN KEY (\`repostId\`) REFERENCES \`content_posts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`rbac_roles_users_users\` ADD CONSTRAINT \`FK_3c933e8c0950496fa3a616e4b27\` FOREIGN KEY (\`rbacRolesId\`) REFERENCES \`rbac_roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`rbac_roles_users_users\` ADD CONSTRAINT \`FK_789b5818a876ba2c4f058bdeb98\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`rbac_permissions_roles_rbac_roles\` ADD CONSTRAINT \`FK_a3fab43faecb8e0f9b0345cedba\` FOREIGN KEY (\`rbacPermissionsId\`) REFERENCES \`rbac_permissions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`rbac_permissions_roles_rbac_roles\` ADD CONSTRAINT \`FK_df26ec979184812b60c1c1a4e3a\` FOREIGN KEY (\`rbacRolesId\`) REFERENCES \`rbac_roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`rbac_permissions_users_users\` ADD CONSTRAINT \`FK_d12a35b88ace69f10656e31e587\` FOREIGN KEY (\`rbacPermissionsId\`) REFERENCES \`rbac_permissions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`rbac_permissions_users_users\` ADD CONSTRAINT \`FK_5910a3c31c94389248bd34afc48\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts_categories_content_categories\` ADD CONSTRAINT \`FK_9172320639056856745c6bc21aa\` FOREIGN KEY (\`contentPostsId\`) REFERENCES \`content_posts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts_categories_content_categories\` ADD CONSTRAINT \`FK_82926fe45def38f6a53838347a2\` FOREIGN KEY (\`contentCategoriesId\`) REFERENCES \`content_categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts_tags_content_tags\` ADD CONSTRAINT \`FK_1e8c41827d0d509e70de1f6b70e\` FOREIGN KEY (\`contentPostsId\`) REFERENCES \`content_posts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts_tags_content_tags\` ADD CONSTRAINT \`FK_888e6754015ee17f9e22faae578\` FOREIGN KEY (\`contentTagsId\`) REFERENCES \`content_tags\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts_collects_content_collects\` ADD CONSTRAINT \`FK_dc19fc151ae8695376fbe7f8d17\` FOREIGN KEY (\`contentPostsId\`) REFERENCES \`content_posts\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts_collects_content_collects\` ADD CONSTRAINT \`FK_6b73c9e8cd4e7b0a759951e9a10\` FOREIGN KEY (\`contentCollectsId\`) REFERENCES \`content_collects\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`content_posts_collects_content_collects\` DROP FOREIGN KEY \`FK_6b73c9e8cd4e7b0a759951e9a10\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts_collects_content_collects\` DROP FOREIGN KEY \`FK_dc19fc151ae8695376fbe7f8d17\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts_tags_content_tags\` DROP FOREIGN KEY \`FK_888e6754015ee17f9e22faae578\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts_tags_content_tags\` DROP FOREIGN KEY \`FK_1e8c41827d0d509e70de1f6b70e\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts_categories_content_categories\` DROP FOREIGN KEY \`FK_82926fe45def38f6a53838347a2\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts_categories_content_categories\` DROP FOREIGN KEY \`FK_9172320639056856745c6bc21aa\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`rbac_permissions_users_users\` DROP FOREIGN KEY \`FK_5910a3c31c94389248bd34afc48\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`rbac_permissions_users_users\` DROP FOREIGN KEY \`FK_d12a35b88ace69f10656e31e587\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`rbac_permissions_roles_rbac_roles\` DROP FOREIGN KEY \`FK_df26ec979184812b60c1c1a4e3a\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`rbac_permissions_roles_rbac_roles\` DROP FOREIGN KEY \`FK_a3fab43faecb8e0f9b0345cedba\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`rbac_roles_users_users\` DROP FOREIGN KEY \`FK_789b5818a876ba2c4f058bdeb98\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`rbac_roles_users_users\` DROP FOREIGN KEY \`FK_3c933e8c0950496fa3a616e4b27\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` DROP FOREIGN KEY \`FK_a06fc80bdb04af4572a9cae76de\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts\` DROP FOREIGN KEY \`FK_b987c297409fada38a52ab9a049\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports_comment\` DROP FOREIGN KEY \`FK_f949e7bf9cc90ce9867c24512e1\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports_comment\` DROP FOREIGN KEY \`FK_b4b461e85583741882d94cb1a7e\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports_post\` DROP FOREIGN KEY \`FK_c771bac04bc816fa9d0e2f129d4\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports_post\` DROP FOREIGN KEY \`FK_c48d187afdab08ea6b1686c4e86\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports_user\` DROP FOREIGN KEY \`FK_6f71e27705922f23ed9c0550da0\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_reports_user\` DROP FOREIGN KEY \`FK_c7eab640bd98835bb902ac9a8e8\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_comments\` DROP FOREIGN KEY \`FK_982a849f676860e5d6beb607f20\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_comments\` DROP FOREIGN KEY \`FK_5e1c3747a0031f305e94493361f\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_comments\` DROP FOREIGN KEY \`FK_3ec3e32832bd75f0fe472f2cc03\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_comments_likes\` DROP FOREIGN KEY \`FK_ac7ecce8caf00cacdaa6ea7dec0\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_comments_likes\` DROP FOREIGN KEY \`FK_1b804c4ea25ba7b28660b6af838\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts_likes\` DROP FOREIGN KEY \`FK_ab50091a76d0b03c4f03ac8e606\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_posts_likes\` DROP FOREIGN KEY \`FK_cb27adbb1f780804d6f11a57251\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_collects\` DROP FOREIGN KEY \`FK_64c63f02e22689d23aa2c4cc6ea\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`content_categories\` DROP FOREIGN KEY \`FK_a03aea27707893300382b6f18ae\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_access_tokens\` DROP FOREIGN KEY \`FK_71a030e491d5c8547fc1e38ef82\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`storage_medias\` DROP FOREIGN KEY \`FK_a4b8f72d2e7cdd5dc21ea5512a4\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`storage_medias\` DROP FOREIGN KEY \`FK_86b01412473b2f9db17faf7bac0\``,
        );
        await queryRunner.query(
            `ALTER TABLE \`user_refresh_tokens\` DROP FOREIGN KEY \`FK_1dfd080c2abf42198691b60ae39\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_6b73c9e8cd4e7b0a759951e9a1\` ON \`content_posts_collects_content_collects\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_dc19fc151ae8695376fbe7f8d1\` ON \`content_posts_collects_content_collects\``,
        );
        await queryRunner.query(`DROP TABLE \`content_posts_collects_content_collects\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_888e6754015ee17f9e22faae57\` ON \`content_posts_tags_content_tags\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_1e8c41827d0d509e70de1f6b70\` ON \`content_posts_tags_content_tags\``,
        );
        await queryRunner.query(`DROP TABLE \`content_posts_tags_content_tags\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_82926fe45def38f6a53838347a\` ON \`content_posts_categories_content_categories\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_9172320639056856745c6bc21a\` ON \`content_posts_categories_content_categories\``,
        );
        await queryRunner.query(`DROP TABLE \`content_posts_categories_content_categories\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_5910a3c31c94389248bd34afc4\` ON \`rbac_permissions_users_users\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_d12a35b88ace69f10656e31e58\` ON \`rbac_permissions_users_users\``,
        );
        await queryRunner.query(`DROP TABLE \`rbac_permissions_users_users\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_df26ec979184812b60c1c1a4e3\` ON \`rbac_permissions_roles_rbac_roles\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_a3fab43faecb8e0f9b0345cedb\` ON \`rbac_permissions_roles_rbac_roles\``,
        );
        await queryRunner.query(`DROP TABLE \`rbac_permissions_roles_rbac_roles\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_789b5818a876ba2c4f058bdeb9\` ON \`rbac_roles_users_users\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_3c933e8c0950496fa3a616e4b2\` ON \`rbac_roles_users_users\``,
        );
        await queryRunner.query(`DROP TABLE \`rbac_roles_users_users\``);
        await queryRunner.query(`DROP INDEX \`idx_user_id\` ON \`content_feeds\``);
        await queryRunner.query(`DROP TABLE \`content_feeds\``);
        await queryRunner.query(`DROP INDEX \`idx_country\` ON \`content_posts\``);
        await queryRunner.query(`DROP INDEX \`idx_like\` ON \`content_posts\``);
        await queryRunner.query(`DROP INDEX \`idx_comment\` ON \`content_posts\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_e51068c39974ca11fae5d44c88\` ON \`content_posts\``,
        );
        await queryRunner.query(
            `DROP INDEX \`IDX_9ef6db9d13df6882d36c8af0cc\` ON \`content_posts\``,
        );
        await queryRunner.query(`DROP INDEX \`idx_repost\` ON \`content_posts\``);
        await queryRunner.query(`DROP INDEX \`idx_uid\` ON \`content_posts\``);
        await queryRunner.query(`DROP TABLE \`content_posts\``);
        await queryRunner.query(`DROP INDEX \`uniq_name\` ON \`content_tags\``);
        await queryRunner.query(`DROP TABLE \`content_tags\``);
        await queryRunner.query(`DROP INDEX \`idx_uid\` ON \`content_reports_comment\``);
        await queryRunner.query(`DROP TABLE \`content_reports_comment\``);
        await queryRunner.query(`DROP INDEX \`idx_uid\` ON \`content_reports_post\``);
        await queryRunner.query(`DROP TABLE \`content_reports_post\``);
        await queryRunner.query(`DROP INDEX \`idx_uid\` ON \`content_reports_user\``);
        await queryRunner.query(`DROP TABLE \`content_reports_user\``);
        await queryRunner.query(`DROP INDEX \`idx_uid\` ON \`content_comments\``);
        await queryRunner.query(`DROP TABLE \`content_comments\``);
        await queryRunner.query(`DROP TABLE \`content_comments_likes\``);
        await queryRunner.query(`DROP TABLE \`content_posts_likes\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_fbeb7cd614e9bdf521e7095261\` ON \`content_collects\``,
        );
        await queryRunner.query(`DROP INDEX \`idx_uid\` ON \`content_collects\``);
        await queryRunner.query(`DROP TABLE \`content_collects\``);
        await queryRunner.query(
            `DROP INDEX \`IDX_d6aaf8517ca57297a8c3a44d3d\` ON \`content_categories\``,
        );
        await queryRunner.query(`DROP TABLE \`content_categories\``);
        await queryRunner.query(`DROP TABLE \`user_captchas\``);
        await queryRunner.query(`DROP TABLE \`user_access_tokens\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_a000cca60bcf04454e72769949\` ON \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`rbac_permissions\``);
        await queryRunner.query(`DROP TABLE \`rbac_roles\``);
        await queryRunner.query(
            `DROP INDEX \`REL_a4b8f72d2e7cdd5dc21ea5512a\` ON \`storage_medias\``,
        );
        await queryRunner.query(`DROP TABLE \`storage_medias\``);
        await queryRunner.query(
            `DROP INDEX \`REL_1dfd080c2abf42198691b60ae3\` ON \`user_refresh_tokens\``,
        );
        await queryRunner.query(`DROP TABLE \`user_refresh_tokens\``);
    }
}
