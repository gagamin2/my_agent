import "dotenv/config"
import { startScheduler } from "../scheduler/scheduler.js"
import { runSkillMonitor } from "../community/skillMonitor.js"

let count = 0
const timer = startScheduler({
  // 开发测试使用 10 秒
  intervalMs: 10000,

  task: async () => {
    count++
    console.log(`\n========== 第 ${count} 次自动监控 ==========`)
    await runSkillMonitor()
  },
})

// 测试运行 2 分钟
setTimeout(() => {
  clearInterval(timer)//允许还没结束的任务执行完毕
  console.log("\n========== Scheduler + Skill Monitor 测试结束 ==========")
}, 120000)