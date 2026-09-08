import { existsSync, unlinkSync } from "node:fs"

import { NotificationManager } from "../notification/notificationManager.js"
import { ConsoleNotificationChannel } from "../notification/consoleNotificationChannel.js"
import { createSkillNotification } from "../notification/skillNotification.js"
import { NotificationHistory } from "../notification/notificationHistory.js"
import type { SkillRecommendation } from "../community/skillScoring.js"

const HISTORY_FILE = "src/notification/notificationHistory.json"

// 测试开始前清理历史记录
if (existsSync(HISTORY_FILE)) {
  unlinkSync(HISTORY_FILE)
}

// 创建通知管理器
const notificationManager = new NotificationManager([
  new ConsoleNotificationChannel(),
])

// 创建通知历史
const notificationHistory = new NotificationHistory()

// 模拟一个强烈推荐的 Skill
const recommendation: SkillRecommendation = {
  skillSlug: "test-skill",
  name: "测试 Skill",
  description: "这是一个用于测试通知去重功能的 Skill。",
  descriptionZh: "这是一个用于测试通知去重功能的 Skill。",
  category: "测试工具",
  version: "1.0.0",
  homepage: "https://example.com/test-skill",
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
console.log("\n========== 第一次推荐 ==========")

const notification = createSkillNotification(recommendation)

if (notification === null) {
  throw new Error("强烈推荐的 Skill 应该生成通知")
}

if (
  notificationHistory.hasNotified(
    recommendation.skillSlug,
  )
) {
  throw new Error(
    "第一次推荐时不应该存在通知历史",
  )
}

// 第一次发送通知
await notificationManager.send(notification)

// 记录通知历史
notificationHistory.markNotified(recommendation.skillSlug)

console.log("✓ 第一次通知发送成功")
console.log("✓ 第一次通知历史记录成功")


// 第二次处理同一个 Skill
console.log("\n========== 第二次推荐 ==========")

const notificationAgain = createSkillNotification(recommendation)

if (notificationAgain === null) {
  throw new Error(
    "第二次推荐时仍然应该生成通知对象",
  )
}

// 检查是否已经通知过
if (
  notificationHistory.hasNotified(
    recommendation.skillSlug,
  )
) {
  console.log(`Skill ${recommendation.skillSlug} 已经通知过，跳过重复通知。`)
} else {
  throw new Error("第二次推荐时应该检测到已经通知过")
}

console.log("✓ 重复通知检测成功")
console.log("\n========== 通知去重测试全部通过 ==========")

// 测试结束后清理历史文件
if (existsSync(HISTORY_FILE)) {
  unlinkSync(HISTORY_FILE)
}