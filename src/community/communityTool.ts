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

  return data.data.skills
}