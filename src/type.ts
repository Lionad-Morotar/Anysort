import Sort from './sort'

import type { BuildInPluginNames } from './build-in-plugins'

export type SortableValue = unknown
export type SortVal = 1 | 0 | -1
export type SortFn = (a: SortableValue, b: SortableValue) => SortVal

export type ComparableValue = string | number | boolean
export type SortableTypeEnum = 'string' | 'number' | 'boolean' | 'symbol' | 'function' | 'void' | 'date'

type MappingPlugin = (sort: Sort, arg?: string) => Sort
type ResultPlugin = (sort: Sort) => Sort
export type SortPlugin = MappingPlugin | ResultPlugin
export type Plugins = Readonly<Record<BuildInPluginNames, SortPlugin>>

type SortStringCMD = string
export type SortCMD = SortStringCMD | SortFn

// 3 ways to use anysort
export type AnysortFactory = {
  (arr: any[], args: SortCMD[]): any[];
  (arr: any[], ...args: SortCMD[]): any[];
  (...args: SortCMD[]): SortFn;
}

export type AnysortConfiguration = {
  readonly patched: string;
  autoWrap: boolean;
  autoSort: boolean;
  orders: Partial<
    Record<SortableTypeEnum, number> &
    { rest: number, object: number }
  >;
}

export type Anysort = AnysortFactory & {
  // install plugins for Sort
  extends: (exts: Plugins) => void;
  // generate fn that generate SortFn from string command split by delim
  // default delim is '-'
  genSortFnFromStrGen: (delim: string) => (ss: string) => SortFn;

  /** internal fns */
  wrap: (arr: any[]) => any[];
  config: AnysortConfiguration;
}
