import "dotenv/config"
import type { Notification } from "../notification/notification.js"
import { DingTalkNotificationChannel } from "../notification/dingTalkNotificationChannel.js"

async function main() {
  console.log("开始测试钉钉机器人通知\n")

  const webhookUrl = process.env.WEBHOOK_URL

  if (!webhookUrl) {
    throw new Error("未配置 WEBHOOK_URL 环境变量")
  }

  const channel = new DingTalkNotificationChannel(webhookUrl)

  const notification: Notification = {
    title: "SkillHub Agent 测试通知",
    content: [
      "这是一条钉钉机器人测试消息。",
      "",
      "如果你能在钉钉群里看到这条消息，说明：",
      "Agent → Notification → DingTalk Bot",
      "这条链路已经打通。",
    ].join("\n"),
    level: "important",
    createdAt: new Date(),
  }

  try {
    await channel.send(notification)

    console.log("🎉 钉钉机器人通知发送成功！")
    console.log("请检查钉钉测试群是否收到消息。")
  } catch (error) {
    console.error("\n❌ 钉钉机器人通知发送失败")

    console.error(
        error instanceof Error? error.message: String(error),
    )

    process.exitCode = 1
  }
}

main()