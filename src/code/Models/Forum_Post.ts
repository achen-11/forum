import { ksql, DataTypes } from 'module/k_sqlite'

const Forum_Post = ksql.define(
    'Forum_Post',
    {
        title: {
            type: DataTypes.String,
            required: true
        },
        content: {
            type: DataTypes.String,
            required: true
        },
        // 原始 Markdown 内容，用于编辑时还原
        markdownContent: {
            type: DataTypes.String,
            required: true,
        },
        authorId: {
            type: DataTypes.String,
            required: true,
            ref: { tableName: 'Forum_User', fieldName: '_id' },
            index: true
        },
        categoryId: {
            type: DataTypes.String,
            ref: { tableName: 'Forum_Category', fieldName: '_id' },
            index: true
        },
        summary: {
            type: DataTypes.String
        },
        viewCount: {
            type: DataTypes.Number,
            default: 0
        },
        replyCount: {
            type: DataTypes.Number,
            default: 0
        },
        likeCount: {
            type: DataTypes.Number,
            default: 0
        },
        shareCount: {
            type: DataTypes.Number,
            default: 0
        },
        isPinned: {
            type: DataTypes.Boolean,
            default: false,
            index: true
        },
        // 是否已编辑
        isEdited: {
            type: DataTypes.Boolean,
            default: false,
        },
        // 编辑时间
        editedAt: {
            type: DataTypes.Timestamp,
        },
        // 是否已解决
        isSolved: {
            type: DataTypes.Boolean,
            default: false,
            index: true,
        },
        // 被接受的回复 ID
        acceptedReplyId: {
            type: DataTypes.String,
        }
    },
    {
        timestamps: true,
        softDelete: true
    }
)

export { Forum_Post }
