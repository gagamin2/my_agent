import OpenAI from "openai"
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"

const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
})

const MAX_MESSAGES = 10
const RECENT_MESSAGES = 6

//处理错误的Tool信息
function hasInvalidToolMessage(
  messages: ChatCompletionMessageParam[],
): boolean {
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]
    if (!message) {continue}
    if (message.role !== "tool") {continue}

    const previousMessage = messages[i - 1]
    if (
      !previousMessage ||
      previousMessage.role !== "assistant" ||
      !previousMessage.tool_calls
    ) {
      return true
    }
  }
  return false
}

//压缩上下文
export async function compressContext(
  messages: ChatCompletionMessageParam[],
): Promise<ChatCompletionMessageParam[]> {
  if (messages.length <= MAX_MESSAGES) {
    console.log(`Context 不需要压缩，当前消息数量：${messages.length}`)
    return messages
  }//判断Context是否需要压缩

  console.log(`Context 开始压缩：${messages.length} 条消息 → 压缩后预计保留 ${RECENT_MESSAGES + 2} 条`)
  
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
  let recentStart = Math.max(1,messages.length - RECENT_MESSAGES)
  // 如果最近消息是tool，就一同保留前面所有assistant(tool_calls)
  while (
    recentStart > 1 &&
    messages[recentStart]?.role === "tool"
  ) {
    recentStart--
  }

  const recentMessages = messages
    .slice(recentStart)
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

  let response
  try{
    response = await client.chat.completions.create({
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
  }catch (error) {
    console.error("Context 压缩失败，保留原始上下文。")
    return messages
  }

  const summary = response.choices[0]?.message.content ?? ""
  const summaryMessage: ChatCompletionMessageParam = {
    role: "system",
    content: `以下是之前对话的历史摘要：

${summary}`,
  }

  const compressedMessages: ChatCompletionMessageParam[] = [
    systemMessage,
    summaryMessage,
    ...recentMessages,
  ]

  if (hasInvalidToolMessage(compressedMessages)) {
  console.error("Context 压缩后检测到非法 Tool 消息，保留原始 Context。")

  return messages
}
return compressedMessages
}