import { ksql, DataTypes } from 'module/k_sqlite'

const Forum_User = ksql.define(
    'Forum_User',
    {
        userName: {
            type: DataTypes.String,
            required: true,
            unique: true,
            index: true
        },
        displayName: {
            type: DataTypes.String,
            required: true
        },
        password: {
            type: DataTypes.String,
            required: true
        },
        email: {
            type: DataTypes.String,
            unique: true,
            index: true
        },
        phone: {
            type: DataTypes.String,
            unique: true,
            index: true
        },
        avatar: {
            type: DataTypes.String
        },
        role: {
            type: DataTypes.String,
            default: 'user'
        },
        koobooId: {
            type: DataTypes.String,
            comment: '后期接入 Kooboo 登录用'
        },
        lastLoginAt: {
            type: DataTypes.Timestamp
        },
        isBanned: {
            type: DataTypes.Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        softDelete: true
    }
)

export { Forum_User }
