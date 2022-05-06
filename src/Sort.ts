import { getType, warn } from './utils'
import config from './config'

import type { SortFn, SortPlugin, SortableValue, SortableTypeEnum, ComparableValue, SortVal } from './type'
import type { MappingFn, ResultFn } from './build-in-plugins'

/**
 * get sorting function based on the type of the value
 * @todo refactor x => comparableValue
 * @todo extensible for custom types
 */
const getCompareValue: Record<
  SortableTypeEnum,
  // TODO fix type
  // <T extends { new(): T }>(x: T) => ComparableValue
  (x: any) => ComparableValue
> = {
  void: _ => null,
  number: Number,
  string: String,
  symbol: (x: Symbol): string => x.toString(),
  date: (x: Date): number => +x,
  function: (x: Function) => x.name,
  // The priority of true is greater than false
  boolean: (x: SortableValue): boolean => !x
}

const sortBySameType:
  (type: SortableTypeEnum | string, a: SortableValue, b: SortableValue) => SortVal | undefined =
  (type, a, b) => {
    const getValFn = getCompareValue[type]
    if (getValFn) {
      const va = getValFn(a)
      const vb = getValFn(b)
      // something interesting:
      // null < null === false
      // null > null === false
      return va === vb ? 0 : (va < vb ? -1 : 1)
    } else {
      warn(`cant sort ${a} and ${b}，skip by default`)
    }
  }

const sortByDiffType:
  (oa: number, ob: number) => SortVal =
  (oa, ob) => {
    const minus = oa - ob
    return minus === 0 ? 0 : (minus > 0 ? 1 : -1)
  }

const sortByTypeOrder: SortFn =
  (a: SortableValue, b: SortableValue) => {
    const typeA = getType(a)
    const typeB = getType(b)
    const orders = config.orders
    const oa = orders[typeA] || orders.rest
    const ob = orders[typeB] || orders.rest
    const isSameType = oa === ob
    const isComparable = oa && ob
    // console.log('[ANYSORT DEBUG]', typeA, typeB, a, b, oa, ob)
    if (isComparable) {
      return isSameType
        ? sortBySameType(typeA, a, b)
        : sortByDiffType(oa, ob)
    } else {
      warn(`cant sort ${a} and ${b}，skip by default`)
    }
  }

type PLMaping = (map: MappingFn) => (fn: SortFn) => SortFn
type PLResult = (change: ResultFn) => (fn: SortFn) => SortFn

const maping: PLMaping = map => fn => (a, b) => fn(map(a), map(b))
const result: PLResult = change => fn => (a, b) => change(fn(a, b) as SortVal)

export default class Sort {
  pipeline: (
    | { _type: 'maping', _value: MappingFn }
    | { _type: 'result', _value: ResultFn }
  )[]

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
  map (_value: MappingFn): Sort {
    this.pipeline.push({ _value, _type: 'maping' })
    return this
  }

  /**
   * becareful, the result plugin should be
   * the last one in this.pipeline
   */
  result (_value: ResultFn): Sort {
    this.pipeline.push({ _value, _type: 'result' })
    return this
  }

  seal (): SortFn {
    let targetSortFn = sortByTypeOrder
    this.pipeline.reverse().map(current => {
      const { _type, _value } = current
      if (_type === 'maping') targetSortFn = maping(_value)(targetSortFn)
      if (_type === 'result') targetSortFn = result(_value)(targetSortFn)
    })
    return targetSortFn
  }
}
