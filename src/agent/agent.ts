import OpenAI from "openai"
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"
import {createToolFingerprint,checkLoop} from "../safety/loopDetector.js"
import { checkBudget } from "../safety/tokenBudget.js"
import { handleTruncation } from "../safety/truncationRecovery.js"
import {getSystemPrompt,getLoopWarningPrompt,getTokenWarningPrompt} from "../prompt/promptManager.js"
import { loadSkill } from "../skills/loadSkill.js"
import {createContext,addMessage} from "../context/context.js"
import { loadMemory } from "../memory/memoryManager.js"
// import { updateMemory } from "../memory/memoryUpdater.js"
import { runMemoryAgent } from "../memory/memoryAgent.js"
import type { Session } from "../session/session.js"
import { compressContext } from "../context/contextCompressor.js"
import { readFileTool } from "../tools/readFile.js"
import { writeFileTool } from "../tools/writeFile.js"
import { listFilesTool } from "../tools/listFiles.js"
import { searchFilesTool } from "../tools/searchFiles.js"
import { toolRegistry } from "../tools/toolRegistry.js"
import { runCommandTool } from "../tools/runCommand.js"

const MAX_TURNS = 10//保险丝：最大执行轮数

const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
})

const tools = [readFileTool,writeFileTool,listFilesTool, searchFilesTool,runCommandTool]
//工具执行器
async function executeTool(
  name: string,
  argumentsString: string,
) {
  const args = JSON.parse(argumentsString)
  const tool = toolRegistry[name as keyof typeof toolRegistry]

  if (!tool) {
    throw new Error(`Unknown tool: ${name}`)
  }
  return await tool(args)
}

//模型api重试函数
async function createChatCompletion(
  messages: ChatCompletionMessageParam[],
) {
  const MAX_RETRIES = 3
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await client.chat.completions.create({
        model: "deepseek-v4-pro",
        messages,
        tools,
      })
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        throw error
      }
      console.log(
        `模型请求失败，第 ${attempt} 次重试...`,
      )
      await new Promise((resolve) =>setTimeout(resolve, 2000))
    }
  }
  throw new Error("模型请求失败")
}

//Agent入口
export async function runAgent(userInput: string,session: Session) {
  const analysisSkill = await loadSkill("./src/skills/fileAnalysis.md")
  const debuggingSkill = await loadSkill("./src/skills/debugging.md")
  // console.log(skill)

  // 读取长期 Memory
  const memory = await loadMemory()
  //console.log("当前 Memory：")
  //console.log(memory)

  const systemPrompt = `${getSystemPrompt()}
当前可用 Code Analysis Skill：
${analysisSkill.content}

当前可用 Debugging Skill：
${debuggingSkill.content}`

  //用户与模型的对话记录（后面使用同一Session时不重新创建Context）
  if (session.messages.length === 0) {
    session.messages = createContext(systemPrompt,userInput,memory)
  } else {
    addMessage(session.messages, {
      role: "user",
      content: userInput,
    })
  }

  let i = 0
  let totalOutput =0
  let recoveryCount = 0
  const toolHistory = new Map<string, number>()
  while(i < MAX_TURNS){
    i++
    console.log(`\nAgent 第 ${i} 轮：`)
    //压缩上下文（下一次发送给模型之前）
  session.messages = await compressContext(session.messages)
    //首次请求
  const response = await createChatCompletion(session.messages)
  //模型返回信息
  const message = response.choices[0]!.message

  //检查截断原因并做出相关反应
  const finishReason = response.choices[0]?.finish_reason
  if (finishReason === "length") {
    const recoveryResult = handleTruncation(session.messages,recoveryCount)
    recoveryCount = recoveryResult.recoveryCount

    if (recoveryResult.status === "give_up") {
      return "Agent 输出多次被截断，已停止。"
    }
    continue
  }

  addMessage(session.messages, {
    ...message,
    content: message.content ?? "",
  })
  //console.log("模型回复：", message.content)
  //console.dir(message, { depth: null })
  // console.log(
  //   "工具调用：",
  //   message.tool_calls
  //     ?.filter((tool) => tool.type === "function")
  //     .map((tool) => ({
  //       name: tool.function.name,
  //       arguments: tool.function.arguments,
  //     })),
  // )

  //Token开销检察
  const outputTokens = response.usage?.completion_tokens ?? 0
  const budgetResult = checkBudget(outputTokens,totalOutput)
  totalOutput = budgetResult.totalOutput
  if (budgetResult.status === "stop") {
    return "Agent Token 预算已耗尽，已停止。"
  }
  //Token消耗接近预算时警告
  let tokenWarning = false
  if (budgetResult.status === "nudge") {
    tokenWarning = true
  }
  
  if (!message.tool_calls) {
    const result = message.content ?? ""
    await runMemoryAgent(userInput, result)//得到最终答案时保存memory
    return result
  }else if (message.tool_calls) {
    // const toolCall = message.tool_calls.find(
    //   (call) => call.type === "function",
    // )
    //if (!toolCall) {throw new Error("No function tool call found")}
    
    let loopWarning = false
    for (const toolCall of message.tool_calls) {
      if (toolCall.type !== "function") {
      continue
    }//执行所有返回的Toolcall
    console.log(
      `Agent 调用工具：${toolCall.function.name}`,
    )
    console.log(
      `工具参数：${toolCall.function.arguments}`,
    )

    //生成指纹，并检查是否有重复调用
    const fingerprint = createToolFingerprint(
      toolCall.function.name,
      toolCall.function.arguments,
    )
    const loopStatus = checkLoop(fingerprint,toolHistory)
    // console.log("当前Loop status:", loopStatus)
    if (loopStatus === "break") {
      return "Agent 检测到重复工具调用，已停止。"
    }
    //两次重复调用时警告
    if (loopStatus === "warn") {
      loopWarning = true
      // messages.push({
      //   role: "system",
      //   content: "检测到你正在重复调用相同的工具，请检查当前任务是否陷入循环，并尝试改变执行策略。"
      // })
    }

    let result
    try {
    result = await executeTool(
      toolCall.function.name,
      toolCall.function.arguments,
    )
    // console.log("Tool result:")
    // console.log(result)
    }catch(error){
      result = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
}

    addMessage(session.messages, {
      role: "tool",
      tool_call_id: toolCall.id,
      content: JSON.stringify(result),
    })//Tool Result 加入对话历史

    // //第二次调用模型
    // const secondResponse = await client.chat.completions.create({
    //   model: "deepseek-v4-pro",
    //   messages,
    //   tools,
    // })
    // const secondMessage = secondResponse.choices[0]!.message
    // console.dir(secondMessage, { depth: null })
    // return secondMessage.content

  }

  if (loopWarning) {
    addMessage(session.messages, {
      role: "system",
      content: getLoopWarningPrompt(),
    })
    console.log("检测到重复调用相同工具，已发送提醒。")
  }
  if (tokenWarning) {
    addMessage(session.messages, {
      role: "system",
      content: getTokenWarningPrompt(),
    })
   console.log("检测到Token预算即将耗尽，已发送提醒。")
  }
  //return message.content
  console.log(`\nAgent 第 ${i} 轮已结束`)
  if (i === MAX_TURNS) {
    return "Agent 达到最大执行轮数，已停止。"
  }
  }
}
}
