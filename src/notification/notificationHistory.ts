import { existsSync, readFileSync, writeFileSync } from "node:fs"

const HISTORY_FILE = "src/notification/notificationHistory.json"//已通知skill保存路径

export interface NotificationHistoryRecord {
  skillSlug: string
  notifiedAt: string
}

export class NotificationHistory {
  private records: NotificationHistoryRecord[]

  constructor() {
    this.records = this.load()
  }

  private load(): NotificationHistoryRecord[] {
    if (!existsSync(HISTORY_FILE)) {
      return []
    }

    try {
      const content = readFileSync(HISTORY_FILE, "utf-8")

      if (!content.trim()) {
        return []
      }

      const data = JSON.parse(content)

      if (!Array.isArray(data)) {
        return []
      }

      return data
    } catch (error) {
      console.error(
        "读取通知历史失败：",
        error instanceof Error ? error.message : String(error),
      )

      return []
    }
  }

  private save(): void {
    writeFileSync(
      HISTORY_FILE,
      JSON.stringify(this.records, null, 2),
      "utf-8",
    )
  }

  //检查skill是否已通知
  hasNotified(skillSlug: string): boolean {
    return this.records.some(
      (record) => record.skillSlug === skillSlug,
    )
  }

  //标记已通知
  markNotified(skillSlug: string): void {
    if (this.hasNotified(skillSlug)) {
      return
    }

    this.records.push({
      skillSlug,
      notifiedAt: new Date().toISOString(),
    })

    this.save()
  }
}