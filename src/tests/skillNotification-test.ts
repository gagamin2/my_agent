import {createSkillNotification} from "../notification/skillNotification.js"

import type {SkillRecommendation} from "../community/skillScoring.js"

const stronglyRecommended: SkillRecommendation = {
  skillSlug: "test-skill",
  scores: {
    usefulness: 10,
    generality: 9,
    popularity: 8,
    novelty: 9,
    security: 10,
  },
  totalScore: 46,
  level: "strongly_recommended",
}

const worthWatching: SkillRecommendation = {
  skillSlug: "watch-skill",
  scores: {
    usefulness: 7,
    generality: 6,
    popularity: 5,
    novelty: 4,
    security: 8,
  },
  totalScore: 30,
  level: "worth_watching",
}

const notRecommended: SkillRecommendation = {
  skillSlug: "bad-skill",
  scores: {
    usefulness: 3,
    generality: 3,
    popularity: 3,
    novelty: 3,
    security: 3,
  },
  totalScore: 15,
  level: "not_recommended",
}

// 测试强烈推荐
const notification = createSkillNotification(
  stronglyRecommended,
)

if (notification === null) {
  throw new Error("强烈推荐的 Skill 应该生成通知")
}

if (notification.level !== "important") {
  throw new Error("强烈推荐的 Skill 通知级别应该是 important")
}

if (!notification.content.includes("test-skill")) {
  throw new Error("通知内容应该包含 Skill 名称")
}

if (!notification.content.includes("总分：46")) {
  throw new Error("通知内容应该包含总分")
}

console.log("✓ strongly_recommended 测试通过")

// 测试可以关注
const watchNotification =
  createSkillNotification(worthWatching)

if (watchNotification !== null) {
  throw new Error("worth_watching 不应该生成通知")
}

console.log("✓ worth_watching 测试通过")

// 测试暂不推荐
const rejectedNotification =
  createSkillNotification(notRecommended)

if (rejectedNotification !== null) {
  throw new Error("not_recommended 不应该生成通知")
}

console.log("✓ not_recommended 测试通过")

console.log("\nSkill Notification 测试全部通过")