import { startScheduler } from "../scheduler/scheduler.js"

let count = 0

//测试：5秒执行一次
const timer = startScheduler({
  intervalMs: 5000,

  task: async () => {
    count++
    console.log(`定时任务执行，第 ${count} 次`)
  },
})

setTimeout(() => {
  clearInterval(timer)

  console.log("Scheduler 测试结束")
}, 16000)