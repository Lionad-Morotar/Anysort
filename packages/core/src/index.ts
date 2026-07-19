/**
 * @anysort/core — IR 中心的排序核心。
 *
 * 三段式架构：前端（字符串 parser / 链式 builder）→ IR 数据描述符 → 后端（compiler → SortFn）。
 * 三入口通过 IR 汇聚；arg 还原原生类型；IR 可 JSON 序列化。
 *
 * 插件以 P（插件名联合）沿泛型链路贯穿——anysort.extend(p) 返回新实例，
 * 类型 AnysortFn<P | keyof p>，字符串命令与链式都认自定义插件。
 */

// IR 契约层
export type { SortArg, SortOp, SortRule, SortSpec, SortCMD, PluginCall, PathStr, BuiltinPluginName } from './ir'
export { validateOp, validateRule, validateSpec } from './ir'

// 后端
export type { SortFn, CompileOptions } from './compile'
export { compileRule, compileSpec, combineFns } from './compile'

// 前端：字符串命令
export type { ParseOptions } from './parse'
export { parseRule, parseSpec } from './parse'

// 前端：链式 builder
export type { Chainable } from './chain'
export { chain } from './chain'

// 插件定义（供 extend 参数类型）
export type { PluginDef, MappingPluginDef, ResultPluginDef, PluginKind } from './plugins'
export { plugins as builtinPlugins, isMappingPlugin, isResultPlugin } from './plugins'

// 主入口
import { validateRule, type SortRule, type SortCMD, type BuiltinPluginName } from './ir'
import type { SortFn } from './compile'
import { compileRule, combineFns } from './compile'
import { parseRule } from './parse'
import { chain, type Chainable } from './chain'
import { plugins as builtinPlugins, type PluginDef } from './plugins'

/** anysort 接受的规则：IR / 字符串命令（SortCMD<T,P>）/ 比较函数。P 决定字符串命令可用的插件名。 */
export type AnySortRule<T, P extends string = BuiltinPluginName> =
  | SortRule
  | SortCMD<T, P>
  | SortFn<T>

/**
 * anysort 函数类型。P 是插件名联合（默认内置 11 个）。
 * extend 累积返回新实例（不可变），类型 P | Q 让新实例的字符串命令/链式认自定义插件。
 */
export interface AnysortFn<P extends string = BuiltinPluginName> {
  <T>(arr: T[], ...rules: AnySortRule<T, P>[]): T[]
  extend<Q extends string>(plugins: Record<Q, PluginDef>): AnysortFn<P | Q>
  chain<T>(arr: T[]): Chainable<T, P>
}

/**
 * 创建 anysort 实例。pluginMap 闭包持有，extend 复制累积（不污染全局）。
 */
function createAnysort<P extends string>(pluginMap: Record<string, PluginDef>): AnysortFn<P> {
  const fn = <T>(arr: T[], ...rules: AnySortRule<T, P>[]): T[] => {
    // filter(Boolean) 容错条件式传参（anysort(arr, maybeRule)）
    const fns: SortFn<T>[] = rules.filter(Boolean).map(rule => {
      if (typeof rule === 'string') return compileRule<T>(parseRule(rule), { plugins: pluginMap })
      if (typeof rule === 'function') return rule as SortFn<T>
      validateRule(rule)
      return compileRule<T>(rule, { plugins: pluginMap })
    })
    return arr.sort(combineFns(fns))
  }
  const anysortFn = fn as AnysortFn<P>
  anysortFn.extend = <Q extends string>(newPlugins: Record<Q, PluginDef>): AnysortFn<P | Q> =>
    createAnysort<P | Q>({ ...pluginMap, ...newPlugins })
  anysortFn.chain = <T>(arr: T[]): Chainable<T, P> =>
    chain<T, P>(arr, pluginMap) as unknown as Chainable<T, P>
  return anysortFn
}

export const anysort = createAnysort<BuiltinPluginName>(builtinPlugins as Record<string, PluginDef>)

export default anysort
