import { createServer } from "node:http"
import { WebhookNotificationChannel } from "../notification/webhookNotificationChannel.js"
import type { Notification } from "../notification/notification.js"

const PORT = 3456

let receivedBody = ""

const server = createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/webhook") {
    res.statusCode = 404
    res.end()
    return
  }

  let body = ""

  req.on("data", (chunk) => {
    body += chunk.toString()
  })

  req.on("end", () => {
    receivedBody = body

    res.statusCode = 200
    res.setHeader("Content-Type","application/json")
    res.end(JSON.stringify({ success: true }))
  })
})

await new Promise<void>((resolve) => {
  server.listen(PORT, "127.0.0.1", () => {
    resolve()
  })
})

console.log(`✓ 测试服务器已启动：http://127.0.0.1:${PORT}/webhook`)

const notification: Notification = {
  title: "测试通知",
  content: "这是一条真实 HTTP Webhook 测试通知",
  level: "important",
  createdAt: new Date(),
}

const channel = new WebhookNotificationChannel(`http://127.0.0.1:${PORT}/webhook`)

await channel.send(notification)

const received = JSON.parse(receivedBody)

if (received.title !== notification.title) {
  throw new Error("Webhook title 数据不正确")
}

if (received.content !== notification.content) {
  throw new Error("Webhook content 数据不正确")
}

if (received.level !== notification.level) {
  throw new Error("Webhook level 数据不正确")
}

if (received.createdAt !== notification.createdAt.toISOString()) {
  throw new Error("Webhook createdAt 数据不正确")
}

console.log("✓ HTTP POST 请求测试通过")
console.log("✓ JSON 数据测试通过")
console.log("✓ Notification 数据映射测试通过")

await new Promise<void>((resolve, reject) => {
  server.close((error) => {
    if (error) {
      reject(error)
      return
    }
    resolve()
  })
})

console.log("\nWebhook Notification Channel HTTP 测试全部通过")