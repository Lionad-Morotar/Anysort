import {
  SortFn,
  SortVal,
  SortableTypeEnum,
  SortableValue,
  ConditionSortFn,
  GetCompareValFn,
} from './type'

import { isVoidType, getType } from './utils'

/**
 * get comparable value from specific value
 * @todo refactor x => comparableValue
 */
const getCompareValue: ({ [key: string]: GetCompareValFn }) = {
  string: String,
  number: Number,
  date: (x: Date): number => +x,
  symbol: (x: Symbol): string => x.toString(),
  // The priority of true is greater than false
  boolean: (x: SortableValue): boolean => !x,
}

const sortByType: ConditionSortFn =
  (type: SortableTypeEnum): SortFn => (a, b): SortVal => {
    const getValFn = getCompareValue[type]
    if (!getValFn) throw new Error(`[ERR] Error occured when compare value ${a} with value ${b}`)
    const va = getValFn(a), vb = getValFn(b)
    return va === vb ? 0 : (va < vb ? -1 : 1)
  }

const sortByDefault: SortFn =
  (a: SortableValue, b: SortableValue) => {
    const typeA = getType(a)
    const typeB = getType(b)
    const onceEmpty = isVoidType(typeA) || isVoidType(typeB)
    if (onceEmpty) {
      if (typeA === typeB) return 0
      return a ? -1 : 1
    }
    const canSort = getCompareValue[typeA] && typeA === typeB
    if (!canSort) {
      console &&
      console.warn &&
      console.warn(`[TIP] Cannot sort ${a} with ${b}，skip by default`)
      return undefined
    }
    return sortByType(typeA)(a, b)
  }

type PluginTypeEnum = 'maping' | 'plugin'
type PassFn = Function
type MapingFn = Function
// type PluginFn = Function
// type PassFn = (fn: AnysortPlugin) => SortFn
// type MapingFn = (map: PassFn) => (fn: SortFn) => (a: SortableValue, b: SortableValue) => AnysortPlugin
type PluginFn = (plug: PassFn) => (fn: SortFn) => (a: SortableValue, b: SortableValue) => AnysortPlugin
type AnysortPlugin = MapingFn | PluginFn

type PipeLine = {
  _type: PluginTypeEnum
  _value: AnysortPlugin
}

export const pass: PassFn = fn => (a, b) => fn(a, b)
export const maping: MapingFn = map => fn => (a, b) => fn(map(a), map(b))
export const plugin: PluginFn = plug => fn => (a, b) => plug(fn(a, b))

export default class Sort {
  compare: SortFn
  pipeline: PipeLine[]
  constructor () {
    this.compare = sortByDefault
    this.pipeline = []
  }
  // 给管道添加解构方法，用于解构对象并处理值
  map (_value: MapingFn): Sort {
    this.pipeline.push({ _value, _type: 'maping' })
    return this
  }
  // 给管道添加插件，用于调整排序动作
  plugin (_value: PluginFn): Sort {
    this.pipeline.push({ _value, _type: 'plugin' })
    return this
  }
  // 设定排序方法，用来处理排序的值的顺序
  sortby (s: SortableTypeEnum): void {
    const validMethod = s.toLowerCase()
    this.compare = sortByType(validMethod as SortableTypeEnum)
  }
  // 将管道内容合并为排序函数
  seal (): SortFn {
    const compose:
      (last: PassFn, current: PipeLine) => any =
      (last, current) => {
        const { _type, _value } = current
        if (_type === 'maping') return maping(last(_value))
        if (_type === 'plugin') return plugin(_value)(last)
      }
    return this.pipeline.reduce(compose, pass)(this.compare)
  }
}
