import { readFile } from "./readFile.js"
import { WriteFile } from "./writeFile.js"
import { executeListFiles } from "./listFiles.js"
import { searchFiles } from "./searchFiles.js"

export const toolRegistry = {
  read_file: async (args: any) => {
    return await readFile(args.filePath)
  },

  write_file: async (args: any) => {
    return await WriteFile(args.filePath,args.content)
  },

  list_files: async (args: any) => {
    return await executeListFiles(args.path)
  },

  search_files: async (args: any) => {
    return await searchFiles(args.query,args.directory)
  },
}