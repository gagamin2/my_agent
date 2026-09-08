import { createInterface } from "node:readline/promises"
import { runAgent } from "../agent/agent.js"
import { createSession } from "../session/session.js"
import { NotificationManager } from "../notification/notificationManager.js"
import { ConsoleNotificationChannel } from "../notification/consoleNotificationChannel.js"
import { SkillNotificationService } from "../notification/skillNotificationService.js"
import { NotificationHistory } from "../notification/notificationHistory.js"
import { WebhookNotificationChannel } from "../notification/webhookNotificationChannel.js"

export async function runSkillMonitor(): Promise<void> {
  console.log("\n========== SkillHub 自动监控开始 ==========")

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  try {
    const session = createSession()

    const notificationManager = new NotificationManager([
      new ConsoleNotificationChannel(),
      new WebhookNotificationChannel(
        "https://example.com/webhook",
      ),
    ])

    const notificationHistory =new NotificationHistory()

    const skillNotificationService =
      new SkillNotificationService(
      notificationManager,
      notificationHistory,
    )

    const result = await runAgent(
      "帮我分析一下 SkillHub 最近有哪些值得关注的新 Skill",
      session,
      rl,
      async (recommendation) => {
        await skillNotificationService.handleRecommendation(
        recommendation,
      )
    },
    )

    console.log("\n========== SkillHub 监控结果 ==========")
    console.log(result)
    console.log("========== SkillHub 自动监控结束 ==========\n")
  } catch (error) {
    console.error(
      "SkillHub 监控失败：",
      error instanceof Error ? error.message : String(error),
    )
  } finally {
    rl.close()
  }
}