import {
  isPathInsideWorkspace,
  checkPathInsideWorkspace,
  extractPathsFromCommand,
} from "../security/workspace.js"

let passed = 0
let failed = 0

function testPath(
  targetPath: string,
  expected: boolean,
) {
  const result = isPathInsideWorkspace(targetPath)

  if (result === expected) {
    console.log(`✅ 路径：${targetPath}`)
    console.log(`   结果：${result}`)
    passed++
  } else {
    console.log(`❌ 路径：${targetPath}`)
    console.log(
      `   期望：${expected}，实际：${result}`,
    )
    failed++
  }
}

function testCheckPath(
  targetPath: string,
  expected: boolean,
) {
  const result =
    checkPathInsideWorkspace(targetPath)

  if (result.allowed === expected) {
    console.log(`✅ 检查路径：${targetPath}`)
    console.log(`   allowed：${result.allowed}`)

    if (result.reason) {
      console.log(`   reason：${result.reason}`)
    }

    passed++
  } else {
    console.log(`❌ 检查路径：${targetPath}`)
    console.log(
      `   期望：${expected}，实际：${result.allowed}`,
    )
    failed++
  }
}

function testExtractPaths(
  command: string,
  expected: string[],
) {
  const result = extractPathsFromCommand(command)

  const same =
    result.length === expected.length &&
    result.every(
      (path, index) => path === expected[index],
    )

  if (same) {
    console.log(`✅ ${command}`)
    console.log(`   提取结果：${JSON.stringify(result)}`)
    passed++
  } else {
    console.log(`❌ ${command}`)
    console.log(`   期望：${JSON.stringify(expected)}`)
    console.log(`   实际：${JSON.stringify(result)}`)
    failed++
  }
}

console.log("================================")
console.log("开始测试 Workspace Boundary")
console.log("================================\n")

// ================================
// 1. 工作区内路径
// ================================

console.log("【1. 工作区内路径】")

testPath(
  "src/tests/text.txt",
  true,
)

testPath(
  "src/tests/text2.txt",
  true,
)

testPath(
  "src/security/workspace.ts",
  true,
)

testPath(
  "src",
  true,
)

testPath(
  ".",
  true,
)

// ================================
// 2. 工作区外相对路径
// ================================

console.log("\n【2. 工作区外相对路径】")

testPath(
  "../test.txt",
  false,
)

testPath(
  "../../test.txt",
  false,
)

testPath(
  "../../../test.txt",
  false,
)

testPath(
  "../my_agent_other/test.txt",
  false,
)

// ================================
// 3. 绝对路径
// ================================

console.log("\n【3. 绝对路径】")

testPath(
  "C:\\Users\\test.txt",
  false,
)

testPath(
  "C:\\test.txt",
  false,
)

testPath(
  "D:\\test.txt",
  false,
)

testPath(
  "/tmp/test.txt",
  false,
)

// ================================
// 4. checkPathInsideWorkspace
// ================================

console.log("\n【4. 工作区路径检查】")

testCheckPath(
  "src/tests/text.txt",
  true,
)

testCheckPath(
  "../test.txt",
  false,
)

testCheckPath(
  "../../test.txt",
  false,
)

testCheckPath(
  "C:\\Users\\test.txt",
  false,
)

// ================================
// 5. rm / del / rmdir
// ================================

console.log("\n【5. 文件删除命令路径提取】")

testExtractPaths(
  "rm src/tests/text.txt",
  ["src/tests/text.txt"],
)

testExtractPaths(
  "rm src/tests/text.txt src/tests/text2.txt",
  [
    "src/tests/text.txt",
    "src/tests/text2.txt",
  ],
)

testExtractPaths(
  "del src/tests/text.txt",
  ["src/tests/text.txt"],
)

testExtractPaths(
  "rmdir src/tests",
  ["src/tests"],
)

// ================================
// 6. mv / move
// ================================

console.log("\n【6. 文件移动命令路径提取】")

testExtractPaths(
  "mv src/tests/text.txt src/tests/text2.txt",
  [
    "src/tests/text.txt",
    "src/tests/text2.txt",
  ],
)

testExtractPaths(
  "move src/tests/text.txt src/tests/text2.txt",
  [
    "src/tests/text.txt",
    "src/tests/text2.txt",
  ],
)

// ================================
// 7. 重定向
// ================================

console.log("\n【7. Shell 重定向路径提取】")

testExtractPaths(
  "echo hello > src/tests/text.txt",
  ["src/tests/text.txt"],
)

testExtractPaths(
  "echo hello >> src/tests/text.txt",
  ["src/tests/text.txt"],
)

// ================================
// 8. 命令链
// ================================

console.log("\n【8. 命令链路径提取】")

testExtractPaths(
  "rm src/tests/text.txt && git status",
  ["src/tests/text.txt"],
)

testExtractPaths(
  "git status && rm src/tests/text.txt",
  ["src/tests/text.txt"],
)

testExtractPaths(
  "rm src/tests/text.txt; rm src/tests/text2.txt",
  [
    "src/tests/text.txt",
    "src/tests/text2.txt",
  ],
)

testExtractPaths(
  "rm src/tests/text.txt | rm src/tests/text2.txt",
  [
    "src/tests/text.txt",
    "src/tests/text2.txt",
  ],
)

// ================================
// 9. 工作区外路径提取
// ================================

console.log("\n【9. 工作区外路径提取】")

testExtractPaths(
  "rm ../test.txt",
  ["../test.txt"],
)

testExtractPaths(
  "rm ../../test.txt",
  ["../../test.txt"],
)

testExtractPaths(
  "rm src/tests/text.txt ../test.txt",
  [
    "src/tests/text.txt",
    "../test.txt",
  ],
)

testExtractPaths(
  "mv src/tests/text.txt ../text.txt",
  [
    "src/tests/text.txt",
    "../text.txt",
  ],
)

testExtractPaths(
  "echo hello > ../test.txt",
  ["../test.txt"],
)

// ================================
// 10. 工作区外路径 + 命令链
// ================================

console.log("\n【10. 工作区外路径 + 命令链】")

testExtractPaths(
  "rm ../test.txt && git status",
  ["../test.txt"],
)

testExtractPaths(
  "git status && rm ../test.txt",
  ["../test.txt"],
)

testExtractPaths(
  "rm src/tests/text.txt; rm ../test.txt",
  [
    "src/tests/text.txt",
    "../test.txt",
  ],
)

testExtractPaths(
  "echo hello > src/tests/text.txt && echo world > ../test.txt",
  [
    "src/tests/text.txt",
    "../test.txt",
  ],
)

// ================================
// 测试结果
// ================================

console.log("\n================================")
console.log("Workspace Boundary 测试完成")
console.log("================================")

console.log(`通过：${passed}`)
console.log(`失败：${failed}`)
console.log(`总计：${passed + failed}`)

if (failed === 0) {
  console.log(
    "\n🎉 所有 Workspace Boundary 测试通过！",
  )
} else {
  console.log(
    "\n⚠️ 存在测试失败，需要检查 Workspace Boundary。",
  )

  process.exitCode = 1
}