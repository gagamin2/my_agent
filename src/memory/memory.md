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

## tests/text.txt 文件内容（已通过实际读取确认）
- 是一份说明文档，标题为「src/index.ts 与 src/agent/agent.ts 主要作用说明」
- 内容分为两大部分：第一部分说明 `src/index.ts` 的主要作用；第二部分说明 `src/agent/agent.ts` 的主要作用
- 文档结论：`src/index.ts` 是「程序入口 + 任务编排器 + 环境初始化器 + 调用示例展示」；`src/agent/agent.ts` 是 Agent 系统的核心实现，连接 LLM 推理能力与本地文件读写能力
- 第一部分（src/index.ts 的作用）：程序入口文件，负责启动和编排 Agent 执行流程；通过 `import "dotenv/config"` 加载 `.env` 环境变量（尤其是 `DEEPSEEK_API_KEY`）；从 `./agent/agent.js` 导入 `runAgent`、从 `./tools/readFile.js` 导入 `readFile`；main 函数保留了几段注释掉的调用示例（测试纯对话、单独测试读文件、测试循环检测熔断），当前实际生效指令是让 Agent 读取两个源文件、分析作用并写入 `tests/text.txt`（覆盖旧内容），最后用 `console.log(result)` 输出结果；小结为「程序入口 + 任务编排器 + 环境初始化器 + 调用示例展示」
- 第二部分（src/agent/agent.ts 的作用）：Agent 系统核心实现，支持工具调用、多轮循环、安全检测的 LLM Agent；引入 OpenAI SDK、读写工具、`createToolFingerprint` 和 `checkLoop` 安全函数，定义 `MAX_TURNS = 10` 作为保险丝；使用 DeepSeek 的 OpenAI 兼容接口创建 LLM 客户端（API Key 来自环境变量）；以 Function Calling 的 JSON Schema 形式声明 `read_file` 和 `write_file` 两个工具；工具执行器按工具名分派执行，未知工具名抛错；主循环最多执行 10 轮，具备「最大轮数熔断」和「重复调用检测」双重安全机制；小结为连接 LLM 推理能力与本地文件读写能力，可自主完成「读取文件 → 分析内容 → 写入文件」等任务

## tests/text.txt 文件行数（已确认）
- `tests/text.txt` 文件一共有 **96 行**（按文件内容的换行逐行统计的结果，包括空行和分隔线）