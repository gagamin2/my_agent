import path from "node:path"

// 判断目标路径是否仍然在当前工作区里面
export function isPathInsideWorkspace(
  targetPath: string,
): boolean {
  const workspace = path.resolve(process.cwd())

  const target = path.resolve(
    process.cwd(),
    targetPath,
  )

  return (
    target === workspace ||
    target.startsWith(workspace + path.sep)
  )
}

// 检查目标路径是否位于当前工作区
export function checkPathInsideWorkspace(
  targetPath: string,
): {
  allowed: boolean
  reason?: string
} {
  if (isPathInsideWorkspace(targetPath)) {
    return {
      allowed: true,
    }
  }

  return {
    allowed: false,
    reason: `路径超出 Agent 工作区范围：${targetPath}`,
  }
}

// 从命令中提取可能影响文件系统的路径
export function extractPathsFromCommand(
  command: string,
): string[] {
  const paths: string[] = []

  // 先拆分命令链
  const commands = command
    .split(/&&|[;|]/)
    .map((part) => part.trim())
    .filter(Boolean)

  for (const currentCommand of commands) {
    const parts = currentCommand.split(/\s+/)

    if (parts.length < 2) {
      continue
    }

    const commandName = parts[0]?.toLowerCase()

    // 检查文件删除、移动相关命令
    if (
      commandName === "rm" ||
      commandName === "del" ||
      commandName === "rmdir" ||
      commandName === "mv" ||
      commandName === "move"
    ) {
      paths.push(...parts.slice(1))
    }

    // 检查 Shell 重定向
    for (let i = 0; i < parts.length - 1; i++) {
      if (
        parts[i] === ">" ||
        parts[i] === ">>"
      ) {
        const targetPath = parts[i + 1]

        if (targetPath) {
          paths.push(targetPath)
        }
      }
    }
  }

  return paths
}