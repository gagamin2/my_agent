import { createServer } from "node:http"
import { WebhookNotificationChannel } from "../notification/webhookNotificationChannel.js"
import type { Notification } from "../notification/notification.js"

const PORT = 3457

const server = createServer((_req, res) => {
  res.statusCode = 500
  res.end("Internal Server Error")
})

await new Promise<void>((resolve) => {
  server.listen(PORT, "127.0.0.1", () => {
    resolve()
  })
})

const notification: Notification = {
  title: "错误测试",
  content: "测试 HTTP 500",
  level: "important",
  createdAt: new Date(),
}

const channel = new WebhookNotificationChannel(`http://127.0.0.1:${PORT}/webhook`)

let failed = false

try {
  await channel.send(notification)
} catch (error) {
  failed = true

  console.log(
    "✓ 正确捕获 Webhook HTTP 错误：",
    error instanceof Error
      ? error.message
      : String(error),
  )
}

if (!failed) {
  throw new Error("HTTP 500 时应该抛出错误")
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

console.log("\nWebhook Notification Channel 错误测试通过")