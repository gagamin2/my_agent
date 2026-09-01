import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"

const MAX_RECOVERY = 3//允许最多截断恢复次数
// let recoveryCount = 0

export function handleTruncation(
  messages: ChatCompletionMessageParam[],
  recoveryCount: number,
): {
  status: "retry" | "give_up"
  recoveryCount: number
    } {
    recoveryCount++

  if (recoveryCount >= MAX_RECOVERY) {
    return {
      status: "give_up",
      recoveryCount,
    }
  }

  const message =
    recoveryCount === 1
      ? "输出从断点继续，不要回顾，把剩余工作拆成更小的块。"
      : "再次被截断。请大幅精简输出，只列关键结论。"

  console.log(`输出截断，正在进行第 ${recoveryCount}/${MAX_RECOVERY} 次恢复`)

  messages.push({
    role: "system",
    content: message,
  })

  return {
    status: "retry",
    recoveryCount,
  }
}