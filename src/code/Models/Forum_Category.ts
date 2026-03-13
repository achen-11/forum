import { ksql, DataTypes } from 'module/k_sqlite'

const Forum_Category = ksql.define(
    'Forum_Category',
    {
        name: {
            type: DataTypes.String,
            required: true
        },
        description: {
            type: DataTypes.String
        },
        parentId: {
            type: DataTypes.String,
            default: '',
            comment: '父分类 ID，空字符串表示顶级分类'
        },
        sortOrder: {
            type: DataTypes.Number,
            default: 0,
            index: true
        }
    },
    {
        timestamps: true,
        softDelete: true
    }
)

export { Forum_Category }
