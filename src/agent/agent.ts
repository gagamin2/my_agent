import OpenAI from "openai"
import { readFile } from "../tools/readFile.js"

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

  throw new Error(`Unknown tool: ${name}`)
}

export async function runAgent(userInput: string) {
  const response = await client.chat.completions.create({
    model: "deepseek-v4-pro",
    messages: [
      {
        role: "user",
        content: userInput,
      },
    ],
    tools,
  })

  const message = response.choices[0]!.message
  console.dir(message, { depth: null })

  if (message.tool_calls) {
    const toolCall = message.tool_calls.find(
      (call) => call.type === "function",
    )

    if (!toolCall) {
      throw new Error("No function tool call found")
    }

    const result = await executeTool(
      toolCall.function.name,
      toolCall.function.arguments,
    )

    console.log("Tool result:")
    console.log(result)

    return result
  }

  return message.content
}