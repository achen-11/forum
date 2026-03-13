import { ksql, DataTypes } from 'module/k_sqlite'

const Forum_Reply = ksql.define(
    'Forum_Reply',
    {
        postId: {
            type: DataTypes.String,
            required: true,
            ref: { tableName: 'Forum_Post', fieldName: '_id' },
            index: true
        },
        parentId: {
            type: DataTypes.String,
            default: '',
            comment: '父回复 ID，空字符串表示顶级回复'
        },
        authorId: {
            type: DataTypes.String,
            required: true,
            ref: { tableName: 'Forum_User', fieldName: '_id' },
            index: true
        },
        content: {
            type: DataTypes.String,
            required: true
        }
    },
    {
        timestamps: true,
        softDelete: true
    }
)

export { Forum_Reply }
