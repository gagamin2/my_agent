import { readdir } from "node:fs/promises"
import path from "node:path"

export const listFilesTool = {
  type: "function" as const,
  function: {
    name: "list_files",
    description: "查看指定目录下的文件和文件夹",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "要查看的目录路径",
        },
      },
      required: ["path"],
    },
  },
}

export async function executeListFiles(
  directoryPath: string,
): Promise<string> {
  try {
    //转换绝对路径
    const absolutePath = path.resolve(process.cwd(), directoryPath)
    const entries = await readdir(absolutePath, {
      withFileTypes: true,
    })

    return entries
      .map((entry) => {
        return entry.isDirectory()
          ? `${entry.name}/`
          : entry.name
      })
      .join("\n")
}catch (error) {
    console.error("读取目录失败:", error)
    return `无法读取目录：${directoryPath}`
  }
}