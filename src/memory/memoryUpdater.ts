import OpenAI from "openai"
import { loadMemory, saveMemory } from "./memoryManager.js"

const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
})

//更新 Memory
export async function updateMemory(task: string, result: string) {
  //读取旧memory
  const currentMemory = await loadMemory()

  const response = await client.chat.completions.create({
    model: "deepseek-v4-pro",
    messages: [
      {
        role: "system",
        content: `
你负责维护 Agent 的长期 Memory。

你的任务是根据当前任务和执行结果，判断是否有值得长期保存的信息。

只有满足以下条件的信息才应该保存：

1. 对未来任务有帮助
2. 不容易从代码、配置或文档中直接推导出来
3. 具有长期价值
4. 不属于一次性、临时性的执行信息

如果没有值得保存的信息，则保持 Memory 不变。

如果有值得保存的信息：
- 保留已有的重要 Memory
- 添加新的重要信息
- 删除已经明显过时或错误的信息
- 避免重复
- 保持 Markdown 格式
- 不要添加解释，只返回完整的 Memory 内容

当前 Memory：

${currentMemory}
        `,
      },
      {
        role: "user",
        content: `
当前任务：

${task}

Agent 执行结果：

${result}
        `,
      },
    ],
  })

  const newMemory = response.choices[0]?.message.content

  if (!newMemory) {
    console.log("Memory 没有需要更新的内容")
    return
  }

  await saveMemory(newMemory)

  console.log("Memory 已更新")
}