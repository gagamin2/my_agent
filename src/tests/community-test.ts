import { getCommunitySkills } from "../community/communityTool.js"

async function main() {
  console.log("开始测试 SkillHub Community Tool\n")

  try {
    const skills = await getCommunitySkills({
      page: 1,
      pageSize: 20,
    })

    console.log(
      `获取并筛选后得到 ${skills.length} 个社区 Skill\n`,
    )

    skills.forEach((skill, index) => {
      console.log(`${index + 1}. ${skill.name}`)
      console.log(`   slug：${skill.slug}`)
      console.log(`   版本：${skill.version}`)
      console.log(`   分类：${skill.category}`)
      console.log(`   下载量：${skill.downloads}`)
      console.log(`   收藏数：${skill.stars}`)
      console.log(
        `   更新时间：${new Date(
          skill.updated_at,
        ).toLocaleString()}`,
      )

      console.log()
    })

    console.log("🎉 SkillHub Community Tool 测试通过！")
  } catch (error) {
    console.error("\n❌ SkillHub Community Tool 测试失败")
    console.error(error)
    process.exitCode = 1
  }
}

main()