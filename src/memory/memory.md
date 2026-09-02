# Memory

## 项目开发语言（已确认）
- 项目使用 **TypeScript** 开发，运行于 **Node.js**
- 采用 **ES Module（ESM）** 模块规范，导入路径使用 `.js` 后缀（NodeNext 风格）
- 依据：`src/index.ts` 文件扩展名为 `.ts`；使用 `import`/`export` 模块语法；导入路径带 `.js` 后缀（`./agent/agent.js`、`./tools/readFile.js`）；使用 `async function main()` + `await` 的现代 TypeScript 异步写法；加载 `dotenv/config` 说明运行于 Node.js

## 项目技术栈
- 语言：TypeScript，运行于 Node.js
- 模块规范：ES Module（ESM），导入路径使用 `.js` 后缀（NodeNext 风格）
- 入口文件：`src/index.ts`
- 入口逻辑：加载 `dotenv/config`，导入并调用 `runAgent` 执行用户指令，将结果打印到控制台
- 核心执行器：`runAgent` 位于 `src/agent/agent.ts`（入口中从 `./agent/agent.js` 导入）
- 自定义工具：`src/tools/readFile.ts`（文件读取）
- 项目类型：Agent 项目

## 入口文件结构（src/index.ts）
- `import "dotenv/config"` 加载环境变量
- `import { runAgent } from "./agent/agent.js"` 导入 Agent 执行器
- `import { readFile } from "./tools/readFile.js"` 导入文件读取工具
- 使用 `async function main()` + `await runAgent(...)` 异步执行，`const` 声明变量，符合现代 TypeScript 风格
- 文件扩展名为 `.ts`，使用 `import`/`export` 模块语法，是典型的 TypeScript ESM 特征