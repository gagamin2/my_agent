import fs from "node:fs/promises"
import path from "node:path"

export const searchFilesTool = {
  type: "function" as const,
  function: {
    name: "search_files",
    description: "在项目文件中搜索指定文本",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "需要搜索的文本",
        },
        directory: {
          type: "string",
          description: "需要搜索的目录路径",
        },
      },
      required: ["query", "directory"],
    },
  },
}

//递归搜寻所有目录和文件
async function searchDirectory(
  directoryPath: string,
  query: string,
  results: {
    file: string
    line: number
    content: string
  }[],
) {
  const entries = await fs.readdir(
    directoryPath,
    {
      withFileTypes: true,
    },
  )

  for (const entry of entries) {
    const fullPath = path.join(directoryPath,entry.name)

    if (entry.isDirectory()) {
      await searchDirectory(fullPath,query,results)
      continue
    }

    if (!entry.isFile()) {continue}
    await searchFile(fullPath,query,results)
  }
}

//工具入口
export async function searchFiles(
  query: string,
  directory: string,
) {
  try {
    const absolutePath = path.resolve(process.cwd(),directory)

    const results: {
      file: string
      line: number
      content: string
    }[] = []

    await searchDirectory(absolutePath,query,results)

    return {
      success: true,
      results,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    }
  }
}

//在单个文件里面找关键词
async function searchFile(
  filePath: string,
  query: string,
  results: {
    file: string
    line: number
    content: string
  }[],
) {
  try {
    const content = await fs.readFile(
      filePath,
      "utf-8",
    )

    const lines = content.split("\n")

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line?.includes(query)) {
        results.push({
          file: filePath,
          line: i + 1,
          content: line.trim(),
        })
      }
    }
  } catch {
    // 忽略无法读取的文件
  }
}