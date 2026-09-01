// const toolHistory = new Map<string, number>()//重复计数器

//生成指纹
export function createToolFingerprint(
  name: string,
  argumentsString: string,
) {
  return `${name}:${argumentsString}`
}

//检查重复调用，重复调用3次则跳出循环
export function checkLoop(fingerprint: string,toolHistory: Map<string, number>) {
  const count = toolHistory.get(fingerprint) ?? 0
  const newCount = count + 1
  toolHistory.set(fingerprint, newCount)
  if (newCount >= 3) {
    return "break"
  }
  if (newCount === 2) {
    return "warn"
  }
  return "ok"
}