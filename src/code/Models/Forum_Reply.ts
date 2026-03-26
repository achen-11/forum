import { ksql, DataTypes } from 'module/k_sqlite'

const Forum_Reply = ksql.define(
    'Forum_Reply',
    {
        postId: {
            type: DataTypes.String,
            required: true,
            index: true
        },
        parentId: {
            type: DataTypes.String,
            default: '',
            comment: '父回复 ID，空字符串表示顶级回复'
        },
        rootReplyId: {
            type: DataTypes.String,
            default: '',
            comment: '顶级回复 ID，顶级回复此字段等于自己的 _id'
        },
        authorId: {
            type: DataTypes.String,
            required: true,
            index: true
        },
        content: {
            type: DataTypes.String,
            required: true
        },
        likeCount: {
            type: DataTypes.Number,
            default: 0,
            comment: '点赞数'
        },
        isAccepted: {
            type: DataTypes.Boolean,
            default: false,
            comment: '是否被接受为解决方案'
        }
    },
    {
        timestamps: true,
        softDelete: true
    }
)

export { Forum_Reply }
