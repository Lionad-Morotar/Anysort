/**
 * @anysort/core — IR 中心的排序核心。
 *
 * 三段式架构：前端（字符串 parser / 链式 builder）→ IR 数据描述符 → 后端（compiler → SortFn）。
 * 三入口通过 IR 汇聚，消除字符串往返；arg 还原原生类型；IR 可 JSON 序列化供外部消费。
 */

// IR 契约层
export type { SortArg, SortOp, SortRule, SortSpec } from './ir'
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

// 插件扩展
export type { PluginDef, MappingPluginDef, ResultPluginDef, PluginKind } from './plugins'
export { extend, extendAll } from './plugins'

// 主入口
import { validateRule, type SortRule, type SortCMD } from './ir'
import type { SortFn } from './compile'
import { compileRule, combineFns } from './compile'
import { parseRule } from './parse'

/** anysort 接受的规则：IR 数据（SortRule）/ 字符串命令（SortCMD<T>，路径编译期校验）/ 自定义比较函数（命令式逃生口，不进 IR）。 */
export type AnySortRule<T> = SortRule | SortCMD<T> | SortFn<T>

/**
 * 主入口：接受任意混合规则（IR / 字符串 / 比较函数），按优先级短路合并，in-place 排序。
 *
 * 比较函数作为命令式逃生口——它不可序列化，故不进入 IR，但与其他规则一样参与短路合并。
 */
export function anysort<T> (arr: T[], ...rules: AnySortRule<T>[]): T[] {
  // filter(Boolean) 容错条件式传参（anysort(arr, maybeRule)），对齐旧版工厂语义
  const fns: SortFn<T>[] = rules.filter(Boolean).map(rule => {
    if (typeof rule === 'string') return compileRule<T>(parseRule(rule))
    if (typeof rule === 'function') return rule as SortFn<T>
    validateRule(rule) // IR 入口先校验，非法 IR 给可读错误而非 TypeError
    return compileRule<T>(rule)
  })
  return arr.sort(combineFns(fns))
}

export default anysort
