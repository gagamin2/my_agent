import type { Notification } from "./notification.js"
import type { NotificationChannel } from "./notificationChannel.js"

export class NotificationManager {
  private readonly channels: NotificationChannel[]

  constructor(channels: NotificationChannel[]) {
    this.channels = channels
  }//消息渠道

  //遍历所有渠道，逐个发送
  async send(notification: Notification): Promise<void> {
    for (const channel of this.channels) {
      try {
        await channel.send(notification)
      } catch (error) {
        console.error(
          "通知发送失败：",
          error instanceof Error ? error.message : String(error),
        )
      }
    }
  }
}