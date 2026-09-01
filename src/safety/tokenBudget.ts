const TOKEN_BUDGET = 8000
const NUDGE = 0.8
let totalOutput = 0

//检查Token消耗是否超预算
export function checkBudget(outputTokens: number) {
  totalOutput += outputTokens
  console.log(`Token 使用量：${totalOutput}/${TOKEN_BUDGET}`)
  if (totalOutput >= TOKEN_BUDGET) {
    return "stop"
  }else if(totalOutput >= TOKEN_BUDGET*NUDGE){
    return "nudge"
  }else{
  return "ok"
}
}