import {
  SortFn,
  SortableValue,
  GetCompareValFn,
} from './type'

import { isVoidType, getType, warn } from './utils'

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
  boolean: (x: SortableValue): boolean => !x,
}

const sortBySameType:
  (type: string) => SortFn =
  (type) => (a, b) => {
    const getValFn = getCompareValue[type]
    if (!getValFn) {
      warn(`cant sort ${a} and ${b}，skip by default`)
      return undefined
    }
    const va = getValFn(a), vb = getValFn(b)
    return va === vb ? 0 : (va < vb ? -1 : 1)
  }

const sortByDiffType:
  (typeA: string, typeB: string) => SortFn =
  (typeA, typeB) => (a, b) => {
    const idx = {
      number: 1,
      string: 2,
      object: 3,
      void: 4,
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

export const maping:
  (map: (x: any) => any) => (fn: SortFn) => (a: any, b: any) => SortableValue =
  (map => fn => (a, b) => fn(map(a), map(b)))
export const result:
  (change: (x: SortableValue) => SortableValue) => (fn: SortFn) => (a: any, b: any) => SortableValue =
  (change => fn => (a, b) => change(fn(a, b)))

export default class Sort {
  pipeline: PipeLine[]
  constructor () {
    this.pipeline = []
  }
  map (_value: MapingPlugin): Sort {
    this.pipeline.push({ _value, _type: 'maping' })
    return this
  }
  result (_value: ResultPlugin): Sort {
    this.pipeline.push({ _value, _type: 'result' })
    return this
  }
  seal (): SortFn {
    let targetSortFn = sortByDefault
    this.pipeline.reverse().map(current => {
      const { _type, _value } = current
      if (_type === 'maping') targetSortFn = maping(_value)(targetSortFn)
      // ! It is wrong to apply the maping plugin after applying the result plugin
      if (_type === 'result') targetSortFn = result(_value)(targetSortFn)
    })
    return targetSortFn
  }
}
