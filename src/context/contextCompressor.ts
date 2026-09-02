import OpenAI from "openai"
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"

const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
})

const MAX_MESSAGES = 6
const RECENT_MESSAGES = 3

export async function compressContext(
  messages: ChatCompletionMessageParam[],
): Promise<ChatCompletionMessageParam[]> {
  if (messages.length <= MAX_MESSAGES) {
    return messages
  }//判断Context是否需要压缩

  const systemMessage = messages[0]
  if (!systemMessage) {
    return messages
  }

  //找旧消息
  const oldMessages = messages.slice(1 , messages.length - RECENT_MESSAGES)
  if (oldMessages.length === 0) {
    return messages
  }
  
  //找最近消息，只保留需要的字段
  const recentMessages = messages
    .slice(messages.length - RECENT_MESSAGES)
    .map((message) => {
      const { reasoning_content, ...rest } = message as typeof message & {
        reasoning_content?: unknown
      }
      return rest
    })

  const summaryInput = oldMessages
    .map((message) => {
      return `${message.role}: ${JSON.stringify(message.content)}`
    })
    .join("\n")

  const response = await client.chat.completions.create({
    model: "deepseek-v4-pro",
    messages: [
      {
        role: "system",
        content: `
你负责压缩 Agent 的历史对话。

请总结以下历史消息。

要求：

- 保留任务目标
- 保留已经完成的重要操作
- 保留重要文件信息
- 保留重要决策
- 保留后续任务可能需要的信息
- 删除无关细节
- 不要加入历史中不存在的信息
- 输出简洁的中文摘要
`,
      },
      {
        role: "user",
        content: summaryInput,
      },
    ],
  })

  const summary = response.choices[0]?.message.content ?? ""
  const summaryMessage: ChatCompletionMessageParam = {
    role: "system",
    content: `以下是之前对话的历史摘要：

${summary}`,
  }

  return [
    systemMessage,
    summaryMessage,
    ...recentMessages,
  ]
}