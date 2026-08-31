import OpenAI from "openai"

const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
})

export async function runAgent(userInput: string) {
  const response = await client.chat.completions.create({
    model: "deepseek-v4-pro",
    messages: [
      {
        role: "user",
        content: userInput,
      },
    ],
  })

  return response.choices[0].message.content
}