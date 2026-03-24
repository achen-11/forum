import { ksql, DataTypes } from 'module/k_sqlite'

/**
 * 通知类型枚举
 */
export type NotificationTypeEnum =
  | 'reply'        // 回复通知
  | 'like_post'    // 帖子被点赞
  | 'like_reply'   // 评论被点赞
  | 'follow'       // 关注通知
  | 'best_answer'  // 最佳答案通知
  | 'system'       // 系统通知

const Forum_Notification = ksql.define(
  'Forum_Notification',
  {
    userId: {
      type: DataTypes.String,
      required: true,
      ref: { tableName: 'Forum_User', fieldName: '_id', onDelete: 'CASCADE' },
      index: true
    },
    type: {
      type: DataTypes.String,
      required: true,
      index: true
      // reply, like_post, like_reply, follow, best_answer, system
    },
    title: {
      type: DataTypes.String,
      required: true
    },
    content: {
      type: DataTypes.String,
      default: ''
    },
    // 相关目标 ID（帖子 ID 或回复 ID）
    targetId: {
      type: DataTypes.String,
      default: ''
    },
    // 触发者的用户 ID
    actorId: {
      type: DataTypes.String,
      default: ''
    },
    isRead: {
      type: DataTypes.Boolean,
      default: false,
      index: true
    },
    createdAt: {
      type: DataTypes.Timestamp,
      default: () => Date.now()
    }
  },
  {
    timestamps: false,
    softDelete: false,
    indexes: [
      {
        columns: ['userId', 'isRead'],
        name: 'forum_notification_user_read_idx'
      },
      {
        columns: ['userId', 'createdAt'],
        name: 'forum_notification_user_time_idx'
      }
    ]
  }
)

export { Forum_Notification }
export type Forum_NotificationType = typeof Forum_Notification.$type
