export type CommandRisk =
  | "safe"
  | "dangerous"

export interface CommandPolicyResult {
  risk: CommandRisk
  reason?: string
}

const dangerousGitPatterns = [
  {
    pattern: /^git\s+restore\b/,
    reason: "git restore 可能丢弃未提交的文件修改",
  },
  {
    pattern: /^git\s+clean\b/,
    reason: "git clean 可能删除未跟踪文件",
  },
  {
    pattern: /^git\s+reset\s+--hard\b/,
    reason: "git reset --hard 可能丢弃未提交修改并改变 HEAD 状态",
  },
  {
    pattern: /^git\s+checkout\s+--\b/,
    reason: "git checkout -- 可能丢弃文件的未提交修改",
  },
  {
    pattern: /^git\s+rebase\b/,
    reason: "git rebase 会修改 Git 提交历史",
  },
  {
    pattern: /^git\s+push\b.*--force\b/,
    reason: "强制推送可能覆盖远程 Git 历史",
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
    for (const rule of dangerousGitPatterns) {
      if (rule.pattern.test(currentCommand)) {
        return {
          risk: "dangerous",
          reason: rule.reason,
        }
      }
    }
  }

  return {
    risk: "safe",
  }
}