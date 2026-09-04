import { checkCommand } from "../security/commandPolicy.js"

type ExpectedRisk = "safe" | "confirm" | "blocked"

let passed = 0
let failed = 0

function test(
  command: string,
  expected: ExpectedRisk,
) {
  const result = checkCommand(command)

  if (result.risk === expected) {
    console.log(`✅ ${command}`)
    console.log(`   结果：${result.risk}`)
    passed++
  } else {
    console.log(`❌ ${command}`)
    console.log(
      `   期望：${expected}，实际：${result.risk}`,
    )
    failed++
  }
}

console.log("================================")
console.log("开始测试 Command Policy")
console.log("================================\n")

// ================================
// 1. 安全命令
// ================================

console.log("【1. 安全命令】")

test("git status", "safe")
test("git diff", "safe")
test("git log", "safe")
test("git branch", "safe")
test("git remote -v", "safe")
test("npm run build", "safe")
test("npm run dev", "safe")
test("echo hello", "safe")
test('echo "hello && world"', "safe")

// ================================
// 2. 需要确认的 Git 命令
// ================================

console.log("\n【2. Git 高风险命令】")

test(
  "git restore src/tests/text2.txt",
  "confirm",
)

test(
  "git clean -fd",
  "confirm",
)

test(
  "git reset --hard HEAD",
  "confirm",
)

test(
  "git checkout -- src/tests/text2.txt",
  "confirm",
)

test(
  "git rebase main",
  "confirm",
)

test(
  "git push --force",
  "confirm",
)

// ================================
// 3. 文件删除 / 移动
// ================================

console.log("\n【3. 文件操作】")

test(
  "rm src/tests/text2.txt",
  "confirm",
)

test(
  "rm -rf src/tests",
  "confirm",
)

test(
  "del src/tests/text2.txt",
  "confirm",
)

test(
  "rmdir src/tests",
  "confirm",
)

test(
  "mv src/tests/text.txt src/tests/text2.txt",
  "confirm",
)

test(
  "move src/tests/text.txt src/tests/text2.txt",
  "confirm",
)

// ================================
// 4. Shell 重定向
// ================================

console.log("\n【4. Shell 重定向】")

test(
  "echo hello > src/tests/text2.txt",
  "confirm",
)

test(
  "echo world >> src/tests/text2.txt",
  "confirm",
)

// ================================
// 5. 直接禁止
// ================================

console.log("\n【5. 禁止命令】")

test(
  "format C:",
  "blocked",
)

test(
  "format D:",
  "blocked",
)

// ================================
// 6. 命令链
// ================================

console.log("\n【6. 命令链安全检测】")

test(
  "git status && git restore src/tests/text2.txt",
  "confirm",
)

test(
  "git status && echo hello > src/tests/text2.txt",
  "confirm",
)

test(
  "echo hello > src/tests/text2.txt && git status",
  "confirm",
)

test(
  "git status; git restore src/tests/text2.txt",
  "confirm",
)

test(
  "git status | git restore src/tests/text2.txt",
  "confirm",
)

// ================================
// 7. 大小写
// ================================

console.log("\n【7. 大小写检测】")

test(
  "GIT RESTORE src/tests/text2.txt",
  "confirm",
)

test(
  "RM src/tests/text2.txt",
  "confirm",
)

test(
  "FORMAT C:",
  "blocked",
)

// ================================
// 8. 高风险命令不应该被前面的安全命令绕过
// ================================

console.log("\n【8. 安全命令 + 高风险命令】")

test(
  "echo hello && git restore src/tests/text2.txt",
  "confirm",
)

test(
  "git status && rm src/tests/text2.txt",
  "confirm",
)

test(
  "echo hello && format C:",
  "blocked",
)

// ================================
// 测试结果
// ================================

console.log("\n================================")
console.log("测试完成")
console.log("================================")

console.log(`通过：${passed}`)
console.log(`失败：${failed}`)
console.log(`总计：${passed + failed}`)

if (failed === 0) {
  console.log("\n🎉 所有 Command Policy 测试通过！")
} else {
  console.log("\n⚠️ 存在测试失败，需要检查 Command Policy。")
  process.exitCode = 1
}

//输入 npm run test:security 全部测试