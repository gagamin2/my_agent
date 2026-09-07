import type { Notification } from "./notification.js"
import type { SkillRecommendation } from "../community/skillScoring.js"

export function createSkillNotification(
  recommendation: SkillRecommendation,
): Notification | null {
  // 只有强烈推荐的 Skill 才发送通知
  if (recommendation.level !== "strongly_recommended") {
    return null
  }

  return {
    title: "发现强烈推荐的 Skill",
    content: [
      `Skill：${recommendation.skillSlug}`,
      `总分：${recommendation.totalScore}`,
      `推荐等级：⭐ 强烈推荐`,
      "",
      `实用性：${recommendation.scores.usefulness}`,
      `通用性：${recommendation.scores.generality}`,
      `社区热度：${recommendation.scores.popularity}`,
      `新颖性：${recommendation.scores.novelty}`,
      `安全性：${recommendation.scores.security}`,
    ].join("\n"),
    level: "important",
    createdAt: new Date(),
  }
}