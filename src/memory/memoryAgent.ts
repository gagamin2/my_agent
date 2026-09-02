import OpenAI from "openai"
import { loadMemory } from "./memoryManager.js"
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"
import { loadSkill } from "../skills/loadSkill.js"
import { memoryTools, executeMemoryTool } from "./memoryTool.js"
import { addMessage } from "../context/context.js"

const MAX_TURNS=5//memoryAgent 最大运行轮数
const memorySkill = await loadSkill("./src/skill/memoryManagement.md")

const systemPrompt = `
你是 Memory Agent。

你的唯一职责是维护 Agent 的长期 Memory。

请严格遵守当前提供的 Memory Management Skill。
`

const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
})

//MemoryAgent入口
export async function runMemoryAgent(
  task: string,
  result: string,
): Promise<void> {
  const currentMemory = await loadMemory()

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `${systemPrompt}

当前 Memory Management Skill：

${memorySkill}

当前 Memory：

${currentMemory}

本次任务：

${task}

Agent 执行结果：

${result}`,
    },
    {
      role: "user",
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
      tools: memoryTools,
    })
    const message = response.choices[0]?.message

    if (!message) {
      console.log("Memory Agent 没有返回结果")
      return
    }
    if (!message.tool_calls) {
      console.log("本轮 Memory Agent 没有调用工具，任务结束")
      return
    }

    //把 Assistant 的 Tool Call加入上下文
    addMessage(messages, {
      ...message,
      content: message.content ?? "",
    })

    for (const toolCall of message.tool_calls) {
      if (toolCall.type !== "function") {
        continue
      }

      const toolResult = await executeMemoryTool(
        toolCall.function.name,
        toolCall.function.arguments,
      )

      //Tool执行结果加入上下文
      addMessage(messages, {
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult),
      })
    }
  }
  console.log("Memory Agent 达到最大执行轮数，停止。")
}