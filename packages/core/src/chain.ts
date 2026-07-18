import type { SortArg, SortOp, SortRule } from './ir'
import { compileRule, type CompileOptions, type SortFn } from './compile'
import { getPlugin } from './plugins'

/**
 * 链式前端（形态 B）：Proxy 累积 IR，不触发排序副作用，直到显式 .run()。
 *
 * 访问语义：
 * - meta 属性（source/spec/compile/run）直接返回
 * - 已知插件名 → 返回函数，调用即累积 call op 并重置待定路径
 * - 其他字符串 → 累积为路径段（连续 .a.b.c 合并成单个 get op）
 *
 * 每次链式调用返回新 Chainable（不可变累积，不 mutate 内部状态）。
 * run 复制 source 后排序，绝不 mutate 原数组——这是形态 B 的纯函数式契约。
 *
 * 链式 Full Typed 递归补全（沿对象 keyof 自动提示）留待后续增强；
 * 当前 [key: string]: any 作为过渡，运行时由 Proxy 提供正确行为。
 */

export interface Chainable<T> {
  readonly source: readonly T[]
  readonly spec: SortRule
  compile (opts?: CompileOptions): SortFn<T>
  run (opts?: CompileOptions): T[]
  [key: string]: any
}

export function chain<T> (source: T[]): Chainable<T> {
  return makeChainable(source, [], [])
}

function makeChainable<T> (source: T[], ops: SortOp[], pendingPath: string[]): Chainable<T> {
  const pendingToGet = (): SortOp[] =>
    pendingPath.length > 0 ? [{ type: 'get', path: [...pendingPath] }] : []
  const fullOps = (): SortOp[] => [...ops, ...pendingToGet()]

  const self = {
    source,
    get spec (): SortRule { return { ops: fullOps() } },
    compile: (opts?: CompileOptions): SortFn<T> => compileRule<T>({ ops: fullOps() }, opts),
    run: (opts?: CompileOptions): T[] => [...source].sort(compileRule<T>({ ops: fullOps() }, opts)),
  }

  return new Proxy(self as unknown as Chainable<T>, {
    get (t, prop, receiver) {
      // symbol（Symbol.toStringTag 等内省）与非 string 透传，避免下方字符串逻辑崩溃
      if (typeof prop !== 'string') return Reflect.get(t as object, prop, receiver)
      // 防 thenable 误判：Promise/await 探测 .then 时返回 undefined，避免链式对象被当 thenable 触发递归
      if (prop === 'then') return undefined
      if (prop in t) return (t as Record<string, unknown>)[prop]
      if (getPlugin(prop) !== undefined) {
        return (arg?: SortArg): Chainable<T> => {
          const callOp: SortOp = arg !== undefined
            ? { type: 'call', plugin: prop, arg }
            : { type: 'call', plugin: prop }
          return makeChainable<T>(source, [...ops, ...pendingToGet(), callOp], [])
        }
      }
      // 路径段累积：返回新 Chainable，pendingPath 追加
      return makeChainable<T>(source, ops, [...pendingPath, prop])
    },
  })
}
