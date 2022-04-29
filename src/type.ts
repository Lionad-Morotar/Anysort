import Sort from './sort'

import type { BuildInPluginNames } from './build-in-plugins'

export type SortableValue = any
export type SortVal = 1 | 0 | -1
export type SortFn = (a: SortableValue, b: SortableValue) => SortVal

export type ComparableValue = string | number | boolean
export type GetCompareValFn = (x: SortableValue) => ComparableValue

export type SortableTypeEnum = 'string' | 'number' | 'boolean' | 'symbol' | 'function' | 'void' | 'date'
export type ConditionSortFn = (type: SortableTypeEnum) => SortFn

type MappingPlugin = (sort: Sort, arg?: string) => Sort
type ResultPlugin = (sort: Sort) => Sort
export type SortPlugin = MappingPlugin | ResultPlugin
export type Plugins = Record<BuildInPluginNames, SortPlugin>

/**
 * @example 'date-dec()'
 * @example (a, b) => (a - b)
 */
export type SortCMD = string | SortFn

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
