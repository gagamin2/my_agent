import {findNewSkills,mergeSkillHistory, loadSkillHistory,saveSkillHistory,type SkillHistory} from "../community/skillHistory.js"
import type { CommunitySkill } from "../community/communityTool.js"

const skills = [
  {
    slug: "smart-charts",
    name: "smart-charts",
  },
  {
    slug: "new-agent",
    name: "New Agent",
  },
  {
    slug: "token-master",
    name: "token节省大师",
  },
] as CommunitySkill[]

const history: SkillHistory = {
  slugs: [
    "smart-charts",
  ],
}

const newSkills = findNewSkills(skills,history)

console.log("新 Skill：")

newSkills.forEach((skill) => {
  console.log(
    `- ${skill.name} (${skill.slug})`,
  )
})

if (newSkills.length !== 2) {
  throw new Error(
    `测试失败：预期 2 个新 Skill，实际 ${newSkills.length} 个`,
  )
}

const updatedHistory = mergeSkillHistory(history,skills)

console.log("\n更新后的历史：")
console.log(updatedHistory)

if (updatedHistory.slugs.length !== 3) {
  throw new Error(`测试失败：预期 3 个历史 Skill，实际 ${updatedHistory.slugs.length} 个`)
}

await saveSkillHistory(updatedHistory)

const loadedHistory =await loadSkillHistory()

if (loadedHistory.slugs.length !==updatedHistory.slugs.length) {
  throw new Error("测试失败：保存后的历史读取不一致",)
}

console.log("\n🎉 Skill History 保存/读取测试通过！",)

console.log("\n🎉 Skill History 测试通过！")