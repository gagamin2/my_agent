import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"

//创建初始上下文
export function createContext(
  systemPrompt: string,
  userInput: string,
  memory: string,
): ChatCompletionMessageParam[] {
  return [
    {
      role: "system",
      content: `${systemPrompt}

以下是 Agent 的长期 Memory：

${memory}`,
    },
    {
      role: "user",
      content: userInput,
    }
  ]
} 

//往context里添加信息。
export function addMessage(
  messages: ChatCompletionMessageParam[],
  message: ChatCompletionMessageParam,
) {
  messages.push(message)
}