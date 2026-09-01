import {SYSTEM_PROMPT,LOOP_WARNING_PROMPT,TOKEN_WARNING_PROMPT,} from "./systemPrompt.js"

export function getSystemPrompt() {
  return SYSTEM_PROMPT
}

export function getLoopWarningPrompt() {
  return LOOP_WARNING_PROMPT
}

export function getTokenWarningPrompt() {
  return TOKEN_WARNING_PROMPT
}