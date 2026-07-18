import type { SortArg, SortOp, SortRule, SortSpec } from './ir'
import { validateRule } from './ir'

/**
 * 字符串前端：把字符串命令翻译成 IR。
 *
 * 命令按 delim（默认 '-'）分段，每段用 regex 判断：
 * - 形如 `name(arg)` → call 插件，arg 从字符串还原原生类型
 * - 形如 `a.b.c`（无括号）→ get 路径，按 '.' 拆成 path 数组
 *
 * arg 还原：'2'→number、'true'/'false'→boolean、'null'→null、其余为 string。
 * 这是 IR 区别于字符串命令的关键——源语言把 arg 压扁成 string，IR 还原其本来类型。
 */

export interface ParseOptions {
  delim?: string
}

const DEFAULT_DELIM = '-'

/** 把字符串 arg 还原成原生 SortArg：数字 / 布尔 / null 还原，其余为 string。 */
function parseArg (raw: string | undefined): SortArg | undefined {
  if (raw === undefined || raw === '') return undefined
  if (raw === 'null') return null
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw)
  return raw
}

const SEGMENT_RE = /^([^(]+)(\(([^)]*)\))?$/

/**
 * 按 delim 分段，但跳过括号内的 delim。
 * 让 arg 可含 delim（如负号 `-5`、含 `-` 的字符串字面量）——括号屏蔽内部分段。
 * 注：delim 假定为单字符；括号深度计数防止嵌套括号误判。
 */
function splitRespectingParens (cmd: string, delim: string): string[] {
  const parts: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of cmd) {
    if (ch === '(') depth++
    else if (ch === ')') depth = Math.max(0, depth - 1)
    if (ch === delim && depth === 0) {
      if (cur.length > 0) parts.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  if (cur.length > 0) parts.push(cur)
  return parts
}

export function parseRule (cmd: string, opts?: ParseOptions): SortRule {
  const delim = opts?.delim ?? DEFAULT_DELIM
  const segments = splitRespectingParens(cmd, delim)
  const ops: SortOp[] = segments.map(seg => {
    const m = seg.match(SEGMENT_RE)
    if (!m) throw new Error(`[anysort] illegal command segment: "${seg}"`)
    const [, name, callable, argRaw] = m
    if (callable !== undefined) {
      const arg = parseArg(argRaw)
      return arg !== undefined
        ? { type: 'call', plugin: name, arg }
        : { type: 'call', plugin: name }
    }
    const path = name.split('.').filter(p => p.length > 0)
    if (path.length === 0) throw new Error(`[anysort] empty path in segment: "${seg}"`)
    return { type: 'get', path }
  })
  const rule: SortRule = { ops }
  validateRule(rule)
  return rule
}

export function parseSpec (...cmds: string[]): SortSpec {
  return cmds.map(c => parseRule(c))
}
