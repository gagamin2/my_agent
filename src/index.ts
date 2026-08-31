import "dotenv/config"
import { runAgent } from "./agent/agent.js"
import { readFile } from "./tools/readFile.js"

async function main() {
  // const result = await runAgent(
  //   "简单介绍一下你自己吧。"
  // )

  // const result = await readFile("./src/index.ts")
  const result = await runAgent(
    "请读取 src/index.ts，然后告诉我这个文件主要做了什么"
  )

  console.log(result)
}

main()