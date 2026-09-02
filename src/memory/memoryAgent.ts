import OpenAI from "openai"
import { loadMemory, saveMemory } from "./memoryManager.js"
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"
import { loadSkill } from "../skills/loadSkill.js"

const MAX_TURNS=5//memoryAgent最大运行轮数

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