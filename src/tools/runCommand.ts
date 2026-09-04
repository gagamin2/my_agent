import { exec } from "node:child_process"
import { checkCommand } from "../security/commandPolicy.js"
import { requestPermission } from "../security/permission.js"

export const runCommandTool = {
  type: "function" as const,
  function: {
    name: "run_command",
    description: "执行项目中的命令，并返回命令执行结果",
    parameters: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "需要执行的命令",
        },
      },
      required: ["command"],
    },
  },
}

export async function runCommand(
  command: string,
) {
  const policyResult = checkCommand(command)

  if (policyResult.risk === "blocked") {
    return {
      success: false,
      blocked: true,
      reason:
        policyResult.reason ??
        "该命令被安全策略禁止",
      stdout: "",
      stderr: "",
      exitCode: null,
    }
  }

  // 危险操作询问用户
  if (policyResult.risk === "confirm") {
    const allowed = await requestPermission(
      command,
      policyResult.reason ??
        "该命令存在潜在风险",
    )

    if (!allowed) {
      return {
        success: false,
        blocked: true,
        reason: "用户拒绝执行该命令",
        stdout: "",
        stderr: "",
        exitCode: null,
      }
    }
  }

  return await new Promise<{
    success: boolean
    blocked?: boolean
    reason?: string
    stdout: string
    stderr: string
    exitCode: number | null
  }>((resolve) => {
    exec(
      command,
      {
        cwd: process.cwd(),
        timeout: 30_000,
      },
      (error, stdout, stderr) => {
        resolve({
          success: !error,
          stdout,
          stderr,
          exitCode:
            error?.code !== undefined
              ? Number(error.code)
              : 0,
        })
      },
    )
  })
}