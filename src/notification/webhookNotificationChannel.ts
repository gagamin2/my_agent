import type { Notification } from "./notification.js"
import type { NotificationChannel } from "./notificationChannel.js"

export class WebhookNotificationChannel
  implements NotificationChannel
{
  private readonly webhookUrl: string
  private readonly timeoutMs: number

  constructor(
    webhookUrl: string,
    timeoutMs = 5000,
  ) {
    this.webhookUrl = webhookUrl
    this.timeoutMs = timeoutMs
  }

  async send(notification: Notification): Promise<void> {
    const controller = new AbortController()

    //默认超时时间：5秒
    const timeout = setTimeout(() => {
      controller.abort()
    }, this.timeoutMs)

    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: notification.title,
          content: notification.content,
          level: notification.level,
          createdAt: notification.createdAt.toISOString(),
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`Webhook 请求失败：HTTP ${response.status}`)
      }
    } finally {
      clearTimeout(timeout)
    }
  }
}