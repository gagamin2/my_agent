import "dotenv/config"

const webhookUrl = process.env.WEBHOOK_URL

if (!webhookUrl) {
  throw new Error("WEBHOOK_URL 环境变量没有正确加载")
}

console.log("✓ WEBHOOK_URL 环境变量加载成功")
console.log("✓ Webhook 配置测试通过")