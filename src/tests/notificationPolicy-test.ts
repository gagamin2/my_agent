import { shouldNotifySkill } from "../notification/notificationPolicy.js"
import type { SkillRecommendation } from "../community/skillScoring.js"

const stronglyRecommended: SkillRecommendation = {
  skillSlug: "strongly-recommended-skill",
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

const notRecommended: SkillRecommendation = {
  skillSlug: "not-recommended-skill",
  scores: {
    usefulness: 5,
    generality: 5,
    popularity: 5,
    novelty: 5,
    security: 2,
  },
  totalScore: 22,
  level: "not_recommended",
}

// 强烈推荐应该通知
if (!shouldNotifySkill(stronglyRecommended)) {
  throw new Error(
    "strongly_recommended Skill 应该发送通知",
  )
}

console.log("✓ 强烈推荐通知策略测试通过")

// 可以关注不应该通知
if (shouldNotifySkill(worthWatching)) {
  throw new Error(
    "worth_watching Skill 不应该发送通知",
  )
}

console.log("✓ 可以关注通知策略测试通过")

// 暂不推荐不应该通知
if (shouldNotifySkill(notRecommended)) {
  throw new Error(
    "not_recommended Skill 不应该发送通知",
  )
}

console.log("✓ 暂不推荐通知策略测试通过")

console.log(
  "\nNotification Policy 测试全部通过",
)