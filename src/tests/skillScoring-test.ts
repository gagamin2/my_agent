import {calculateTotalScore,getRecommendationLevel,evaluateSkill} from "../community/skillScoring.js"

console.log("=== skill得分计算测试 ===")

// 1. 满分
const fullScore = {
  usefulness: 10,
  generality: 10,
  popularity: 10,
  novelty: 10,
  security: 10,
}
console.log("\n测试 1：满分")
console.log("总分：", calculateTotalScore(fullScore))
console.log("推荐等级：",getRecommendationLevel(50, 10))

// 2. 41 分
const strongScore = {
  usefulness: 9,
  generality: 8,
  popularity: 7,
  novelty: 9,
  security: 8,
}
console.log("\n测试 2：41 分")
console.log("总分：", calculateTotalScore(strongScore))
console.log("推荐等级：",getRecommendationLevel(41, 8))

// 3. 26～40 分
const watchScore = {
  usefulness: 8,
  generality: 7,
  popularity: 6,
  novelty: 7,
  security: 6,
}
console.log("\n测试 3：34 分")
console.log("总分：", calculateTotalScore(watchScore))
console.log("推荐等级：",getRecommendationLevel(34, 6))

// 4. 25 分
const lowScore = {
  usefulness: 5,
  generality: 5,
  popularity: 5,
  novelty: 5,
  security: 5,
}
console.log("\n测试 4：25 分")
console.log("总分：", calculateTotalScore(lowScore))
console.log("推荐等级：",getRecommendationLevel(25, 5))

// 5. 安全兜底
const dangerousScore = {
  usefulness: 10,
  generality: 10,
  popularity: 10,
  novelty: 10,
  security: 2,
}
console.log("\n测试 5：安全兜底")
console.log("总分：", calculateTotalScore(dangerousScore))
console.log("推荐等级：",getRecommendationLevel(42, 2))

// 6. 完整评估
console.log("\n测试 6：完整评估")
const result = evaluateSkill(
  "test-skill",{
    usefulness: 9,
    generality: 8,
    popularity: 7,
    novelty: 9,
    security: 8,
  }
)
console.log(result)