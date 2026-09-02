import OpenAI from "openai"
import { loadMemory, saveMemory } from "./memoryManager.js"
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"

const MAX_TURNS=5//memoryAgent最大运行轮数

const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
})

export async function runMemoryAgent(
  task: string,
  result: string,
): Promise<void> {
  const currentMemory = await loadMemory()

  const messages : ChatCompletionMessageParam[]= [
    {
      role: "system" as const,
      content: `
你是一个专门负责维护长期 Memory 的 Memory Agent。

你的任务是：

1. 阅读当前 Memory。
2. 阅读本次任务和 Agent 执行结果。
3. 判断是否存在值得长期保存的信息。
4. 如果有，整理并更新 Memory。
5. 如果没有，不修改 Memory。

只有满足以下条件的信息才应该进入 Memory：

- 对未来任务有帮助。
- 具有长期价值。
- 不容易从代码、配置或文档中直接推导出来。
- 不是一次性的执行结果。
- 不是临时状态。

如果更新 Memory：

- 保留已有的重要信息。
- 添加新的重要信息。
- 删除明显过时或错误的信息。
- 避免重复。
- 保持 Markdown 格式。
- 最终 Memory 应该简洁。

当前 Memory：

${currentMemory}

本次任务：

${task}

Agent 执行结果：

${result}
      `,
    },
    {
      role: "user" as const,
      content: "请根据以上信息维护 Memory。",
    },
  ]

  let turn = 0
  while (turn<MAX_TURNS) {
    turn++
    console.log(`Memory Agent 第 ${turn} 轮`)

    const response = await client.chat.completions.create({
      model: "deepseek-v4-pro",
      messages,
    })
    const message = response.choices[0]?.message

    if (!message) {
      console.log("Memory Agent 没有返回结果")
      return
    }
    if (!message.tool_calls) {
      const newMemory = message.content?.trim()
      if (!newMemory) {
        console.log("Memory Agent 没有生成新的 Memory")
        return
      }
      await saveMemory(newMemory)
      console.log("Memory Agent 已更新 Memory")
      return
    }
    messages.push(message)
  }
  console.log("Memory Agent 达到最大执行轮数，停止。")
}