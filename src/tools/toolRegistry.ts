import { readFile } from "./readFile.js"
import { WriteFile } from "./writeFile.js"
import { executeListFiles } from "./listFiles.js"
import { searchFiles } from "./searchFiles.js"
import { runCommand } from "./runCommand.js"
import type { Interface } from "node:readline/promises"
import { getCommunitySkills } from "../community/communityTool.js"
import { evaluateSkill } from "../community/skillScoring.js"

export const toolRegistry = {
  read_file: async (args: any) => {
    return await readFile(args.filePath)
  },

  write_file: async (args: any) => {
    return await WriteFile(args.filePath, args.content)
  },

  list_files: async (args: any) => {
    return await executeListFiles(args.path)
  },

  search_files: async (args: any) => {
    return await searchFiles(args.query, args.directory)
  },

  run_command: async (args: any, rl: Interface) => {
    return await runCommand(args.command, rl)
  },

  get_community_skills: async (args: any) => {
    return await getCommunitySkills(args)
  },

  evaluate_skill: async (args: any) => {
    return await evaluateSkill(
      args.skillSlug,{
      usefulness: args.usefulness,
      generality: args.generality,
      popularity: args.popularity,
      novelty: args.novelty,
      security: args.security,
    })
  },
}