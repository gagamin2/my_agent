# Memory

## 项目概况
- my_agent：基于 TypeScript + DeepSeek API 的终端交互式 AI Agent 学习项目。
- 项目运行在 Windows 环境（路径如 `D:\my_agent`），执行文件/目录操作时需使用 Windows 命令语法（如 `del` 删除文件、`rd /s /q` 删除目录），`rm` 等 Unix 命令不可用。

## 用户背景
- 用户正在学习 TypeScript 与 Agent 开发。
- 用户自述记忆较差，未来可能希望 Agent 帮助回忆或复述之前的对话内容。

## 关键架构约定
- 主 Agent Loop 最多 10 轮。
- Token 预算 8000，达 80% 时提醒。
- 上下文超 10 条消息时压缩，保留最近 6 条。
- 工具统一返回 `{ success, ... }`，失败不抛异常。
- 工具执行通过 `toolRegistry` 统一分发（工具名 → 实现函数）；工具 schema 在各工具文件中单独定义，由 `agent.ts` 组装成 `tools` 数组。
- safety：死循环检测（工具名+参数指纹，第 2 次警告、第 3 次停止），输出截断恢复最多 3 次；命令安全策略集中在 `src/security/commandPolicy`（`checkCommand`），由 `runCommand` 工具调用，拦截高风险命令（如 git restore 等可能丢弃未提交修改的操作）。
- Memory 由独立 Memory Agent 维护（最多 5 轮），遵循宁缺毋滥原则。
- 模型 deepseek-v4-pro，API 失败自动重试 3 次。

## 操作确认原则
- 查看类操作直接执行（如 git status/diff/log/branch、读取文件、查看目录、搜索代码）。
- 修改/破坏类操作需谨慎，以下操作必须等用户明确确认后才执行：
  - 可能丢弃未提交修改的 Git 操作：git restore、git checkout --、git reset --hard、git clean、git rebase、git push --force、删除分支；
  - 改写 Git 历史的操作（rebase、amend 后强推等）；
  - 删除文件/目录（如 `del`、`rd /s /q`）；
  - 对项目目录之外文件的操作；
  - 安装/卸载依赖、全局安装等影响环境的行为；
  - push 代码到远程仓库（默认不主动 push）。
- 需要确认时：先用只读命令查清状态和实际受影响文件，明确告知影响范围，等用户明确回复（确认/确定/继续/执行）后再执行。
- 常规且安全的操作可直接执行：git add + git commit（只提交用户确认过的文件）、编译/类型检查/测试命令。