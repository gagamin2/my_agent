import "dotenv/config"
import { runAgent } from "./agent/agent.js"
import { readFile } from "./tools/readFile.js"

async function main() {
  // const result = await runAgent(
  //   "简单介绍一下你自己吧。"
  // )

  // const result = await readFile("./src/index.ts")
  const result = await runAgent(
    "请读取 src/index.ts 和 src/agent/agent.ts，然后分别告诉我这两个文件的主要作用"
  )

  console.log(result)
}

main()