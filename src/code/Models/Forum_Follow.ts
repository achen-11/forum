import { ksql, DataTypes } from 'module/k_sqlite'

/**
 * 论坛用户关注关系表
 * 用于存储用户之间的关注关系
 */
const Forum_Follow = ksql.define(
    'Forum_Follow',
    {
        /**
         * 关注者 ID (发起关注的人)
         */
        followerId: {
            type: DataTypes.String,
            required: true,
            ref: { tableName: 'Forum_User', fieldName: '_id', onDelete: 'CASCADE' },
            index: true
        },
        /**
         * 被关注者 ID (被关注的人)
         */
        followingId: {
            type: DataTypes.String,
            required: true,
            ref: { tableName: 'Forum_User', fieldName: '_id', onDelete: 'CASCADE' },
            index: true
        }
    },
    {
        timestamps: true,     // 自动添加 createdAt, updatedAt
        softDelete: false     // 关注关系一般不需要软删除，直接物理删除即可
    }
)

export { Forum_Follow }
