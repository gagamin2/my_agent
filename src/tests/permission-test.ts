import { isPermissionGranted } from "../security/permission.js"

type TestCase = {
  input: string
  expected: boolean
}

const tests: TestCase[] = [
  {
    input: "y",
    expected: true,
  },
  {
    input: "Y",
    expected: true,
  },
  {
    input: " y ",
    expected: true,
  },
  {
    input: "n",
    expected: false,
  },
  {
    input: "N",
    expected: false,
  },
  {
    input: " n ",
    expected: false,
  },
  {
    input: "",
    expected: false,
  },
  {
    input: "yes",
    expected: false,
  },
  {
    input: "no",
    expected: false,
  },
  {
    input: "abc",
    expected: false,
  },
]

let passed = 0
let failed = 0

console.log("================================")
console.log("开始测试 Permission")
console.log("================================\n")

for (const test of tests) {
  const result = isPermissionGranted(test.input)

  if (result === test.expected) {
    console.log(
      `✅ ${JSON.stringify(test.input)} → ${result}`,
    )
    passed++
  } else {
    console.log(
      `❌ ${JSON.stringify(test.input)} → 期望 ${test.expected}，实际 ${result}`,
    )
    failed++
  }
}

console.log("\n================================")
console.log("测试完成")
console.log("================================")

console.log(`通过：${passed}`)
console.log(`失败：${failed}`)
console.log(`总计：${passed + failed}`)

if (failed === 0) {
  console.log("\n🎉 所有 Permission 测试通过！")
} else {
  console.log("\n⚠️ 存在测试失败，需要检查 Permission。")
  process.exitCode = 1
}

//输入 npm run test:security 全部测试