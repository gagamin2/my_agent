# Memory

## 项目技术栈
- 语言：TypeScript，运行于 Node.js
- 模块规范：ES Module（ESM），导入路径使用 `.js` 后缀（NodeNext 风格）
- 入口文件：`src/index.ts`
- 入口逻辑：加载 `dotenv/config`，调用 `runAgent` 执行用户指令
- 自定义工具：`src/tools/readFile.ts`（文件读取）
- 项目类型：Agent 项目