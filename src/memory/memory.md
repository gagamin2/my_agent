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
- 技能加载模块：`src/skills/loadskill.ts`（Skill 加载工具）
- 安全模块：`src/safety/loopDetector.ts`（循环检测）、`src/safety/tokenBudget.ts`（Token 预算）、`src/safety/truncationRecovery.ts`（截断恢复）
- 提示词模块：`src/prompt/promptManager.ts`（提示词管理）、`src/prompt/systemPrompt.ts`（系统提示词定义）
- LLM SDK：OpenAI SDK，使用 DeepSeek 的 OpenAI 兼容接口，API Key 来自环境变量
- 项目类型：Agent 项目

## 项目根目录（已确认）
- 项目根目录为 **`D:\my_agent`**
- 依据：Agent 尝试读取文件时使用的绝对路径为 `D:\my_agent\abc.ts` 和 `D:\my_agent\src\abc.ts`

## abc.ts 文件不存在（已确认）
- 项目中没有 `abc.ts` 这个文件
- Agent 曾尝试读取以下两个位置，均返回「文件不存在」：
  - `D:\my_agent\abc.ts`
  - `D:\my_agent\src\abc.ts`
- 用户曾询问 `abc.ts` 的用途，Agent 未能找到该文件，已向用户请求提供完整路径（如 `src/xxx/abc.ts`）

## abcyyy.ts 文件不存在（已确认）
- 项目中没有 `abcyyy.ts` 这个文件
- Agent 曾尝试读取以下两个位置，均返回「文件不存在」：
  - `D:\my_agent\abcyyy.ts`
  - `D:\my_agent\src\abcyyy.ts`
- 用户曾询问 `abcyyy.ts` 主要是什么内容，Agent 未能找到该文件，已向用户请求提供完整路径（例如 `src/xxx/abcyyy.ts`）或确认文件名是否拼写正确（如是否位于某个子目录下）

## 技能加载模块 loadSkill.ts（已确认内容）
- `src/skills/loadskill.ts` 导出异步函数 `loadSkill(skillPath: string)`，接收 Skill 文件路径，内部调用并 `await` `readFile(skillPath)`，返回读取到的文件内容
- 它从 `../tools/readFile.js` 导入 `readFile` 工具函数
- 本质：`loadSkill` 是对 `readFile` 工具的轻量语义化封装，专门用于「加载技能（Skill）」场景，方便其他模块以更直观的方式调用

## "保险丝"（熔断）机制实现（已确认）
项目中"保险丝"并非单一模块，而是一组分布在 `src/agent`、`src/safety`、`src/prompt` 中的多层安全熔断体系，用于防止 Agent 无限运行、浪费资源或陷入循环。

### 1. 核心保险丝：最大执行轮数
- 位置：`src/agent/agent.ts`
- `const MAX_TURNS = 10 // 保险丝：最大执行轮数`
- `runAgent` 主循环最多执行 10 轮，达到上限即停止，返回"Agent 达到最大执行轮数，已停止。"
- 这是项目中唯一被显式注释为"保险丝"的机制。

### 2. Token 预算保险丝（已确认实现细节）
- 位置：`src/safety/tokenBudget.ts`
- 常量：`const TOKEN_BUDGET = 8000`（预算上限）、`const NUDGE = 0.8`（提醒阈值 80%）
- 函数签名：`export function checkBudget(outputTokens: number, totalOutput: number)`
- 工作机制：
  - 每次把本次消耗的 `outputTokens` 累加到 `totalOutput` 上（函数内部 `totalOutput += outputTokens`）
  - 累计值 `>= 8000` → 返回 `{ status: "stop", totalOutput }`（熔断，停止执行）
  - 累计值 `>= 6400`（80%）且 `< 8000` → 返回 `{ status: "nudge", totalOutput }`（提醒尽快结束）
  - 其余情况 → 返回 `{ status: "ok", totalOutput }`（正常继续）
  - 返回值为对象 `{ status, totalOutput }`，而非仅状态字符串
- 对应提醒提示词（`src/prompt/systemPrompt.ts`）："Token预算即将耗尽。请减少不必要的工具调用，尽快完成当前任务。"
- 一句话概括：**超 8000 停、到 6400 提醒、否则放行**

### 3. 循环检测保险丝
- 位置：`src/safety/loopDetector.ts`
- `createToolFingerprint(name, argumentsString)` 生成工具调用指纹 `${name}:${argumentsString}`
- `checkLoop(fingerprint, toolHistory)` 判定：
  - 同一指纹重复 2 次 → `warn`（警告）
  - 同一指纹重复 3 次及以上 → `break`（终止循环）
- 对应警告提示词："检测到你正在重复调用相同的工具。请检查当前任务是否陷入循环，并尝试改变执行策略。"

### 4. 截断恢复保险丝
- 位置：`src/safety/truncationRecovery.ts`
- `const MAX_RECOVERY = 3`（允许最多截断恢复次数）
- `handleTruncation(messages, recoveryCount)`：
  - 每次被截断后 `recoveryCount++`
  - 达到 3 次后返回 `give_up`（放弃）
  - 未达上限时向消息中注入提示，引导模型"从断点继续 / 精简输出"，返回 `retry`

### 5. 模型请求重试
- 在 `src/agent/agent.ts` 中，模型请求失败时最多重试 3 次，属于轻量级熔断保护。

### 保险丝协作关系
```
Agent 主循环 (runAgent)
├─ MAX_TURNS = 10           ← 总轮数熔断
├─ Token 预算检查            ← 资源熔断（nudge → stop）
├─ 循环检测                 ← 行为熔断（warn → break）
├─ 截断恢复（最多 3 次）      ← 异常熔断（retry → give_up）
└─ 请求重试（最多 3 次）      ← 网络异常熔断
```

## 历史问答（已确认）
- 用户曾询问「不要看源码，但是简要给我讲讲这个项目中Token预算保险丝是怎么实现的」
- Agent 基于既有 Memory 内容回答（未读取源码），答案与 Memory 中「Token 预算保险丝」条目一致
- 本次问答未产生新的源码事实，仅验证了已有 Memory 中 Token 预算保险丝描述的准确性
