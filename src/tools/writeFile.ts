import { writeFile } from "fs/promises"

export const writeFileTool = {
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
}

export async function WriteFile(
  filePath: string,
  content: string,
) {
  try {
    //将content写进filePath指向的文件
    await writeFile(filePath, content, "utf-8")

    return {
      success: true,
      message: `文件 ${filePath} 写入成功`,
    }
  } catch (error) {
    return {
      success: false,
      message: `文件写入失败`,
      error: String(error),
    }
  }
}