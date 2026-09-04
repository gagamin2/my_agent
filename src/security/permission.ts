import type { Interface } from "node:readline/promises"

export async function requestPermission(
  rl: Interface,
  command: string,
  reason: string,
): Promise<boolean> {
  console.log("\n⚠️ 检测到高风险操作")
  console.log(`命令：${command}`)
  console.log(`原因：${reason}`)

  const answer = await rl.question("是否确认执行？[y/N] ",)
  return answer.trim().toLowerCase() === "y"
}