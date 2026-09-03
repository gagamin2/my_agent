import { exec } from "node:child_process"

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
  return await new Promise<{
    success: boolean
    stdout: string
    stderr: string
    exitCode: number | null
  }>((resolve) => {
    exec(
      command,
      {
        cwd: process.cwd(),//工作目录
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