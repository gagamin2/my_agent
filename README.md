# TypeScript Agent

基于 **TypeScript + DeepSeek API** 的终端交互式 Agent 学习项目。实现了 Agent Loop、Tool Calling、Session 会话、上下文压缩、长期 Memory（由 Memory Agent 自动维护），并内置多层安全机制防止异常执行。

## 总览

这是一个运行在终端里的文件操作 Agent：你通过自然语言下达任务，它自主决定需要读取还是写入哪些文件，并在多轮对话中保持上下文。

主要能力：

- **文件读写** — 通过 read_file / write_file 工具读取、分析、修改本地文件
- **连续对话** — 同一会话内多轮输入共享上下文，可以直接追问「刚才那个文件里有什么」
- **长期记忆** — 任务结束后 Memory Agent 自动判断哪些信息值得长期保存，下次对话自动带上
- **自我约束** — Token 预算、重复调用检测、截断恢复等机制防止 Agent 失控

一个典型用法：

```text
你：读取 src/index.ts，告诉我这个项目是做什么的
Agent：...（调用 read_file 后给出分析）

你：把分析结果写进 tests/text.txt
Agent：...（调用 write_file 完成写入）
```

## 快速开始

```bash
npm install
```

在项目根目录创建 `.env`（已加入 .gitignore）：

```env
DEEPSEEK_API_KEY=你的Key
```

启动：

```bash
npm run dev
```

终端中直接输入即可与 Agent 对话，输入 `exit` 退出。

## 项目结构

```text
src/
├── index.ts                  # 程序入口：终端交互
├── agent/
│   └── agent.ts              # 主 Agent：Agent Loop 调度中心
├── session/
│   └── session.ts            # Session 会话管理
├── context/
│   ├── context.ts            # 上下文创建与消息追加
│   └── contextCompressor.ts  # 上下文压缩
├── memory/
│   ├── memory.md             # 长期记忆文件
│   ├── memoryManager.ts      # Memory 读写
│   ├── memoryAgent.ts        # Memory Agent
│   └── memoryTool.ts         # write_memory 工具
├── prompt/
│   ├── systemPrompt.ts       # 提示词文案
│   └── promptManager.ts      # 提示词获取接口
├── safety/
│   ├── loopDetector.ts       # 重复调用检测
│   ├── tokenBudget.ts        # Token 预算控制
│   └── truncationRecovery.ts # 输出截断恢复
├── skills/
│   ├── fileAnalysis.md       # 文件分析 Skill
│   ├── memoryManagement.md   # 记忆管理 Skill
│   └── loadSkill.ts          # Skill 加载
└── tools/
    ├── readFile.ts           # read_file 工具
    └── writeFile.ts          # write_file 工具
```

## 模块说明

### Agent

- **agent/agent.ts** — 主 Agent 调度中心。核心是 `runAgent()`：先组装 System Prompt + Skill + Memory 作为初始上下文（同一 Session 内只创建一次），然后进入最多 10 轮的 Agent Loop——每轮调用模型（失败自动重试 3 次，间隔 2 秒），若模型返回 Tool Call 则逐个执行并把结果以 `role: "tool"` 消息回填，若返回纯文本则视为最终答案。每轮还会依次检查截断恢复、Token 预算、循环检测，超限时提前终止。工具执行有 try/catch 保护，工具抛错不会中断主流程，而是把错误作为 Tool Result 回传给模型。
- **session/session.ts** — 会话状态（sessionId、messages、createdAt），同一 Session 内多轮对话共享上下文。

### Context

- **context/context.ts** — `createContext()` 创建初始上下文（System Prompt + Memory + 用户输入），`addMessage()` 向会话追加消息。
- **context/contextCompressor.ts** — 消息超过 10 条时压缩：旧消息交给模型生成中文摘要，保留最近 6 条。压缩前会剥离 reasoning_content 字段，并保证 tool 消息不脱离对应的 assistant.tool_calls；压缩失败或结果包含非法 Tool 消息时回退原始上下文。

### Memory

