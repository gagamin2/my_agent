import { existsSync, unlinkSync } from "node:fs"
import { NotificationManager } from "../notification/notificationManager.js"
import type { NotificationChannel } from "../notification/notificationChannel.js"
import { NotificationHistory } from "../notification/notificationHistory.js"
import { SkillNotificationService } from "../notification/skillNotificationService.js"
import type { Notification } from "../notification/notification.js"
import type { SkillRecommendation } from "../community/skillScoring.js"

const HISTORY_FILE =
  "src/notification/notificationHistory.json"

// 测试开始前清理历史
if (existsSync(HISTORY_FILE)) {
  unlinkSync(HISTORY_FILE)
}

// 测试用通知 Channel
class TestNotificationChannel
  implements NotificationChannel
{
  public notifications: Notification[] = []

  async send(notification: Notification): Promise<void> {
    this.notifications.push(notification)
  }
}

const channel = new TestNotificationChannel()

const notificationManager = new NotificationManager([channel])

const notificationHistory = new NotificationHistory()

const service = new SkillNotificationService(
  notificationManager,
  notificationHistory,
)

const recommendation: SkillRecommendation = {
  skillSlug: "test-skill",
  scores: {
    usefulness: 10,
    generality: 10,
    popularity: 10,
    novelty: 10,
    security: 10,
  },
  totalScore: 50,
  level: "strongly_recommended",
}

// 第一次处理
await service.handleRecommendation(recommendation)

if (channel.notifications.length !== 1) {
  throw new Error("第一次推荐应该发送一次通知")
}

console.log("✓ 第一次通知测试通过")

if (!notificationHistory.hasNotified("test-skill")) {
  throw new Error("第一次通知后应该记录通知历史")
}

console.log("✓ 通知历史记录测试通过")

// 第二次处理同一个 Skill
await service.handleRecommendation(recommendation)

if (channel.notifications.length !== 1) {
  throw new Error("同一个 Skill 第二次不应该重复发送通知")
}

console.log("✓ 重复通知拦截测试通过")

// 测试非强烈推荐
const worthWatching: SkillRecommendation = {
  skillSlug: "worth-watching-skill",
  scores: {
    usefulness: 8,
    generality: 8,
    popularity: 8,
    novelty: 8,
    security: 8,
  },
  totalScore: 40,
  level: "worth_watching",
}

await service.handleRecommendation(worthWatching)

if (channel.notifications.length !== 1) {
  throw new Error("worth_watching Skill 不应该发送通知")
}

console.log("✓ 非强烈推荐 Skill 拦截测试通过")

console.log("\nSkill Notification Service 测试全部通过")

// 清理测试文件
if (existsSync(HISTORY_FILE)) {
  unlinkSync(HISTORY_FILE)
}