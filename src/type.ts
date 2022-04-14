import Sort from './sort'

export type SortableValue = any
export type SkipValue = void
export type SortVal = SkipValue | 1 | 0 | -1
export type SortFn = (a: SortableValue, b: SortableValue) => SortVal

export type ComparableValue = string | number | boolean | SkipValue
export type GetCompareValFn = (x: SortableValue) => ComparableValue

export type SortableTypeEnum = 'string' | 'number' | 'boolean' | 'symbol' | 'function' | 'void' | 'date'
export type ConditionSortFn = (type: SortableTypeEnum) => SortFn

export type SortPlugin = (sort: Sort, arg?: string) => void | Sort

/**
 * @example 'date-dec()'
 * @example (a, b) => (a - b)
 */
export type SortCMD = string | SortFn
