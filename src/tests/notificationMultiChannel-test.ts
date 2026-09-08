import type { Notification } from "../notification/notification.js"
import type { NotificationChannel } from "../notification/notificationChannel.js"
import { NotificationManager } from "../notification/notificationManager.js"

class TestChannel implements NotificationChannel {
  public received: Notification[] = []

  async send(notification: Notification): Promise<void> {
    this.received.push(notification)
  }
}

const consoleChannel = new TestChannel()
const webhookChannel = new TestChannel()

const manager = new NotificationManager([
  consoleChannel,
  webhookChannel,
])

const notification: Notification = {
  title: "多渠道测试",
  content: "测试一条通知是否能够发送到多个渠道",
  level: "important",
  createdAt: new Date(),
}

await manager.send(notification)

if (consoleChannel.received.length !== 1) {
  throw new Error("第一个通知渠道应该收到一次通知")
}

console.log("✓ 第一个通知渠道测试通过")

if (webhookChannel.received.length !== 1) {
  throw new Error("第二个通知渠道应该收到一次通知")
}

console.log("✓ 第二个通知渠道测试通过")

if (consoleChannel.received[0] !== notification) {
  throw new Error("第一个渠道收到的通知对象不正确")
}

if (webhookChannel.received[0] !== notification) {
  throw new Error("第二个渠道收到的通知对象不正确")
}

console.log("✓ 两个渠道收到相同通知测试通过")
console.log("\nNotification Multi Channel 测试全部通过")