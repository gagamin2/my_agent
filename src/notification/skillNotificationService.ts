import type { SkillRecommendation } from "../community/skillScoring.js"
import { NotificationManager } from "./notificationManager.js"
import { NotificationHistory } from "./notificationHistory.js"
import { createSkillNotification } from "./skillNotification.js"

export class SkillNotificationService {
  private readonly notificationManager: NotificationManager
  private readonly notificationHistory: NotificationHistory

  constructor(
    notificationManager: NotificationManager,
    notificationHistory: NotificationHistory,
  ) {
    this.notificationManager = notificationManager
    this.notificationHistory = notificationHistory
  }

  //通知有关逻辑
  async handleRecommendation(
    recommendation: SkillRecommendation,
  ): Promise<void> {
    const notification = createSkillNotification(recommendation)//创建通知
    if (notification === null) {
      return
    }

    //检查重复通知
    if (
      this.notificationHistory.hasNotified(recommendation.skillSlug)
    ) {
      console.log(`Skill ${recommendation.skillSlug} 已经通知过，跳过重复通知。`)
      return
    }

    //发送通知
    await this.notificationManager.send(notification)

    //标记已通知
    this.notificationHistory.markNotified(
      recommendation.skillSlug,
    )
  }
}