import { saveMemory } from "./memoryManager.js"

export const memoryTools = [
  {
    type: "function" as const,
    function: {
      name: "write_memory",
      description: "更新 Agent 的长期 Memory",
      parameters: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "更新后的完整 Memory 内容",
          },
        },
        required: ["content"],
      },
    },
  },
]

//Memory工具执行器
export async function executeMemoryTool(
  name: string,
  argumentsString: string,
) {
  const args = JSON.parse(argumentsString)

  if (name === "write_memory") {
    await saveMemory(args.content)
    console.log("MemoryTool成功调用，Memory更新成功")
    return "Memory 更新成功"
  }
  throw new Error(`Unknown memory tool: ${name}`)
}