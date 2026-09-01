const TOKEN_BUDGET = 8000
const NUDGE = 0.8
// let totalOutput = 0

//检查Token消耗是否超预算
export function checkBudget(  outputTokens: number,totalOutput: number) {
  totalOutput += outputTokens
  console.log(`Token 使用量：${totalOutput}/${TOKEN_BUDGET}`)
  if (totalOutput >= TOKEN_BUDGET) {
    return {
      status: "stop",
      totalOutput,
    }
   }else if(totalOutput >= TOKEN_BUDGET*NUDGE){
    return {
      status: "nudge",
      totalOutput,
    }
   }else{
    return {
      status: "ok",
      totalOutput,
    }
}
}