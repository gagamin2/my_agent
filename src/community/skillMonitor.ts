import { createInterface } from "node:readline/promises"
import { runAgent } from "../agent/agent.js"
import { createSession } from "../session/session.js"

export async function runSkillMonitor(): Promise<void> {
  console.log("\n========== SkillHub 自动监控开始 ==========")

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  try {
    const session = createSession()

    const result = await runAgent(
      "帮我分析一下 SkillHub 最近有哪些值得关注的新 Skill",
      session,
      rl,
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