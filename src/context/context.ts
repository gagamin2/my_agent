import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"

//创建初始上下文
export function createContext(
  systemPrompt: string,
  userInput: string,
): ChatCompletionMessageParam[] {
  return [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: userInput,
    },
  ]
} 

//往context里添加信息。
export function addMessage(
  messages: ChatCompletionMessageParam[],
  message: ChatCompletionMessageParam,
) {
  messages.push(message)
}