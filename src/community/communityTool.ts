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
  const page = options.page ?? 1
  const pageSize = options.pageSize ?? 20

  //构造Query参数
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy: "updated_at",
    order: "desc",
    source: "community",
  })

  const response = await fetch(`${SKILLHUB_BASE_URL}/api/skills?${params.toString()}`)

  if (!response.ok) {
    throw new Error(`SkillHub API 请求失败：${response.status}`)
  }

  const data = (await response.json()) as SkillHubResponse

  if (data.code !== 0) {
    throw new Error(`SkillHub API 返回错误：${data.message}`)
  }

  const filteredSkills =
  filterCommunitySkills(data.data.skills)

  const history = await loadSkillHistory()
  const newSkills = findNewSkills(filteredSkills, history)
  const updatedHistory = mergeSkillHistory(history, filteredSkills)

  await saveSkillHistory(updatedHistory)

  return newSkills
}

export const getCommunitySkillsTool = {
  type: "function" as const,
  function: {
    name: "get_community_skills",
    description:
      "获取 SkillHub 社区中最近更新的 Skill，用于发现新的社区 Skill。",
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