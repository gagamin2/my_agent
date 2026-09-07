// 定时任务配置
export interface SchedulerOptions {
  intervalMs: number
  task: () => Promise<void>
}

// 定时任务执行器
export interface Scheduler {
  start(): void
  stop(): void
}

export function createScheduler(
  options: SchedulerOptions,
): Scheduler {
  const { intervalMs, task } = options

  let timer: NodeJS.Timeout | null = null

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

  const start = () => {
    // 已经启动则不重复启动
    if (timer !== null) {
      console.log("Scheduler 已经启动。")
      return
    }

    // 启动后立即执行一次
    void run()

    // 之后按照 intervalMs 定时执行
    timer = setInterval(() => {
      void run()
    }, intervalMs)
  }

  const stop = () => {
    if (timer === null) {
      return
    }

    clearInterval(timer)
    timer = null

    console.log("Scheduler 已停止。")
  }

  return {
    start,
    stop,
  }
}