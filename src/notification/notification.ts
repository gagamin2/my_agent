// 通知级别
export type NotificationLevel =
  | "info"
  | "warning"
  | "important"

// 通知消息
export interface Notification {
  title: string
  content: string
  level: NotificationLevel
  createdAt: Date
}