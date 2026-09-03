import fs from "node:fs/promises"

export const readFileTool = {
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
}

export async function readFile(filePath: string) {
  try {
    const content = await fs.readFile(filePath, "utf-8")

    return {
      success: true,
      content,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}