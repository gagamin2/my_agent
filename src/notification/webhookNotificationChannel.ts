import type { Notification } from "./notification.js"
import type { NotificationChannel } from "./notificationChannel.js"

export class WebhookNotificationChannel
  implements NotificationChannel
{
  private readonly webhookUrl: string

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl
  }

  async send(notification: Notification): Promise<void> {
    console.log("\n========== Webhook 通知 ==========")
    console.log("Webhook URL：", this.webhookUrl)
    console.log("标题：", notification.title)
    console.log("内容：", notification.content)
    console.log("级别：", notification.level)
    console.log(
      "时间：",
      notification.createdAt.toISOString(),
    )
    console.log("=================================\n")
  }
}