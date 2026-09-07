import {mkdir,readFile,writeFile} from "node:fs/promises"
import path from "node:path"
import type { CommunitySkill } from "./communityTool.js"

const historyDir = path.resolve(process.cwd(),"src/community")
const historyPath = path.join(historyDir,"skillHistory.json")

//记录已出现过的skill的slug
export interface SkillHistory {
  slugs: string[]
}

//加载skill历史
export async function loadSkillHistory(): Promise<SkillHistory> {
  try {
    const content = await readFile(historyPath,"utf-8")

    return JSON.parse(content) as SkillHistory
  } catch {
    return {
      slugs: [],
    }
  }
}

//保存skill历史
export async function saveSkillHistory(
  history: SkillHistory,
): Promise<void> {
  await mkdir(historyDir, {
    recursive: true,
  })

  await writeFile(
    historyPath,
    JSON.stringify(history, null, 2),
    "utf-8",
  )
}

//找到新skill
export function findNewSkills(
  skills: CommunitySkill[],
  history: SkillHistory,
): CommunitySkill[] {
  const knownSlugs = new Set(history.slugs)

  return skills.filter(
    (skill) => !knownSlugs.has(skill.slug),
  )
}

//保存新skill
export function mergeSkillHistory(
  history: SkillHistory,
  skills: CommunitySkill[],
): SkillHistory {
  const slugs = new Set(history.slugs)

  for (const skill of skills) {
    slugs.add(skill.slug)
  }

  return {
    slugs: [...slugs],
  }
}