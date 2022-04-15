import { SortFn, SortPlugin, SortableValue, GetCompareValFn } from './type'

import { getType, warn } from './utils'

/**
 * get sorting function based on the type of the value
 * @todo refactor x => comparableValue
 */
const getCompareValue: ({ [key: string]: GetCompareValFn }) = {
  void: _ => null,
  string: String,
  number: Number,
  date: (x: Date): number => +x,
  symbol: (x: Symbol): string => x.toString(),
  // The priority of true is greater than false
  boolean: (x: SortableValue): boolean => !x
}

const sortBySameType:
  (type: string) => SortFn =
  (type) => (a, b) => {
    const getValFn = getCompareValue[type]
    if (!getValFn) {
      warn(`cant sort ${a} and ${b}，skip by default`)
      return undefined
    }
    const va = getValFn(a); const vb = getValFn(b)
    return va === vb ? 0 : (va < vb ? -1 : 1)
  }

const sortByDiffType:
  (typeA: string, typeB: string) => SortFn =
  (typeA, typeB) => (a, b) => {
    const idx = {
      number: 1,
      string: 2,
      object: 3,
      void: 4
    }
    if (idx[typeA] && idx[typeB]) {
      const minus = idx[typeA] - idx[typeB]
      return minus > 0 ? 1 : -1
    } else {
      warn(`cant sort ${a} and ${b}，skip by default`)
      return 0
    }
  }

const sortByDefault: SortFn =
  (a: SortableValue, b: SortableValue) => {
    const typeA = getType(a)
    const typeB = getType(b)
    const isSameType = typeA === typeB
    const isComparable = getCompareValue[typeA] && getCompareValue[typeB]
    if (isSameType && isComparable) {
      return sortBySameType(typeA)(a, b)
    } else if (isComparable) {
      return sortByDiffType(typeA, typeB)(a, b)
    } else {
      warn(`cant sort ${a} and ${b}，skip by default`)
    }
  }

type MapingPlugin = (arg: any) => any
type ResultPlugin = (res: any) => any
type PipeLine = {
  _type: 'maping' | 'result'
  _value: MapingPlugin
}

type PLMaping = (map: (x: any) => any) => (fn: SortFn) => (a: any, b: any) => SortableValue
type PLResult = (change: (x: SortableValue) => SortableValue) => (fn: SortFn) => (a: any, b: any) => SortableValue

const maping: PLMaping = map => fn => (a, b) => fn(map(a), map(b))
const result: PLResult = change => fn => (a, b) => change(fn(a, b))

export default class Sort {
  pipeline: PipeLine[]
  constructor () {
    this.pipeline = []
  }

  // TODO multi-arguments
  register (plugin: SortPlugin, arg: string) {
    plugin(this, arg)
  }

  /**
   * its not same as Array.prototype.map in js,
   * but more like map value a to value b,
   * array.sort((a, b) => a - b) then becames:
   * array.sort((a, b) => map(a) - map(b))
   */
  map (_value: MapingPlugin): Sort {
    this.pipeline.push({ _value, _type: 'maping' })
    return this
  }

  /**
   * becareful, the result plugin should be
   * the last one in this.pipeline
   */
  result (_value: ResultPlugin): Sort {
    this.pipeline.push({ _value, _type: 'result' })
    return this
  }

  seal (): SortFn {
    let targetSortFn = sortByDefault
    this.pipeline.reverse().map(current => {
      const { _type, _value } = current
      if (_type === 'maping') targetSortFn = maping(_value)(targetSortFn)
      if (_type === 'result') targetSortFn = result(_value)(targetSortFn)
    })
    return targetSortFn
  }
}
