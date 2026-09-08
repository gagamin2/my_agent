import type { Notification } from "./notification.js"
import type { NotificationChannel } from "./notificationChannel.js"

interface DingTalkResponse {
  errcode: number
  errmsg: string
}

export class DingTalkNotificationChannel
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
          msgtype: "text",
          text: {
            content: [
              notification.title,
              "",
              notification.content,
              "",
              `时间：${notification.createdAt.toLocaleString()}`,
            ].join("\n"),//消息格式转换：钉钉机器人
          },
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`钉钉机器人请求失败：HTTP ${response.status}`)
      }

      const data = (await response.json()) as DingTalkResponse

      if (data.errcode !== 0) {
        throw new Error(`钉钉机器人发送失败：${data.errmsg}`)
      }
    } finally {
      clearTimeout(timeout)
    }
  }
}