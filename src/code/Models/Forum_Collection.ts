import { ksql, DataTypes } from 'module/k_sqlite'

const Forum_Collection = ksql.define(
    'Forum_Collection',
    {
        userId: {
            type: DataTypes.String,
            required: true,
            ref: { tableName: 'Forum_User', fieldName: '_id' },
            index: true
        },
        postId: {
            type: DataTypes.String,
            required: true,
            ref: { tableName: 'Forum_Post', fieldName: '_id' },
            index: true
        }
    },
    {
        timestamps: true,
        softDelete: true
    }
)

export { Forum_Collection }
