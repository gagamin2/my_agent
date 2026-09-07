import { NotificationManager } from "../notification/notificationManager.js"
import { ConsoleNotificationChannel } from "../notification/consoleNotificationChannel.js"
import type {Notification} from "../notification/notification.js"
import type {NotificationChannel} from "../notification/notificationChannel.js"

const notification: Notification = {
  title: "测试通知",
  content: "这是一条消息推送测试。",
  level: "info",
  createdAt: new Date(),
}

const consoleChannel = new ConsoleNotificationChannel()

const failedChannel: NotificationChannel = {
  async send() {
    throw new Error("模拟通知渠道故障")
  },
}

const notificationManager =
  new NotificationManager([
    consoleChannel,
    failedChannel,
  ])

await notificationManager.send(notification)