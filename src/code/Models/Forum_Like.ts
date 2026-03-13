import { ksql, DataTypes } from 'module/k_sqlite'

const Forum_Like = ksql.define(
    'Forum_Like',
    {
        userId: {
            type: DataTypes.String,
            required: true,
            ref: { tableName: 'Forum_User', fieldName: '_id' },
            index: true
        },
        targetType: {
            type: DataTypes.String,
            required: true,
            comment: 'post=帖子, reply=回复'
        },
        targetId: {
            type: DataTypes.String,
            required: true,
            comment: '被点赞的帖子或回复的 ID'
        }
    },
    {
        timestamps: true
    }
)

export { Forum_Like }
