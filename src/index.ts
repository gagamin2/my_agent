import "dotenv/config"
import { runAgent } from "./agent/agent"

async function main() {
  const result = await runAgent(
    "简单介绍一下你自己吧。"
  )

  console.log(result)
}

main()