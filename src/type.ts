import Sort from './sort'

import type { PluginNames, PluginNamesWithArgMaybe, PluginNamesWithoutArg } from './build-in-plugins'
import type { validOut } from './type-utils'

type P1 = PluginNames
type P2 = PluginNamesWithArgMaybe
type P3 = PluginNamesWithoutArg

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
  P1 extends PluginNames,
  P2 extends PluginNamesWithArgMaybe,
  P3 extends PluginNamesWithoutArg,
  ARR extends unknown[],
  CMD
> =
  CMD extends validOut<P1, P2, P3, ARR, CMD> ? CMD : never

export type SortCMD<
  P1 extends PluginNames,
  P2 extends PluginNamesWithArgMaybe,
  P3 extends PluginNamesWithoutArg,
  ARR extends unknown[],
  CMD
> =
  CMD extends validOut<P1, P2, P3, ARR, CMD>
  ? (SortStringCMD<P1, P2, P3, ARR, CMD> | SortFn)
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

type AnysortFactory<
  P1 extends PluginNames,
  P2 extends PluginNamesWithArgMaybe,
  P3 extends PluginNamesWithoutArg,
> = {
  <ARR extends unknown[], CMD>(arr: ARR, args: SortCMD<P1, P2, P3, ARR, CMD>[]): ARR;
  <ARR extends unknown[], CMD>(arr: ARR, ...args: SortCMD<P1, P2, P3, ARR, CMD>[]): ARR;
}

export type Anysort<
  P1 extends PluginNames,
  P2 extends PluginNamesWithArgMaybe,
  P3 extends PluginNamesWithoutArg,
> = AnysortFactory<P1, P2, P3> & {

  // install plugins for Sort
  // TODO fix type
  extends: <PluginName extends string>(exts: Record<PluginName, SortPlugin>) => Anysort<P1, P2, P3>

  /** internal fns */
  wrap: <ARR extends any[]>(arr: ARR) => ARR;
  config: AnysortConfiguration;

}

export type BuildInAnysort = Anysort<P1, P2, P3>
