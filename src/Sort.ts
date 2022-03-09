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

const sortByDefault: SortFn =
  (a: SortableValue, b: SortableValue) => {
    const typeA = getType(a)
    const typeB = getType(b)
    // ignore null or undefined
    if (isVoidType(typeA) || isVoidType(typeB)) {
      if (typeA === typeB) return 0
      return a ? -1 : 1
    }
    const canSort = getCompareValue[typeA] && typeA === typeB
    if (!canSort) {
      const defaultIdx = {
        number: 1,
        string: 2,
        object: 3
      }
      if (defaultIdx[typeA] && defaultIdx[typeB]) {
        return defaultIdx[typeA] - defaultIdx[typeB]
      } else {
        warn(`cant sort ${a} and ${b}，skip by default`)
        return 0
      }
    }
    return sortBySameType(typeA)(a, b)
  }

type MapingPlugin = (arg: any) => any
type ResultPlugin = (res: any) => any
type PipeLine = {
  _type: 'maping' | 'result'
  _value: MapingPlugin
}

export const maping = map => fn => (a, b) => fn(map(a), map(b))
export const result = change => fn => (a, b) => change(fn(a, b))

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
