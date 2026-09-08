import type { Notification } from "./notification.js"
import type { SkillRecommendation } from "../community/skillScoring.js"
import { shouldNotifySkill } from "./notificationPolicy.js"

export function createSkillNotification(
  recommendation: SkillRecommendation,
): Notification | null {
  if (!shouldNotifySkill(recommendation)) {
    return null
  }

  const description =
    recommendation.descriptionZh ||
    recommendation.description

  return {
    title: "🔔 发现强烈推荐的 Skill",
    content: [
      `Skill：${recommendation.name}`,
      `Slug：${recommendation.skillSlug}`,
      "",
      "简介：",
      description,
      "",
      `分类：${recommendation.category}`,
      `版本：${recommendation.version}`,
      "",
      `⭐ 推荐评分：${recommendation.totalScore}`,
      "推荐等级：强烈推荐",
      "",
      `实用性：${recommendation.scores.usefulness}`,
      `通用性：${recommendation.scores.generality}`,
      `社区热度：${recommendation.scores.popularity}`,
      `新颖性：${recommendation.scores.novelty}`,
      `安全性：${recommendation.scores.security}`,
      "",
      `🔗 主页：${recommendation.homepage}`,
    ].join("\n"),
    level: "important",
    createdAt: new Date(),
  }
}