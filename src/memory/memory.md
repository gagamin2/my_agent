# Memory

## 项目开发语言（已确认）
- 项目使用 **TypeScript** 开发，运行于 **Node.js**
- 采用 **ES Module（ESM）** 模块规范，导入路径使用 `.js` 后缀（NodeNext 风格）
- 依据：`src/index.ts` 文件扩展名为 `.ts`；使用 `import`/`export` 模块语法；导入路径带 `.js` 后缀（`./agent/agent.js`、`./tools/readFile.js`）；使用 `async function main()` + `await` 的现代 TypeScript 异步写法；加载 `dotenv/config` 说明运行于 Node.js

## 项目技术栈
- 语言：TypeScript，运行于 Node.js
- 模块规范：ES Module（ESM），导入路径使用 `.js` 后缀（NodeNext 风格）
- 入口文件：`src/index.ts`
- 核心执行器：`runAgent` 位于 `src/agent/agent.ts`（入口中从 `./agent/agent.js` 导入）
- 上下文构建模块：`src/context/context.ts`（提供 `createContext` 与 `addMessage`）
- 自定义工具：`src/tools/readFile.ts`（文件读取）、`writeFileTool`（文件写入）
- 安全函数：`createToolFingerprint`（工具指纹生成）、`checkLoop`（循环检测）
- LLM SDK：OpenAI SDK，使用 DeepSeek 的 OpenAI 兼容接口，API Key 来自环境变量
- 项目类型：Agent 项目

## 入口文件结构（src/index.ts）
- `import "dotenv/config"` 加载环境变量（尤其是 `DEEPSEEK_API_KEY`）
- `import { runAgent } from "./agent/agent.js"` 导入 Agent 执行器
- `import { readFile } from "./tools/readFile.js"` 导入文件读取工具
- 使用 `async function main()` + `await runAgent(...)` 异步执行，`const` 声明变量，符合现代 TypeScript 风格
- main 函数保留了几段注释掉的调用示例（测试纯对话、单独测试读文件、测试循环检测熔断）
- 当前实际生效的指令：让 Agent 读取两个源文件、分析作用并写入 `tests/text.txt`（覆盖旧内容），最后用 `console.log(result)` 输出结果
- 文件末尾直接调用 `main()`
- 小结：`src/index.ts` 相当于「程序入口 + 任务编排器 + 环境初始化器 + 调用示例展示」

## 核心执行器结构（src/agent/agent.ts）
- 是整个 Agent 系统的核心实现文件，定义了一个支持工具调用、多轮循环、安全检测的 LLM Agent
- 依赖导入与配置：引入 OpenAI SDK、`readFile` 与 `writeFileTool` 工具、`createToolFingerprint` 和 `checkLoop` 安全函数，并定义 `MAX_TURNS = 10` 作为保险丝
- 创建 LLM 客户端：使用 DeepSeek 的 OpenAI 兼容接口，API Key 来自环境变量
- 工具声明：以 Function Calling 的 JSON Schema 形式声明了 `read_file` 和 `write_file` 两个工具
- 工具执行器（executeTool）：解析参数并根据工具名分派执行，未知工具名会抛错
- Agent 主循环（runAgent）：最多执行 10 轮，每轮调用模型、处理 `tool_calls`、执行工具并把结果回传，直到模型给出最终答案；具备「最大轮数熔断」和「重复调用检测」双重安全机制
- 小结：`src/agent/agent.ts` 将 LLM 的推理能力与本地文件读写能力连接起来，形成可自主完成「读取文件 → 分析内容 → 写入文件」等任务的智能体

## 上下文构建模块结构（src/context/context.ts）
- 该文件负责构建和管理 LLM Agent 的对话上下文（消息列表），把「系统提示词」「用户输入」「长期 Memory」组装成 OpenAI 兼容的 `ChatCompletionMessageParam[]` 消息数组
- 依赖导入：从 `openai/resources/chat/completions` 导入类型 `ChatCompletionMessageParam`（仅作类型标注使用）
- 导出两个函数：`createContext` 和 `addMessage`
- `createContext(systemPrompt, userInput, memory)`：返回一个初始消息数组，包含两条消息——① `system` 角色消息，内容为 `systemPrompt` 加上一段「以下是 Agent 的长期 Memory：」区块并把 `memory` 拼接进去；② `user` 角色消息，内容为 `userInput`。这是每次启动 Agent 时构造初始上下文的入口函数
- `addMessage(messages, message)`：接收现有的 `messages` 数组和一条新的 `message`，通过 `messages.push(message)` 把新消息追加到上下文末尾，用于在多轮对话/工具调用过程中持续累积上下文
- 执行流程：调用 `createContext` 生成包含「system + user」的初始消息数组 → Agent 主循环中通过 `addMessage` 不断把模型返回的 assistant 消息、工具调用结果等追加进同一数组 → 每次调用 LLM 时把该消息数组作为上下文传入，使模型拥有完整对话历史和长期记忆

