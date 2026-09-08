import "dotenv/config"
import type { Notification } from "../notification/notification.js"
import { WebhookNotificationChannel } from "../notification/webhookNotificationChannel.js"

const webhookUrl = process.env.WEBHOOK_URL

if (!webhookUrl) {
  throw new Error("WEBHOOK_URL 环境变量没有配置")
}

const channel = new WebhookNotificationChannel(
  webhookUrl,
)

const notification: Notification = {
  title: "Webhook 真实请求测试",
  content: "这是一条来自 Agent 项目的真实 Webhook 测试通知。",
  level: "important",
  createdAt: new Date(),
}

await channel.send(notification)

console.log("✓ Webhook 真实请求发送成功")