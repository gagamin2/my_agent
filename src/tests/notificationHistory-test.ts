import { existsSync, unlinkSync } from "node:fs"
import { NotificationHistory } from "../notification/notificationHistory.js"

const HISTORY_FILE ="src/notification/notificationHistory.json"

//测试开始前清理历史文件
if (existsSync(HISTORY_FILE)) {
  unlinkSync(HISTORY_FILE)
}

const history = new NotificationHistory()

//第一次查询时不存在
if (history.hasNotified("test-skill")) {
  throw new Error("新 Skill 不应该存在通知历史")
}

console.log("✓ 初始状态测试通过")

//记录通知
history.markNotified("test-skill")

//记录之后查询
if (!history.hasNotified("test-skill")) {
  throw new Error("记录通知后应该能够查询到")
}

console.log("✓ 通知记录测试通过")

//重复记录不产生新记录
history.markNotified("test-skill")

const historyAgain = new NotificationHistory()

if (!historyAgain.hasNotified("test-skill")) {
  throw new Error("重新加载后应该能够查询到通知历史")
}

console.log("✓ 通知历史持久化测试通过")

// 另一个 Skill 不应该受到影响
if (historyAgain.hasNotified("another-skill")) {
  throw new Error("不同 Skill 不应该共享通知历史")
}

console.log("✓ Skill 独立性测试通过")

console.log("\nNotification History 测试全部通过")

//测试结束后清理测试数据
if (existsSync(HISTORY_FILE)) {
  unlinkSync(HISTORY_FILE)
}