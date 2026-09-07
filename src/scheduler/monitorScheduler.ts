import { startScheduler } from "./scheduler.js"
import { runSkillMonitor } from "../community/skillMonitor.js"

const INTERVAL_MS = 60 * 60 * 1000//1小时监控一次
// const INTERVAL_MS =10000//10秒监控一次

console.log("SkillHub 自动监控 Scheduler 已启动")
console.log(`监控间隔：${INTERVAL_MS / 1000 / 60} 分钟`)
// console.log(`监控间隔：${INTERVAL_MS / 1000 } 分钟`)

const timer = startScheduler({
  intervalMs: INTERVAL_MS,

  task: async () => {
    await runSkillMonitor()
  },
})

process.on("SIGINT", () => {
  clearInterval(timer)

  console.log("\nSkillHub 自动监控 Scheduler 已停止")

  process.exit(0)
})