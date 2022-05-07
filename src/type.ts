import Sort from './sort'

import type { PluginNames, PluginNamesWithArgMaybe, PluginNamesWithoutArg } from './build-in-plugins'
import type { RequiredArguments, validOut } from './type-utils'

type PS1 = PluginNames
type PS2 = PluginNamesWithArgMaybe
type PS3 = PluginNamesWithoutArg

export type SortableValue = unknown
export type SortVal = 1 | 0 | -1
// eslint-disable-next-line no-unused-vars
export type SortFn = (a: SortableValue, b: SortableValue) => SortVal | undefined

export type ComparableValue = string | number | boolean | null
export type SortableTypeEnum = 'string' | 'number' | 'boolean' | 'symbol' | 'function' | 'void' | 'date'

type MappingPlugin = (sort: Sort, arg?: string) => Sort
type ResultPlugin = (sort: Sort) => Sort
export type SortPlugin = MappingPlugin | ResultPlugin

export type SortStringCMD<
  PS1, PS2, PS3,
  ARR extends unknown[],
  CMD
> =
  CMD extends validOut<PS1, PS2, PS3, ARR, CMD> ? CMD : never

export type SortCMD<
  PS1,
  PS2,
  PS3,
  ARR extends unknown[],
  CMD
> =
  CMD extends validOut<PS1, PS2, PS3, ARR, CMD>
  ? (SortStringCMD<PS1, PS2, PS3, ARR, CMD> | SortFn)
  : never

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

type AnysortFactory<PS1, PS2, PS3> = {
  <ARR extends unknown[], CMD>(arr: ARR, args: SortCMD<PS1, PS2, PS3, ARR, CMD>[]): ARR;
  <ARR extends unknown[], CMD>(arr: ARR, ...args: SortCMD<PS1, PS2, PS3, ARR, CMD>[]): ARR;
}

export type ExtsPluginsLiteralTypes<T> = { [K in keyof T]: T[K] }
export type ExtsPluginsCallMaybeWithArg<T> = { [K in keyof ExtsPluginsLiteralTypes<T> as RequiredArguments<ExtsPluginsLiteralTypes<T>[K]> extends (_: any) => any ? never : K]: any }
export type ExtsPluginNames<T> = Exclude<keyof T, never>
export type ExtsPluginNamesWithArgMaybe<T> = Exclude<keyof ExtsPluginsCallMaybeWithArg<T>, never>
export type ExtsPluginNamesWithoutArg<T> = Exclude<ExtsPluginNames<T>, ExtsPluginNamesWithArgMaybe<T>>

export type Anysort<PS1, PS2, PS3> = AnysortFactory<PS1, PS2, PS3> & {

  // install plugins for Sort
  extends: <U extends Record<string, SortPlugin>>(exts: U) =>
    Anysort<PS1 | ExtsPluginNames<U>, PS2 | ExtsPluginNamesWithArgMaybe<U>, PS3 | ExtsPluginNamesWithoutArg<U>>

  /** internal fns */
  wrap: <ARR extends any[]>(arr: ARR) => ARR;
  config: AnysortConfiguration;

}

export type BuildInAnysort = Anysort<PS1, PS2, PS3>
