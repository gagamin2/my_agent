# Memory

## 项目概况
- my_agent：基于 TypeScript + DeepSeek API 的终端交互式 AI Agent 学习项目。
- 项目运行在 Windows 环境（路径如 `D:\my_agent`），执行文件/目录操作时需使用 Windows 命令语法（如 `del` 删除文件、`rd /s /q` 删除目录），`rm` 等 Unix 命令不可用。

## 关键架构约定
- 主 Agent Loop 最多 10 轮。
- Token 预算 8000，达 80% 时提醒。
- 上下文超 10 条消息时压缩，保留最近 6 条。
- 工具统一返回 `{ success, ... }`，失败不抛异常。
- 工具执行通过 `toolRegistry` 统一分发（工具名 → 实现函数）；工具 schema 在各工具文件中单独定义，由 `agent.ts` 组装成 `tools` 数组。
- safety：死循环检测（工具名+参数指纹，第 2 次警告、第 3 次停止），输出截断恢复最多 3 次；命令安全策略集中在 `src/security/commandPolicy`（`checkCommand`），由 `runCommand` 工具调用，拦截高风险命令（如 git restore 等可能丢弃未提交修改的操作）。
- Memory 由独立 Memory Agent 维护（最多 5 轮），遵循宁缺毋滥原则。
- 模型 deepseek-v4-pro，API 失败自动重试 3 次。