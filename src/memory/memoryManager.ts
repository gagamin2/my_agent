import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const memoryPath = path.resolve(process.cwd(), "src/memory/memory.md")

//读取memory
export async function loadMemory(): Promise<string> {
  try {
    return await readFile(memoryPath, "utf-8")
  } catch (error) {
    console.error("读取 Memory 失败:", error)
    return ""
  }
}

//保存memory
export async function saveMemory(content: string): Promise<void> {
  try {
    await writeFile(memoryPath, content, "utf-8")
  } catch (error) {
    console.error("保存 Memory 失败:", error)
  }
}
