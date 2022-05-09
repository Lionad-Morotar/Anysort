/* eslint-disable */

import Sort from './sort'
import type { BuildInPlugins } from './build-in-plugins'
import type { DontCare, Equal, ObjectVals, UnionToTupleSafe, RequiredArguments, isValidStringCMD, AnySortInvoke } from './type-utils'

export type SortableValue = unknown
export type SortVal = number

export type ComparableValue = string | number | boolean | null
export type SortableTypeEnum = 'string' | 'number' | 'boolean' | 'symbol' | 'function' | 'void' | 'date'

type MappingPlugin = (sort: Sort, arg?: string) => Sort
type ResultPlugin = (sort: Sort) => Sort
export type SortPlugin = MappingPlugin | ResultPlugin
export type isSortPluginObjects<Obj, Fns = UnionToTupleSafe<ObjectVals<Obj>>> =
  Fns extends [infer Fn, ...infer Tail]
  ? Fn extends
    | ((sort: Sort, arg?: string) => Sort)
    | ((sort: Sort, arg: string) => Sort)
    ? Fn extends ((x: infer SortType, y: infer StringType) => infer ReturnType)
      ? Equal<Sort, SortType> extends true
      ? Equal<Sort, ReturnType> extends true
      ? Obj
      : false
      : false
      : never
    : never
  : never

export type SortStringCMD<Plugins, ARR extends unknown[], CMD> =
  CMD extends isValidStringCMD<Plugins, ARR, CMD> ? CMD : never

export type SortFn<ARR extends SortableValue[] = unknown[]> =
  [ARR] extends [(infer Item)[]]
  ? (a: Item, b: Item) => SortVal | undefined
  : never

export type SortCMD<Plugins, ARR extends unknown[], CMD> =
  CMD extends string
  ? SortStringCMD<Plugins, ARR, CMD>
  : SortFn<ARR>

export type AnysortConfiguration = {
  // delimeter for SortCMD
  delim: string;
  // identity for the proxy
  readonly patched: string;
  // switch for auto wrap the result with proxy
  autoWrap: boolean;
  // switch for auto sort policy even if empty SortCMD provided
  autoSort: boolean;
  // default sort direction for different data types,
  // numbers should bigger than 0,
  // default value:
  //   {
  //     number: 1,
  //     string: 2,
  //     symbol: 3,
  //     date: 4,
  //     object: 5,
  //     function: 6,
  //     rest: 7,
  //     void: 8
  //   }
  // if no 'void' provided,
  // undefined value will be ignored in sort,
  // null value will be treated as normal unrecognized value
  orders: Partial<Record<SortableTypeEnum, number>> &
    Required<{ rest: number, object: number }>
}

export type PluginsCallWithoutArg<T> = {
  [K in keyof T as Equal<T[K], (_: Sort) => Sort> extends true ? K : never]: DontCare
}
export type PluginsCallWithArg<
  T,
  Keys extends keyof T = Exclude<keyof T, keyof PluginsCallWithoutArg<T>>
> = {
  [K in Keys as Equal<T[K], RequiredArguments<T[K]>> extends true ? K : never]: DontCare
}
export type PluginNames<T> = Exclude<keyof T, never>
export type PluginNamesWithArg<T> = Exclude<keyof PluginsCallWithArg<T>, never>
export type PluginNamesWithoutArg<T> = Exclude<keyof PluginsCallWithoutArg<T>, never>
export type PluginNamesWithArgMaybe<T> = Exclude<Exclude<keyof T, PluginNamesWithArg<T>>, PluginNamesWithoutArg<T>>

export type AnySortWrapper<Plugins, ARR extends unknown[]> = ARR & {
  apply <CMD>(...args: SortCMD<Plugins, ARR, CMD>[]): AnySortWrapper<Plugins, ARR>
} & AnySortInvoke<Plugins, ARR>

export type Anysort<Plugins> = {

  // [CALL]
  <ARR extends unknown[], CMD>(arr: ARR, ...args: SortCMD<Plugins, ARR, CMD>[]): AnySortWrapper<Plugins, ARR>

  // install plugins for Sort
  extends: <U>(exts: isSortPluginObjects<U>) => Anysort<{ [K in keyof U]: U[K] } & Plugins>

  /** internal fns */
  wrap: <ARR extends any[]>(arr: ARR) => ARR
  config: AnysortConfiguration

}

export type BuildInAnysort = Anysort<BuildInPlugins>