## src/context/context.ts 当前源码（已实际读取确认）
```ts
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"

//创建初始上下文
export function createContext(
  systemPrompt: string,
  userInput: string,
  memory: string,
): ChatCompletionMessageParam[] {
  return [
    {
      role: "system",
      content: `${systemPrompt}

以下是 Agent 的长期 Memory：

${memory}`,
    },
    {
      role: "user",
      content: userInput,
    }
  ]
} 

//往context里添加信息。
export function addMessage(
  messages: ChatCompletionMessageParam[],
  message: ChatCompletionMessageParam,
) {
  messages.push(message)
}
```

## 文件读取工具结构（src/tools/readFile.ts）
- 该文件封装了一个**异步读取文件内容的工具函数**，供 Agent 调用，用于读取本地文件并以 UTF-8 编码返回文本内容
- 依赖导入：从 `node:fs/promises` 引入 Node.js 的 Promise 版文件系统模块 `fs`
- 导出函数：`readFile(filePath: string)`，接收一个参数 `filePath`（要读取的文件路径，类型为 `string`），是 `async` 异步函数
- 执行逻辑：使用 `fs.readFile(filePath, "utf-8")` 尝试读取文件内容
  - 成功时返回 `{ success: true, content }`，其中 `content` 是读取到的文件文本内容
  - 失败时通过 `try/catch` 捕获异常，返回 `{ success: false, error }`，其中 `error` 做了类型判断：如果 `error` 是 `Error` 实例就取 `error.message`，否则转成字符串
- 小结：这是一个**安全、带错误处理的文件读取工具**，不会因为读取失败而抛出异常导致程序崩溃，而是统一返回带有 `success` 标志的结果对象，方便 Agent 根据 `success` 判断读取是否成功

## src/tools/readFile.ts 当前源码（已实际读取确认）
```ts
import fs from "node:fs/promises"

export async function readFile(filePath: string) {
  try {
    const content = await fs.readFile(filePath, "utf-8")

    return {
      success: true,
      content,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
```

## tests/text.txt 文件内容（已通过实际读取确认）
- 是一份说明文档，标题为「src/index.ts 与 src/agent/agent.ts 主要作用说明」
- 内容分为两大部分：第一部分说明 `src/index.ts` 的主要作用；第二部分说明 `src/agent/agent.ts` 的主要作用
- 文档结论：`src/index.ts` 是「程序入口 + 任务编排器 + 环境初始化器 + 调用示例展示」；`src/agent/agent.ts` 是 Agent 系统的核心实现，连接 LLM 推理能力与本地文件读写能力
- 第一部分（src/index.ts 的作用）：程序入口文件，负责启动和编排 Agent 执行流程；通过 `import "dotenv/config"` 加载 `.env` 环境变量（尤其是 `DEEPSEEK_API_KEY`）；从 `./agent/agent.js` 导入 `runAgent`、从 `./tools/readFile.js` 导入 `readFile`；main 函数保留了几段注释掉的调用示例（测试纯对话、单独测试读文件、测试循环检测熔断），当前实际生效指令是让 Agent 读取两个源文件、分析作用并写入 `tests/text.txt`（覆盖旧内容），最后用 `console.log(result)` 输出结果；小结为「程序入口 + 任务编排器 + 环境初始化器 + 调用示例展示」
- 第二部分（src/agent/agent.ts 的作用）：Agent 系统核心实现，支持工具调用、多轮循环、安全检测的 LLM Agent；引入 OpenAI SDK、读写工具、`createToolFingerprint` 和 `checkLoop` 安全函数，定义 `MAX_TURNS = 10` 作为保险丝；使用 DeepSeek 的 OpenAI 兼容接口创建 LLM 客户端（API Key 来自环境变量）；以 Function Calling 的 JSON Schema 形式声明 `read_file` 和 `write_file` 两个工具；工具执行器按工具名分派执行，未知工具名抛错；主循环最多执行 10 轮，具备「最大轮数熔断」和「重复调用检测」双重安全机制；小结为连接 LLM 推理能力与本地文件读写能力，可自主完成「读取文件 → 分析内容 → 写入文件」等任务

## tests/text.txt 文件行数（已确认）
- `tests/text.txt` 文件一共有 **96 行**（按文件内容的换行逐行统计的结果，包括空行和分隔线）

## Agent 可用工具范围（已确认）
- Agent 在任务中可用的自定义工具只有 **`read_file`** 和 **`write_file`** 两个，**没有**「写入/修改 Memory」的工具
- 因此 Agent 无法在对话中直接新增、修改或删除长期 Memory；长期 Memory 由独立的 Memory Agent 负责维护，而不是任务执行 Agent 的职责

