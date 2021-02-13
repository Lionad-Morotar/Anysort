type SortableTypeEnum = 'string' | 'number' | 'boolean' | 'symbol' | 'function' | 'void' | 'date'

const isVoid = (x: any): boolean => x == undefined
const isVoidType = (x: SortableTypeEnum): boolean => x === 'void'
const getType = (x: any): SortableTypeEnum => isVoid(x) ? 'void' : Object.prototype.toString.call(x).slice(8, -1).toLowerCase()
const isFn = (x: any): boolean => getType(x) === 'function'

// return void to skip sort, by example,
// [3,2,3].sort((a, b) => null) result in [3,2,3]
type SkipCompareValue = void
type ComparableValue = string | number | boolean | SkipCompareValue
type GetCompareValFn = (x: any) => ComparableValue

// TODO refactor to function: x => comparableValue
/* get comparable value from specific value */
const getCompareValue: ({ [key: string]: GetCompareValFn }) = {
  string: String,
  number: Number,
  date: (x: Date): number => +x,
  symbol: (x: Symbol): string => x.toString(),
  // The priority of true is greater than false
  boolean: (x: any): boolean => !x,
}

type SortVal = SkipCompareValue | 1 | 0 | -1
type SortFn = (a: any, b: any) => SortVal
type ConditionSortFn = (type: SortableTypeEnum) => SortFn

const sortByType: ConditionSortFn =
  (type: SortableTypeEnum): SortFn => (a, b): SortVal => {
    const getValFn = getCompareValue[type]
    if (!getValFn) throw new Error(`[ERR] Error occured when compare value ${a} with value ${b}`)
    const va = getValFn(a), vb = getValFn(b)
    return va === vb ? 0 : (va < vb ? -1 : 1)
  }

const sortByDefault: SortFn =
  (a: any, b: any) => {
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
    // @ts-ignore
    return sortByType(typeA)(a, b)
  }

type PluginTypeEnum = 'maping' | 'plugin'
type PipeLine = {
  _type: PluginTypeEnum
  _value: any // ?
}
type MapingFn = Function // TODO type
type PluginFn = Function // TODO type

const pass:
  (fn: SortFn) => SortFn =
  (fn => (a, b) => fn(a, b))
const plugin:
  (plug: PluginFn) => (fn: SortFn) => SortFn =
  (plug => fn => (a, b) => plug(fn(a, b)))
const maping:
  (map: MapingFn) => (fn: SortFn) => SortFn =
  (map => fn => (a, b) => fn(map(a), map(b)))

class Sort {
  compare: SortFn
  pipeline: PipeLine[]
  constructor () {
    this.compare = null
    this.pipeline = []
  }
  // 给管道添加解构方法，用于解构对象并处理值
  // @example
  // sort.map(x => String(x.a))
  // 从 x 中取得 a 属性并转换为字符串，再继续比较
  map (_value: MapingFn): Sort {
    this.pipeline.push({ _value, _type: 'maping' })
    return this
  }
  // 给管道添加插件，用于调整排序动作
  // @example
  // sort.plugin(fn => (a, b) => -fn(a, b))
  // 将上一个排序结果反转
  plugin (_value: PluginFn): Sort {
    this.pipeline.push({ _value, _type: 'plugin' })
    return this
  }
  // 设定排序方法，用来处理排序的值的顺序
  sortby (s: SortableTypeEnum): void {
    if (typeof s === 'number') {
      console.log('asdf')
    }
    this.compare = sortByType(s.toLowerCase())
  }
  // 将管道合并为函数
  seal () {
    this.compare = this.compare || sortByDefault

    return this.pipeline.reduce((lastSortFn, current) => {
      const { _type, _value } = current
      if (_type === 'maping') return maping(lastSortFn(_value))
      if (_type === 'plugin') return plugin(_value)(lastSortFn)
    }, pass)(this.compare)
  }
}

type SortPlugin = (sort: Sort, args?: any) => void

// default sort plugins
const plugins = {
  by: (sort, args) => sort.sortby(args),
  i: sort => sort.map(x => (x || '').toLowerCase()),
  asc: sort => sort.plugin(pass),
  dec: sort => sort.plugin(fn => (...args) => -fn(...args)),
  rand: sort => sort.plugin(() => () => Math.random() < .5 ? -1 : 1),
  is: (sort, args = '') => sort.map(x => x === args).sortby('boolean'),
  all: (sort, args = '') => sort.map(x => x.every ? x.every(y => String(y) === args) : x === args).sortby('boolean'),
  has: (sort, args) => sort.map(x => x.some(y => String(y) === args)).sortby('boolean'),
  not: (sort, args = '') => sort.map(x => args ? (x !== args) : !x).sortby('boolean'),
  len: (sort, args = null) => isVoid(args)
    ? sort.map(x => x.length).sortby('number')
    : sort.map(x => x.length === args).sortby('boolean'),

  // 默认使用解构插件，处理对象的属性如 'a.b.c' 的值
  default: name => {
    const pathsStore = name.split('.')
    const getVal = x => {
      const paths = [].concat(pathsStore)
      let val = x, next = null
      while (val && paths.length) {
        next = paths.shift()
        val = val[next]
      }
      return val
    }
    return sort => sort.map(getVal)
  }
}

// 从字符串指令中得到排序函数
function generateSortFnFromStr(ss: string): SortFn {
  const sort = new Sort()
  ss.split('-')
    .filter(x => x)
    .map(action => {
      const [all, name, argsWithQuote, args] = action.match(/([^(]+)(\(([^)]*)\))?/)
      const plugin = argsWithQuote
        ? plugins[name]
        : plugins.default(name)
      plugin(sort, args || undefined)
    })
  return sort.seal()
}

/* Main Functions */

type SortCMD = string | SortFn

function factory(...cmd: SortCMD[]): SortFn {
  cmd = cmd.reduce((h, c) => (h.concat(c)), [])
  // emptry arguments means to sort by default (Array.prototype.sort)
  if (cmd.length < 1) return undefined

  const sortFns = cmd.map((x, i) => {
    try {
      return isFn(x) ? <SortFn>x : generateSortFnFromStr(<string>x)
    } catch (error) {
      throw new Error(`[ERR] Error on generate sort function, Index ${i + 1}th: ${x}.`)
    }
  })

  const flat:
    (fns: SortFn[]) => SortFn =
    (fns => (a, b) => fns.reduce((sortResult: SortVal, fn: SortFn) => sortResult || fn(a, b), 0))

  return flat(sortFns)
}

/* Extensible */

const extendPlugins:
  (exts: {[key: string]: SortPlugin}) => void =
  (exts => Object.entries(exts).map(([k, v]) => plugins[k] = v))
factory.extends = extendPlugins

// TODO test type
// factory.extends('asdf')

/* Module Exports */

module.exports = factory
