import type { Notification } from "./notification.js"

// 通知渠道
export interface NotificationChannel {
  send(notification: Notification): Promise<void>
}