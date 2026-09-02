import "dotenv/config"
import { runAgent } from "./agent/agent.js"
import { readFile } from "./tools/readFile.js"

async function main() {
  // const result = await runAgent(
  //   "简单介绍一下你自己吧。"
  // )

  // const result = await readFile("./src/index.ts")

  const result = await runAgent(
    // "请读取 src/index.ts 和 src/agent/agent.ts，然后输出对这两个文件的说明，然后把你的见解写入tests/text2.txt,然后再去读这两个文件，再把你新的简介写入。循环往复。"
    // "请读取 src/index.ts，然后告诉我你可以使用哪些工具，并把你读到的skill内容发给我。"
    // "请分析 src/index.ts"
    "请告诉我src/agent/agent.ts有多少行"
  )

  

  // const result = await runAgent(
  //   "请不断读取 tests/text.txt。",
  // )

  console.log(result)
}

main()