- **memory/memoryManager.ts** — 基于 `src/memory/memory.md` 的 `loadMemory()` / `saveMemory()`。
- **memory/memoryAgent.ts** — 独立的 Memory Agent（最多 5 轮）。主 Agent 完成任务后，把任务、执行结果、当前 Memory、记忆管理 Skill 一起交给它，由它判断结果中是否有值得长期保存的信息，并调用 write_memory 工具更新 Memory，遵循「宁缺毋滥」原则。
- **memory/memoryTool.ts** — `write_memory` 工具的定义与执行，整体重写 Memory 文件。

### Prompt & Skill

- **prompt/systemPrompt.ts** — 系统提示词 + 循环警告 + Token 警告文案。系统提示词定义 Agent 身份、工具使用规则，以及 Memory 参考原则（Memory 不一定正确，与当前事实冲突时以当前事实为准）。
- **prompt/promptManager.ts** — 统一的 Prompt 获取接口，其他模块不直接操作 Prompt 文本。
- **skills/** — Skill 用 Markdown 描述某类任务的工作方法（fileAnalysis.md、memoryManagement.md），主 Agent 启动时通过 loadSkill 加载并注入 System Prompt，与「Agent 是谁」解耦。

### Tools

- **tools/readFile.ts / writeFile.ts** — `read_file` / `write_file` 工具实现。统一返回 `{ success, ... }` 结果对象，失败不抛异常，由 Agent 根据结果决定下一步。

### Safety

- **safety/loopDetector.ts** — 以「工具名 + 参数」生成指纹，同一指纹重复调用第 2 次发警告、第 3 次直接终止。
- **safety/tokenBudget.ts** — 8000 tokens 预算，消耗到 80% 时注入提醒让模型收尾，超预算停止。
- **safety/truncationRecovery.ts** — `finish_reason === "length"` 时注入提示重新请求，最多恢复 3 次，超限放弃。

## 历史版本记录

### 2026-09-03 — 打磨与收尾

- 上下文压缩经过三轮优化（`57da050`、`b8cbc63`、`ce15ce0`）：完善 tool 消息保留逻辑、剥离 reasoning_content、压缩失败自动回退，并清除了调试日志。
- 增加 Tool 异常保护（`88a9d3e`）：工具执行异常不再中断 Agent 流程，错误作为 Tool Result 回传给模型。
- 优化记忆管理（`ce15ce0`）：精简 Memory 文件内容，完善记忆管理 Skill。

### 2026-09-02 — 上下文压缩、Session、Memory Agent

- 新增终端交互输出（`0619c6c`）：index.ts 用 readline 实现循环对话，输入 exit 退出。
- 新增 Session（`4b0544b`）：多轮对话共享上下文。
- 上下文压缩从初步实现（`44f81f6`）到接入主 Agent 流程（`be5dfb9`）。
- Memory 从零搭起：独立上下文管理（`ca99b08`）→ Memory 模块（`1c40f5b`）→ 写入功能（`536f68f`）→ Memory Agent 自动更新长期记忆（`20a40a7`）→ Memory Tool 并统一消息管理（`c8e4419`）。
- 提取 Agent Skill，增加 API 失败重试机制（`f408a14`）。

### 2026-09-01 — Agent Loop 成型与安全机制

- 增加 while 循环（`e904ce9`）与多 ToolCall 处理（`ba51867`），Agent Loop 基本成型。
- 增加四道保险丝：最大循环轮数（`a2170db`）、死循环检测（`9d0fe49`）、Token 预算（`57aa1e2`）、截断恢复（`1e13b28`）。
- 安全状态从全局改为局部管理（`317c593`）。
- 增加 write_file 工具（`b06ded4`）、提示词管理（`57ddcf0`）、Skill 加载与注入（`c18a96d`）。

### 2026-08-31 — Tool Calling 起步

- 初始化 Agent 并接入 DeepSeek 模型（`666e5d1`）。
- 增加 read_file 工具（`23b4be3`），完成 Tool Result 回传与二次调用（`3973cbe`），Agent 能读取并说明文件内容。

### 2026-08-28

- 项目初始化（`2527d04`）。
