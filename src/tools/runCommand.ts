import { exec } from "node:child_process"
// import path from "node:path"
import type { Interface } from "node:readline/promises"
import { checkCommand } from "../security/commandPolicy.js"
import { requestPermission } from "../security/permission.js"
import {checkPathInsideWorkspace,extractPathsFromCommand} from "../security/workspace.js"

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
  rl: Interface,
) {
  // 第一步：检查命令本身的风险等级
  const policyResult = checkCommand(command)

  // 第二步：检查命令中的路径是否超出工作区
  const paths = extractPathsFromCommand(command)

  for (const targetPath of paths) {
    const pathResult =
      checkPathInsideWorkspace(targetPath)

    if (!pathResult.allowed) {
      return {
        success: false,
        blocked: true,
        reason: pathResult.reason,
        stdout: "",
        stderr: "",
        exitCode: null,
      }
    }
  }

  // 第三步：禁止执行高风险命令
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

  // 第四步：高风险操作需要用户确认
  if (policyResult.risk === "confirm") {
    const allowed = await requestPermission(
      rl,
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

  // 第五步：执行命令
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