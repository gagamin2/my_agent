import {
  createSession,
} from "../session/session.js"

import {
  saveSession,
  loadSession,
} from "../session/sessionManager.js"

async function main() {
  console.log("开始测试 Multi Session Persistence\n")

  // =========================
  // ① 创建 Session A
  // =========================

  const sessionA = createSession()

  sessionA.messages.push({
    role: "user",
    content: "这是 Session A 的消息",
  })

  console.log("① 创建 Session A")
  console.log("sessionId:", sessionA.sessionId)

  await saveSession(sessionA)

  console.log("Session A 保存成功")


  // =========================
  // ② 创建 Session B
  // =========================

  const sessionB = createSession()

  sessionB.messages.push({
    role: "user",
    content: "这是 Session B 的消息",
  })

  console.log("\n② 创建 Session B")
  console.log("sessionId:", sessionB.sessionId)

  await saveSession(sessionB)

  console.log("Session B 保存成功")


  // =========================
  // ③ 分别加载两个 Session
  // =========================

  const loadedSessionA =
    await loadSession(
      sessionA.sessionId,
    )

  const loadedSessionB =
    await loadSession(
      sessionB.sessionId,
    )

  console.log("\n③ 分别加载 Session A 和 Session B")


  // =========================
  // ④ 检查加载结果
  // =========================

  if (!loadedSessionA || !loadedSessionB) {
    console.log("❌ Session 加载失败")
    process.exitCode = 1
    return
  }

  console.log(
    "Session A:",
    loadedSessionA.sessionId,
  )

  console.log(
    "Session B:",
    loadedSessionB.sessionId,
  )


  // =========================
  // ⑤ 检查 Session 是否互相独立
  // =========================

  const sessionAIdCorrect =
    loadedSessionA.sessionId ===
    sessionA.sessionId

  const sessionBIdCorrect =
    loadedSessionB.sessionId ===
    sessionB.sessionId

  const sessionAMessageCorrect =
    JSON.stringify(
      loadedSessionA.messages,
    ) ===
    JSON.stringify(
      sessionA.messages,
    )

  const sessionBMessageCorrect =
    JSON.stringify(
      loadedSessionB.messages,
    ) ===
    JSON.stringify(
      sessionB.messages,
    )

  const sessionsAreIndependent =
    loadedSessionA.sessionId !==
      loadedSessionB.sessionId &&
    loadedSessionA.messages[0]?.content !==
      loadedSessionB.messages[0]?.content


  // =========================
  // ⑥ 输出测试结果
  // =========================

  console.log(
    "\nSession A ID 是否一致：",
    sessionAIdCorrect,
  )

  console.log(
    "Session B ID 是否一致：",
    sessionBIdCorrect,
  )

  console.log(
    "Session A 消息是否一致：",
    sessionAMessageCorrect,
  )

  console.log(
    "Session B 消息是否一致：",
    sessionBMessageCorrect,
  )

  console.log(
    "两个 Session 是否相互独立：",
    sessionsAreIndependent,
  )


  if (
    sessionAIdCorrect &&
    sessionBIdCorrect &&
    sessionAMessageCorrect &&
    sessionBMessageCorrect &&
    sessionsAreIndependent
  ) {
    console.log(
      "\n🎉 Multi Session Persistence 测试通过！",
    )
  } else {
    console.log(
      "\n❌ Multi Session Persistence 测试失败",
    )

    process.exitCode = 1
  }
}

main()