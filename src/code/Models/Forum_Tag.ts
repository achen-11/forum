import { ksql, DataTypes } from 'module/k_sqlite'

const Forum_Tag = ksql.define(
    'Forum_Tag',
    {
        name: {
            type: DataTypes.String,
            required: true,
            unique: true,
            index: true
        },
        color: {
            type: DataTypes.String,
            default: '#6366f1',
            comment: '标签颜色'
        },
        usageCount: {
            type: DataTypes.Number,
            default: 0,
            comment: '使用次数'
        }
    },
    {
        timestamps: true,
        softDelete: true
    }
)

export { Forum_Tag }
