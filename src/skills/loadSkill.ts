import { readFile } from "../tools/readFile.js"

export async function loadSkill(skillPath: string) {
  return await readFile(skillPath)
}