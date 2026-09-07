import "dotenv/config"
import { createScheduler } from "../scheduler/scheduler.js"
import { runSkillMonitor } from "../community/skillMonitor.js"

let count = 0
let currentTask: Promise<void> | null = null
const scheduler = createScheduler({
  // 开发测试使用 10 秒
  intervalMs: 10000,

  task: async () => {
    count++
    console.log(`\n========== 第 ${count} 次自动监控 ==========`)
    currentTask = runSkillMonitor()
    await currentTask
  },
})

scheduler.start()

// 测试运行 2 分钟
setTimeout(() => {
//   clearInterval(timer)//允许还没结束的任务执行完毕
  scheduler.stop()
  console.log("\n========== Scheduler + Skill Monitor 测试结束 ==========")
}, 120000)