import { writeFile } from "fs/promises"

export async function writeFileTool(
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