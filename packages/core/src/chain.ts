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
 * Full Typed：沿元素类型 keyof 递归映射，合法路径自动补全、非法路径编译期报错。
 * 内置插件作为方法；自定义插件（extend）运行时注册，静态层无补全（已知局限）。
 */

interface ChainMeta<T> {
  readonly source: readonly T[]
  readonly spec: SortRule
  compile (opts?: CompileOptions): SortFn<T>
  run (opts?: CompileOptions): T[]
}

/** 内置插件方法签名。调用后路径重置，返回 Chainable<T>。 */
interface ChainPluginCalls<T> {
  i (): Chainable<T>
  asc (): Chainable<T>
  desc (): Chainable<T>
  reverse (): Chainable<T>
  rand (): Chainable<T>
  is (arg: SortArg): Chainable<T>
  nth (arg: number): Chainable<T>
  all (arg: SortArg): Chainable<T>
  has (arg: SortArg): Chainable<T>
  not (arg?: SortArg): Chainable<T>
  len (arg?: number): Chainable<T>
}

/**
 * 链式 Full Typed 类型。
 * - T：源数组元素类型（固定，run/compile 返回 T[]/SortFn<T>）
 * - C：当前路径上下文（递归，默认 T）；属性访问返回 Chainable<T, C[K]>
 */
export type Chainable<T, C = T> = ChainMeta<T> & ChainPluginCalls<T> & {
  [K in keyof C]: Chainable<T, C[K]>
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
