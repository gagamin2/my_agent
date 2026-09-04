import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import type { Session } from "./session.js"

//存放Session的目录
const sessionsDir = path.resolve(
  process.cwd(),
  "src/session/sessions",
)

//根据Session ID找到对应文件。
function getSessionPath(sessionId: string): string {
  return path.join(
    sessionsDir,
    `${sessionId}.json`,
  )
}

export async function saveSession(
  session: Session,
): Promise<void> {
  await mkdir(sessionsDir, {
    recursive: true,
  })

  const sessionPath =
    getSessionPath(session.sessionId)

  await writeFile(
    sessionPath,
    JSON.stringify(session, null, 2),
    "utf-8",
  )
}

export async function loadSession(
  sessionId: string,
): Promise<Session | null> {
  try {
    const sessionPath =
      getSessionPath(sessionId)

    const content =
      await readFile(
        sessionPath,
        "utf-8",
      )

    const data = JSON.parse(content)

    return {
      ...data,
      createdAt: new Date(
        data.createdAt,
      ),
    }
  } catch (error) {
    console.log(
      `未找到 Session：${sessionId}`,
    )

    return null
  }
}