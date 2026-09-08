import { createServer } from "node:http"
import { WebhookNotificationChannel } from "../notification/webhookNotificationChannel.js"
import type { Notification } from "../notification/notification.js"

const PORT = 3458

const server = createServer(() => {
  // 模拟无返回内容
})

await new Promise<void>((resolve) => {
  server.listen(PORT, "127.0.0.1", () => {
    resolve()
  })
})

const notification: Notification = {
  title: "超时测试",
  content: "测试 Webhook 请求超时",
  level: "important",
  createdAt: new Date(),
}

const channel = new WebhookNotificationChannel(
  `http://127.0.0.1:${PORT}/webhook`,
  1000,
)

const startTime = Date.now()

let failed = false

try {
  await channel.send(notification)
} catch (error) {
  failed = true

  const elapsed = Date.now() - startTime

  console.log("✓ Webhook 超时被正确捕获")
  console.log(`✓ 请求约 ${elapsed}ms 后结束`)
}

if (!failed) {
  throw new Error("Webhook 超时时应该抛出错误")
}

await new Promise<void>((resolve, reject) => {
  server.close((error) => {
    if (error) {
      reject(error)
      return
    }
    resolve()
  })
})

console.log("\nWebhook Notification Channel 超时测试通过")