import { createScheduler } from "../scheduler/scheduler.js"

let count = 0

const scheduler = createScheduler({
  intervalMs: 5000,

  task: async () => {
    count++

    console.log(
      `\n定时任务开始，第 ${count} 次`,
    )

    // 模拟任务执行 8 秒
    await new Promise((resolve) => {
      setTimeout(resolve, 8000)
    })

    console.log(
      `定时任务结束，第 ${count} 次`,
    )
  },
})

scheduler.start()

setTimeout(() => {
  scheduler.stop()

  console.log("\nScheduler 测试结束")
}, 26000)