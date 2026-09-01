import OpenAI from "openai"
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"
import { readFile } from "../tools/readFile.js"
import { writeFileTool } from "../tools/writeFile.js"
import {createToolFingerprint,checkLoop} from "../safety/loopDetector.js"

const MAX_TURNS = 10//保险丝：最大执行轮数

const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
})

const tools = [
  {
    type: "function" as const,
    function: {
      name: "read_file",
      description: "读取指定文件的内容",
      parameters: {
        type: "object",
        properties: {
          filePath: {
            type: "string",
            description: "需要读取的文件路径",
          },
        },
        required: ["filePath"],
      },
    },
  },

  {
    type: "function" as const,
    function: {
      name: "write_file",
      description: "向指定文件写入内容",
      parameters: {
        type: "object",
        properties: {
          filePath: {
            type: "string",
            description: "需要写入的文件路径",
          },
          content: {
            type: "string",
            description: "需要写入文件的完整内容",
          },
        },
        required: ["filePath", "content"],
      },
    },
  },
]

//工具执行器
async function executeTool(
  name: string,
  argumentsString: string,
) {
  const args = JSON.parse(argumentsString)

  if (name === "read_file") {
    return await readFile(args.filePath)
  }
  if (name === "write_file") {
    return await writeFileTool(args.filePath,args.content)
  }

  throw new Error(`Unknown tool: ${name}`)
}

//Agent入口
export async function runAgent(userInput: string) {
  //用户与模型的对话记录
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: userInput,
    },
  ]

  let i = 0
  while(i < MAX_TURNS){
    i++
    console.log(`\nAgent 第 ${i} 轮：`)
    //首次请求
  const response = await client.chat.completions.create({
    model: "deepseek-v4-pro",
    messages,
    tools,
  })
  //模型返回信息
  const message = response.choices[0]!.message
  messages.push(message)
  console.dir(message, { depth: null })

  if (!message.tool_calls) {
    return message.content
  }else if (message.tool_calls) {
    // const toolCall = message.tool_calls.find(
    //   (call) => call.type === "function",
    // )
    //if (!toolCall) {throw new Error("No function tool call found")}
    
    for (const toolCall of message.tool_calls) {
      if (toolCall.type !== "function") {
      continue
    }//执行所有返回的Toolcall

    const fingerprint = createToolFingerprint(
      toolCall.function.name,
      toolCall.function.arguments,
    )

    const loopStatus = checkLoop(fingerprint)
    console.log("当前Loop status:", loopStatus)

    if (loopStatus === "break") {
      return "Agent 检测到重复工具调用，已停止。"
    }

    const result = await executeTool(
      toolCall.function.name,
      toolCall.function.arguments,
    )

    console.log("Tool result:")
    console.log(result)

    messages.push({
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

  //return message.content
  console.log(`\nAgent 第 ${i} 轮已结束`)
  if (i === MAX_TURNS) {
    return "Agent 达到最大执行轮数，已停止。"
  }
  }
}
}
