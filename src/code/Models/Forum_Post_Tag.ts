import { ksql, DataTypes } from 'module/k_sqlite'

const Forum_Post_Tag = ksql.define(
    'Forum_Post_Tag',
    {
        postId: {
            type: DataTypes.String,
            required: true,
            ref: { tableName: 'Forum_Post', fieldName: '_id', onDelete: 'CASCADE' },
            index: true
        },
        tagId: {
            type: DataTypes.String,
            required: true,
            ref: { tableName: 'Forum_Tag', fieldName: '_id', onDelete: 'CASCADE' },
            index: true
        }
    },
    {
        timestamps: true,
        softDelete: true
    }
)

export { Forum_Post_Tag }
