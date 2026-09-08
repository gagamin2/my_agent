import type { CommunitySkill } from "./communityTool.js"

export type Score = number

export interface SkillScores {
  usefulness: Score
  generality: Score
  popularity: Score
  novelty: Score
  security: Score
}

//计算总分
export function calculateTotalScore(
  scores: SkillScores,
): number {
  return (
    scores.usefulness +
    scores.generality +
    scores.popularity +
    scores.novelty +
    scores.security
  )
}

export type RecommendationLevel =
  | "strongly_recommended"
  | "worth_watching"
  | "not_recommended"

//skill分级
export interface SkillRecommendation {
  scores: SkillScores
  totalScore: number
  level: RecommendationLevel
  skillSlug: string
  name: string
  description: string
  descriptionZh: string
  category: string
  version: string
  homepage: string
}

export function getRecommendationLevel(
  totalScore: number,
  security: number,
): RecommendationLevel {
  if (security <= 2) {
    return "not_recommended"
  }
  if (totalScore >= 39) {
    return "strongly_recommended"
  }
  if (totalScore >= 26) {
    return "worth_watching"
  }
  return "not_recommended"
}

export function evaluateSkill(
  skill: CommunitySkill,
  scores: SkillScores,
): SkillRecommendation {
  const totalScore = calculateTotalScore(scores)
  const level = getRecommendationLevel(
    totalScore,
    scores.security,
  )

  return {
    skillSlug: skill.slug,
    name: skill.name,
    description: skill.description,
    descriptionZh: skill.description_zh,
    category: skill.category,
    version: skill.version,
    homepage: skill.homepage,
    scores,
    totalScore,
    level,
  }
}

//分数计算工具
export const skillScoringTool = {
  type: "function" as const,
  function: {
    name: "evaluate_skill",
    description:
      "根据 Agent 对指定 Skill 的五个维度评分，计算总分并生成推荐等级。评分必须基于当前 get_community_skills 返回的 Skill 数据。",
    parameters: {
      type: "object",
      properties: {
        skillSlug: {
          type: "string",
          description:
            "当前正在评分的 Skill 的 slug，必须使用 get_community_skills 返回的数据中的 slug。",
        },

        usefulness: {
          type: "integer",
          minimum: 0,
          maximum: 10,
          description: "实用性评分，0-10 分。",
        },

        generality: {
          type: "integer",
          minimum: 0,
          maximum: 10,
          description: "通用性评分，0-10 分。",
        },

        popularity: {
          type: "integer",
          minimum: 0,
          maximum: 10,
          description: "社区热度评分，0-10 分。",
        },

        novelty: {
          type: "integer",
          minimum: 0,
          maximum: 10,
          description: "新颖性评分，0-10 分。",
        },

        security: {
          type: "integer",
          minimum: 0,
          maximum: 10,
          description: "安全性评分，0-10 分。",
        },
      },

      required: [
        "skillSlug",
        "usefulness",
        "generality",
        "popularity",
        "novelty",
        "security",
      ],

      additionalProperties: false,
    },
  },
}