import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import type { Session } from "./session.js"

const sessionPath = path.resolve(
  process.cwd(),
  "src/session/session.json",
)

export async function saveSession(
  session: Session,
): Promise<void> {
  await writeFile(
    sessionPath,
    JSON.stringify(session, null, 2),
    "utf-8",
  )
}

export async function loadSession(): Promise<Session | null> {
  try {
    const content = await readFile(
      sessionPath,
      "utf-8",
    )

    const data = JSON.parse(content)

    return {
      ...data,
      createdAt: new Date(data.createdAt),
    }
  } catch (error) {
    console.log("未找到有效的 Session，将创建新的 Session。")
    return null
  }
}