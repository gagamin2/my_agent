import "dotenv/config"
import { runAgent } from "./agent/agent.js"
import { readFile } from "./tools/readFile.js"
import { createSession } from "./session/session.js"
import { compressContext } from "./context/contextCompressor.js"
import { createInterface } from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import { loadSession, saveSession,listSessions } from "./session/sessionManager.js"

async function main() {
  // const sessionId = createSession().sessionId
  // const session =(await loadSession(sessionId)) ?? createSession()
  let session = createSession()
  const rl = createInterface({input,output})
  console.log("Agent 已启动，可以开始对话。")
  console.log("输入 exit 退出。")

  while (true) {
    const userInput = await rl.question("你：")
    if (userInput.trim() === "exit") {
      break
    }
    //创建新会话
    if (userInput.trim() === "/new") {
      session = createSession()

      console.log("\n🆕 已创建新的 Session")
      console.log(`Session ID：${session.sessionId}\n`)
      continue
    }
    //加载历史会话
    if (userInput.trim() === "/sessions") {
      const sessions = await listSessions()
      console.log("\n已有 Session：")

      if (sessions.length === 0) {
        console.log("暂无 Session")
        continue
      }

      sessions.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.sessionId}`)
        console.log(`   创建时间：${item.createdAt.toLocaleString()}`)
        console.log(`   消息数量：${item.messages.length}`)
      })

      console.log()
      continue
    }
    //选择会话
    if (userInput.trim().startsWith("/switch ")) {
      const sessionId = userInput.trim().slice("/switch ".length).trim()

      if (!sessionId) {
        console.log("\n用法：/switch <sessionId>\n")
        continue
      }

      const loadedSession = await loadSession(sessionId)

      if (!loadedSession) {
        console.log(`\n❌ 未找到 Session：${sessionId}\n`)
        continue
      }

      session = loadedSession
      console.log(`\n✅ 已切换到 Session：${session.sessionId}`)
      console.log(`消息数量：${session.messages.length}\n`)
      continue
    }
    if (!userInput.trim()) {
      continue
    }
    const result = await runAgent(userInput,session,rl)
    await saveSession(session)//保存会话
    console.log("Agent：")
    console.log(result)
  }
  
  rl.close()

  




  // console.log("Session ID:", session.sessionId)

  // const result1 = await runAgent(
  //   "读取 tests/text.txt，并告诉我里面有什么。",
  //   session,
  // )

  // console.log("第一次结果：")
  // console.log(result1)

  // const result2 = await runAgent(
  //   "刚才那个文件一共有多少行？",
  //   session,
  // )

  // console.log("第二次结果：")
  // console.log(result2)

  // const compressedMessages = await compressContext(session.messages)

  // console.log("压缩前消息数量：", session.messages.length)
  // console.log("压缩后消息数量：", compressedMessages.length)

  // console.dir(compressedMessages, {
  //   depth: null,
  // })
}
  // const result = await runAgent(
  //   "简单介绍一下你自己吧。"
  // )

  // const result = await readFile("./src/index.ts")

  // const result = await runAgent(
  //   // "请读取 src/index.ts 和 src/agent/agent.ts，然后输出对这两个文件的说明，然后把你的见解写入tests/text2.txt,然后再去读这两个文件，再把你新的简介写入。循环往复。"
  //   // "请读取 src/index.ts，然后告诉我你可以使用哪些工具，并把你读到的skill内容发给我。"
  //   // "请分析 src/index.ts"
  //   "请分析 src/index.ts，并告诉我这个项目使用什么语言开发。"
  // )
  //   console.log(result)

  // const result = await runAgent(
  //   "请不断读取 tests/text.txt。",
  // )

  // const memory = await retrieveMemory("测试 Agent 的 Memory")

  // const session = createSession()
  // console.log("Session：")
  // console.log(session)




main()