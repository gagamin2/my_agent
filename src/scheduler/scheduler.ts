//多久执行以及执行什么
export interface SchedulerOptions {
  intervalMs: number
  task: () => Promise<void>
}

export function startScheduler(
options: SchedulerOptions,
): NodeJS.Timeout {
  const { intervalMs, task } = options

  const run = async () => {
    try {
      await task()
    } catch (error) {
      console.error(
        "定时任务执行失败：",
        error instanceof Error ? error.message : String(error),
      )
    }
  }

  void run()

  return setInterval(() => {
    void run()
  }, intervalMs)
}