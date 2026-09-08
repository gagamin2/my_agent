import {loadSkillHistory,mergeSkillHistory,saveSkillHistory,findNewSkills,} from "./skillHistory.js"

export interface CommunitySkill {
  slug: string
  source: string
  name: string
  description: string
  description_zh: string
  category: string
  version: string
  homepage: string
  tags: string[]
  downloads: number
  stars: number
  installs: number
  created_at: number
  updated_at: number
  score: number
  labels: Record<string, string> | null
}

//SkillHub API 响应结构
interface SkillHubResponse {
  code: number
  message: string
  data: {
    total: number
    skills: CommunitySkill[]
  }
}

//Tool的参数
export interface CommunityToolOptions {
  page?: number
  pageSize?: number
}

const SKILLHUB_BASE_URL =
  "https://api.skillhub.cn"

//获取社区skill
export async function getCommunitySkills(
  options: CommunityToolOptions = {},
): Promise<CommunitySkill[]> {
  const startPage = options.page ?? 1
  const pageSize = options.pageSize ?? 20
  const targetCount = 10

  const history = await loadSkillHistory()

  const newSkills: CommunitySkill[] = []
  const collectedSlugs = new Set<string>()

  let page = startPage
  let total = Infinity

  while (newSkills.length < targetCount) {
    // 构造 Query 参数
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortBy: "updated_at",
      order: "desc",
      source: "community",
    })

    console.log(`正在获取 SkillHub 第 ${page} 页...`)

    const response = await fetch(
      `${SKILLHUB_BASE_URL}/api/skills?${params.toString()}`,
    )

    if (!response.ok) {
      throw new Error(`SkillHub API 请求失败：${response.status}`)
    }

    const data = (await response.json()) as SkillHubResponse

    if (data.code !== 0) {
      throw new Error(`SkillHub API 返回错误：${data.message}`)
    }

    total = data.data.total

    // 对当前页进行基础筛选和去重
    const filteredSkills = filterCommunitySkills(
      data.data.skills,
      pageSize,
    )

    // 当前页中找出历史里没有出现过的 Skill
    const currentNewSkills = findNewSkills(
      filteredSkills,
      history,
    )

    // 避免不同页面之间出现重复 Skill
    for (const skill of currentNewSkills) {
      if (collectedSlugs.has(skill.slug)) {
        continue
      }

      collectedSlugs.add(skill.slug)
      newSkills.push(skill)

      if (newSkills.length >= targetCount) {
        break
      }
    }

    // 记录当前页已经见过的 Skill
    const updatedHistory = mergeSkillHistory(
      history,
      filteredSkills,
    )

    history.slugs = updatedHistory.slugs

    // 已经找到足够的 Skill
    if (newSkills.length >= targetCount) {
      break
    }
    // 当前页是最后一页
    if (page * pageSize >= total) {
      break
    }
    page++
  }

  // 保存更新后的 Skill 历史
  await saveSkillHistory(history)
  console.log(`本次共筛选出 ${newSkills.length} 个新的 Skill`)
  return newSkills.slice(0, targetCount)
}

//获取社区skill工具
export const getCommunitySkillsTool = {
  type: "function" as const,
  function: {
    name: "get_community_skills",
    description:
      "获取 SkillHub 社区中最近更新且当前历史中未见过的 Skill。返回结果用于后续分析和推荐，不代表这些 Skill 已经经过质量验证。page 表示 SkillHub 分页页码，不能将 page=2 等结果描述为最新第一页数据。",
    parameters: {
      type: "object",
      properties: {
        page: {
          type: "number",
          description: "页码，从 1 开始。",
        },
        pageSize: {
          type: "number",
          description: "每页返回的 Skill 数量，最大 100。",
        },
      },
      required: [],
    },
  },
}

//筛选Skill，并去重
export function filterCommunitySkills(
  skills: CommunitySkill[],
  limit = 10,
): CommunitySkill[] {
  const seen = new Set<string>()//保存已经出现过的slug

  return skills
    .filter((skill) => {
      if (
        !skill.slug.trim() ||
        !skill.name.trim() ||
        skill.description.trim().length < 10
      ) {
        return false
      }

      if (seen.has(skill.slug)) {
        return false
      }

      seen.add(skill.slug)
      return true
    })
    .slice(0, limit)
}