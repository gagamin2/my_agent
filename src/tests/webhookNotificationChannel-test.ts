import { WebhookNotificationChannel } from "../notification/webhookNotificationChannel.js"
import type { Notification } from "../notification/notification.js"

const notification: Notification = {
  title: "测试通知",
  content: "这是一条 Webhook 测试通知",
  level: "important",
  createdAt: new Date(),
}

const channel = new WebhookNotificationChannel(
  "https://example.com/webhook",
)

await channel.send(notification)

console.log(
  "Webhook Notification Channel 测试通过",
)