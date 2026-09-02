import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"
import { randomUUID } from "node:crypto"

export interface Session {
  sessionId: string
  messages: ChatCompletionMessageParam[]
  createdAt: Date
}

//创建会话
export function createSession(): Session {
  return {
    sessionId: randomUUID(),
    messages: [],
    createdAt: new Date(),
  }
}

// //给会话添加信息
// export function addSessionMessage(
//   session: Session,
//   message: ChatCompletionMessageParam,
// ): void {
//   session.messages.push(message)
// }