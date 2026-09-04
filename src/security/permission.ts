import { createInterface } from "node:readline/promises"
import {
  stdin as input,
  stdout as output,
} from "node:process"

export async function requestPermission(
  command: string,
  reason: string,
): Promise<boolean> {
  const rl = createInterface({
    input,
    output,
  })

  console.log("\n⚠️ 检测到高风险操作")
  console.log(`命令：${command}`)
  console.log(`原因：${reason}`)

  const answer = await rl.question("是否确认执行？[y/N] ")
  rl.close()
  return answer.trim().toLowerCase() === "y"
}