# Memory

## 项目概况
- my_agent：基于 TypeScript + DeepSeek API 的终端交互式 AI Agent 学习项目。

## 关键架构约定
- 主 Agent Loop 最多 10 轮。
- Token 预算 8000，达 80% 时提醒。
- 上下文超 10 条消息时压缩，保留最近 6 条。
- 工具统一返回 `{ success, ... }`，失败不抛异常。
- safety：死循环检测（工具名+参数指纹，第 2 次警告、第 3 次停止），输出截断恢复最多 3 次。
- Memory 由独立 Memory Agent 维护（最多 5 轮），遵循宁缺毋滥原则。
- 模型 deepseek-v4-pro，API 失败自动重试 3 次。
