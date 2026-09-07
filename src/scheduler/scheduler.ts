// 多久执行以及执行什么
export interface SchedulerOptions {
  intervalMs: number
  task: () => Promise<void>
}

export function startScheduler(
  options: SchedulerOptions,
): NodeJS.Timeout {
  const { intervalMs, task } = options

  // 防止上一次任务还没结束时，又启动新的任务
  let isRunning = false

  const run = async () => {
    if (isRunning) {
      console.log("上一次定时任务尚未结束，本次跳过。")
      return
    }

    isRunning = true

    try {
      await task()
    } catch (error) {
      console.error(
        "定时任务执行失败：",
        error instanceof Error ? error.message : String(error),
      )
    } finally {
      isRunning = false
    }
  }

  // 启动 Scheduler 后立即执行一次
  void run()

  // 之后按照 intervalMs 定时执行
  return setInterval(() => {
    void run()
  }, intervalMs)
}