## 最近任务记录（已确认）
- 任务一：读取 `tests/text.txt` 并复述内容，Agent 已成功读取并复述，内容与上述「tests/text.txt 文件内容」记录一致，未发现内容变更或矛盾，说明该文件自上次写入后未被修改
- 任务二（后续追问）：询问「刚才那个文件一共有多少行？」，Agent 根据此前读取的内容逐行统计，回答 `tests/text.txt` 一共有 **96 行**（包括空行和分隔线），与已确认的行数记录一致，未发现新变更或矛盾
- 任务三：询问「请看看 readFile.ts 文件里的内容，并告诉我主要写了什么」，Agent 已成功读取并说明 `src/tools/readFile.ts` 的主要内容：它是一个异步文件读取工具函数，从 `node:fs/promises` 导入 `fs`，导出 `readFile(filePath: string)`，使用 `fs.readFile(filePath, "utf-8")` 读取文件，成功时返回 `{ success: true, content }`，失败时通过 `try/catch` 捕获并返回 `{ success: false, error }`（Error 实例取 `error.message`，否则转字符串）；小结为安全、带错误处理的文件读取工具，不会因读取失败而抛异常导致程序崩溃。该结果与新增的「文件读取工具结构（src/tools/readFile.ts）」记录一致，未发现矛盾
- 任务四：询问「你刚才在memory里新写的内容是什么？」，Agent 正确澄清：本次任务中它**没有**向 Memory 写入任何新内容，只使用了 `read_file` 读取 `src/tools/readFile.ts`；并说明当前可用工具只有 `read_file` 和 `write_file`，没有「写入 Memory」的工具，因此无法在对话中新增、修改或删除 Memory；系统提示里的长期 Memory 是过去任务保存的历史信息，并非本次写入。Agent 回答准确、自我认知清晰，未发现矛盾
- 任务五（后续追问）：用户质疑「你就是写了啊，我看那个内容有新增的」。Agent 再次如实澄清：本次对话中它没有执行任何「写入 Memory」的操作，也不具备这样的工具能力；它只有 `read_file` 和 `write_file` 两个工具，只能操作磁盘文件，不能修改系统 Memory；本次对话只做了一次 `read_file` 读取 `src/tools/readFile.ts` 的只读操作，不会产生任何写入；用户看到的「新增内容」很可能来自系统提示里的「长期 Memory」和之前对话的历史摘要（其中确实包含一条关于 readFile.ts 的记录），那条记录是更早任务中系统自动沉淀保存的历史摘要，而非本次新写，Agent 是被动接收它而无法主动增删；Agent 还邀请用户贴出认为「新增」的那段内容，以便逐条核对它到底来自旧的历史摘要还是与当前 `readFile.ts` 源码一致。Agent 回答准确、自我认知清晰，未发现矛盾，也未发现任务执行 Agent 实际修改 Memory 的证据
- 任务六（后续追问）：用户回复「可以。」后，Agent 重新读取 `src/tools/readFile.ts` 当前源码并逐条核对，确认源码与历史摘要中的 readFile.ts 记录**完全一致**（导入 `node:fs/promises` 的 `fs`、导出异步函数 `readFile(filePath: string)`、使用 `fs.readFile(filePath, "utf-8")` 读取、`try/catch` 统一返回 `{ success, content }` / `{ success, error }`、错误信息取 `Error.message` 或 `String(error)`），**未发现新增代码行或逻辑变更**；同时再次澄清本次对话没有写入或修改 Memory（当前只有 `read_file` 和 `write_file` 两个工具，读取操作不会触发 Memory 写入），并说明系统给的 Memory 中**没有关于 readFile.ts 的独立条目**，相关信息只存在于之前对话的历史摘要中且与当前源码一致；邀请用户贴出认为「新增」的文字以便逐条核对。该结果与「文件读取工具结构」及「src/tools/readFile.ts 当前源码」记录一致，未发现矛盾
- 任务七：询问「看看context目录下的context.ts文件有哪些内容？」，Agent 指出 `context/context.ts` 这个路径不存在，实际文件位于 `src/context/context.ts`，并成功读取内容：该文件导入 OpenAI SDK 的类型 `ChatCompletionMessageParam`，导出 `createContext` 与 `addMessage` 两个函数——`createContext` 把 systemPrompt、长期 Memory、userInput 组装成 `ChatCompletionMessageParam[]` 初始消息数组（system 消息内容为 systemPrompt +「以下是 Agent 的长期 Memory：」区块拼接 memory，user 消息内容为 userInput）；`addMessage` 通过 `messages.push(message)` 向上下文追加消息。Agent 还说明了执行流程：`createContext` 生成初始上下文 → 主循环中用 `addMessage` 累积 assistant 消息与工具调用结果 → 每次调用 LLM 时把该消息数组作为上下文传入。该结果与新增的「上下文构建模块结构（src/context/context.ts）」及「src/context/context.ts 当前源码」记录一致，未发现矛盾
