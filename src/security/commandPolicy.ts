export type CommandRisk =
  | "safe"
  | "confirm"
  | "blocked"

export interface CommandPolicyResult {
  risk: CommandRisk
  reason?: string
}

const blockedPatterns = [
  {
    pattern: /^format\b/i,
    reason: "format 可能格式化磁盘并导致严重数据丢失",
  },
]

const confirmPatterns = [
  {
    pattern: /^git\s+restore\b/i,
    reason: "git restore 可能丢弃未提交的文件修改",
  },
  {
    pattern: /^git\s+clean\b/i,
    reason: "git clean 可能删除未跟踪文件",
  },
  {
    pattern: /^git\s+reset\s+--hard\b/i,
    reason: "git reset --hard 可能丢弃未提交修改并改变 HEAD 状态",
  },
  {
    pattern: /^git\s+checkout\s+--\b/i,
    reason: "git checkout -- 可能丢弃文件的未提交修改",
  },
  {
    pattern: /^git\s+rebase\b/i,
    reason: "git rebase 会修改 Git 提交历史",
  },
  {
    pattern: /^git\s+push\b.*--force\b/i,
    reason: "强制推送可能覆盖远程 Git 历史",
  },
  {
    pattern: /^rm\s+/i,
    reason: "rm 可能删除文件或目录",
  },
  {
    pattern: /^del\s+/i,
    reason: "del 可能删除文件",
  },
  {
    pattern: /^rmdir\s+/i,
    reason: "rmdir 可能删除目录",
  },
  {
    pattern: /^mv\s+/i,
    reason: "mv 可能移动或覆盖文件",
  },
  {
    pattern: /^move\s+/i,
    reason: "move 可能移动或覆盖文件",
  },
]

function splitCommand(command: string): string[] {
  return command
    .split(/&&|[;|]/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function checkCommand(
  command: string,
): CommandPolicyResult {
  const commands = splitCommand(command)

  for (const currentCommand of commands) {
    for (const rule of blockedPatterns) {
      if (rule.pattern.test(currentCommand)) {
        return {
          risk: "blocked",
          reason: rule.reason,
        }
      }
    }

    for (const rule of confirmPatterns) {
      if (rule.pattern.test(currentCommand)) {
        return {
          risk: "confirm",
          reason: rule.reason,
        }
      }
    }
  }

  return {
    risk: "safe",
  }
}