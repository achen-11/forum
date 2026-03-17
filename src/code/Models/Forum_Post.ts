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
        }
    },
    {
        timestamps: true,
        softDelete: true
    }
)

export { Forum_Post }
