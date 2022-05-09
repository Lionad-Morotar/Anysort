import Sort from './sort'
import type { BuildInPlugins } from './build-in-plugins'
import type { DontCare, Equal, RequiredArguments, isValidStringCMD } from './type-utils'

export type SortableValue = unknown
export type SortVal = number

export type ComparableValue = string | number | boolean | null
export type SortableTypeEnum = 'string' | 'number' | 'boolean' | 'symbol' | 'function' | 'void' | 'date'

type MappingPlugin = (sort: Sort, arg?: string) => Sort
type ResultPlugin = (sort: Sort) => Sort
export type SortPlugin = MappingPlugin | ResultPlugin

export type SortStringCMD<Plugins, ARR extends unknown[], CMD> =
  CMD extends isValidStringCMD<Plugins, ARR, CMD> ? CMD : never

export type SortFn<ARR extends SortableValue[] = unknown[]> =
  [ARR] extends [(infer Item)[]]
  ? (a: Item, b: Item) => SortVal | undefined
  : never

export type SortCMD<Plugins, ARR extends unknown[], CMD> =
  SortFn<ARR> |
  SortStringCMD<Plugins, ARR, CMD>

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
  orders: Partial<
    Record<SortableTypeEnum, number> &
    { rest: number, object: number }
  >;
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

export type AnySortWrapper<ARR> = ARR

export type Anysort<Plugins> = {

  // [CALL]
  <ARR extends unknown[], CMD>(arr: ARR, ...args: SortCMD<Plugins, ARR, CMD>[]): AnySortWrapper<ARR>

  // install plugins for Sort
  extends: <U extends Record<string, SortPlugin>>(exts: U) => Anysort<BuildInPlugins & U>

  /** internal fns */
  wrap: <ARR extends any[]>(arr: ARR) => ARR
  config: AnysortConfiguration

}

export type BuildInAnysort = Anysort<BuildInPlugins>
