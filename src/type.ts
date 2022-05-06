import Sort from './sort'

import type { BuildInPluginNames } from './build-in-plugins'
import type { isValidCMD } from './type-utils'

export type SortableValue = unknown
export type SortVal = 1 | 0 | -1
// eslint-disable-next-line no-unused-vars
export type SortFn = (a: SortableValue, b: SortableValue) => SortVal | undefined

export type ComparableValue = string | number | boolean | null
export type SortableTypeEnum = 'string' | 'number' | 'boolean' | 'symbol' | 'function' | 'void' | 'date'

type MappingPlugin = (sort: Sort, arg?: string) => Sort
type ResultPlugin = (sort: Sort) => Sort
export type SortPlugin = MappingPlugin | ResultPlugin
export type Plugins = Readonly<Record<BuildInPluginNames, SortPlugin>>

export type SortStringCMD<CMD> = CMD extends isValidCMD<CMD> ? CMD : never
export type SortCMD<CMD> = CMD extends isValidCMD<CMD>
  ? (SortStringCMD<CMD> | SortFn)
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

type AnysortFactory = {
  <ARR extends any[], CMD>(arr:ARR, args: SortCMD<CMD>[]): ARR;
  <ARR extends any[], CMD>(arr: ARR, ...args: SortCMD<CMD>[]): ARR;
}

export type Anysort = AnysortFactory & {

  // install plugins for Sort
  extends: (exts: Plugins) => void;

  /** internal fns */
  wrap: <ARR extends any[]>(arr: ARR) => ARR;
  config: AnysortConfiguration;

}
