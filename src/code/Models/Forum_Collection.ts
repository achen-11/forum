import { ksql, DataTypes } from 'module/k_sqlite'

const Forum_Collection = ksql.define(
    'Forum_Collection',
    {
        userId: {
            type: DataTypes.String,
            required: true,
            index: true
        },
        postId: {
            type: DataTypes.String,
            required: true,
            index: true
        }
    },
    {
        timestamps: true,
        softDelete: true
    }
)

export { Forum_Collection }
