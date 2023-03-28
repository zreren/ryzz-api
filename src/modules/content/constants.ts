/**
 * 文章内容类型
 *
 * @export
 * @enum {number}
 */
export enum PostBodyType {
    HTML = 'html',
    MD = 'markdown',
}

/**
 * 文章排序类型
 */
export enum PostOrderType {
    CREATED = 'createdAt',
    UPDATED = 'updatedAt',
    PUBLISHED = 'publishedAt',
    COMMENTCOUNT = 'commentCount',
    CUSTOM = 'custom',
}

/**
 * 帖子类型
 */
export enum PostType {
    NORMAL = 1, // 普通贴
    REPOST = 2, // 转发帖
}

/**
 * 举报处理状态
 */
export enum ReportStatus {
    HANDLING = 'handling', // 处理中
    DONE = 'done', // 已处理
}

/**
 * 国家
 * https://www.cnblogs.com/zhc-hnust/p/10278910.html
 */
export enum Countries {
    US = 'us',
    GB = 'gb',
    DE = 'de',
    CA = 'ca',
    JP = 'jp',
    ES = 'es',
    FR = 'fr',
    IT = 'it',
    CN = 'cn', // 待补充
}
