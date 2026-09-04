import {
  createSession,
} from "../session/session.js"

import {
  saveSession,
  loadSession,
} from "../session/sessionManager.js"

async function main() {
  console.log("开始测试 Session Persistence\n")

  // 1. 创建一个 Session
  const session = createSession()

  session.messages.push({
    role: "user",
    content: "你好，我正在学习 TypeScript",
  })

  console.log("① 创建 Session")
  console.log("sessionId:", session.sessionId)

  // 2. 保存 Session
  await saveSession(session)

  console.log("\n② 保存 Session")
  console.log("Session 保存成功")

  // 3. 重新读取 Session
  const loadedSession = await loadSession()

  console.log("\n③ 加载 Session")

  if (!loadedSession) {
    console.log("❌ 加载失败")
    process.exitCode = 1
    return
  }

  console.log("sessionId:", loadedSession.sessionId)

  // 4. 检查数据是否一致
  const sessionIdCorrect =
    loadedSession.sessionId === session.sessionId

  const messagesCorrect =
    JSON.stringify(loadedSession.messages) ===
    JSON.stringify(session.messages)

  if (sessionIdCorrect && messagesCorrect) {
    console.log("\n🎉 Session Persistence 测试通过！")
  } else {
    console.log("\n❌ Session Persistence 测试失败")

    console.log("sessionId 是否一致：", sessionIdCorrect)
    console.log("messages 是否一致：", messagesCorrect)

    process.exitCode = 1
  }
}

main()