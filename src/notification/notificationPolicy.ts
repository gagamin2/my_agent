import type { SkillRecommendation } from "../community/skillScoring.js"

export function shouldNotifySkill(
  recommendation: SkillRecommendation,
): boolean {
  return recommendation.level === "strongly_recommended"
}