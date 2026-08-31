import fs from "node:fs/promises"

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