import { ksql, DataTypes } from 'module/k_sqlite'

const Forum_AdminLog = ksql.define(
    'Forum_AdminLog',
    {
        operatorId: {
            type: DataTypes.String,
            required: true,
            comment: '操作者用户ID'
        },
        operatorName: {
            type: DataTypes.String,
            required: true,
            comment: '操作者用户名'
        },
        action: {
            type: DataTypes.String,
            required: true,
            index: true,
            comment: '操作类型：POST_DELETE, POST_PIN, POST_UNPIN, REPLY_DELETE, CATEGORY_CREATE, CATEGORY_UPDATE, CATEGORY_DELETE, TAG_CREATE, TAG_UPDATE, TAG_DELETE, USER_ROLE_CHANGE, USER_BAN, USER_UNBAN'
        },
        targetType: {
            type: DataTypes.String,
            required: true,
            index: true,
            comment: '对象类型：post, reply, category, tag, user'
        },
        targetId: {
            type: DataTypes.String,
            required: true,
            comment: '对象ID'
        },
        detail: {
            type: DataTypes.String,
            comment: '变更详情（JSON格式）'
        }
    },
    {
        timestamps: true,
        softDelete: false,
        comment: '管理操作日志'
    }
)

export { Forum_AdminLog }
