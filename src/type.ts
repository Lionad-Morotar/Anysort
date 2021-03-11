import Sort from './Sort'

export type SortableTypeEnum = 'string' | 'number' | 'boolean' | 'symbol' | 'function' | 'void' | 'date'
export type SortableValue = any

// return void to skip sort, by example,
// [3,2,3].sort((a, b) => null) result in [3,2,3]
export type SkipCompareValue = void
export type ComparableValue = string | number | boolean | SkipCompareValue
export type GetCompareValFn = (x: SortableValue) => ComparableValue

export type SortVal = SkipCompareValue | 1 | 0 | -1
export type SortFn = (a: SortableValue, b: SortableValue) => SortVal
export type ConditionSortFn = (type: SortableTypeEnum) => SortFn

// TODO check
export type SortPlugin = (sort: Sort, args?: any) => void

export type SortCMD = string | SortFn
