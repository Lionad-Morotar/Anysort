type SortableTypeEnum = 'void' | 'string' | 'number' | 'date' | 'symbol' | 'boolean' | 'function'

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
type CondSortFn = (type: SortableTypeEnum) => SortFn

/* compare two value by some methods */
const by: ({ [key: string]: SortFn | CondSortFn }) = {
  default (a: any, b: any) {
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
    return by.type(typeA)(a, b)
  },
  type: (type: SortableTypeEnum): SortFn => (a: any, b: any): SortVal => {
    const getValFn = getCompareValue[type]
    if (!getValFn) throw new Error(`[ERR] Error occured when compare value ${a} with value ${b}`)
    const va = getValFn(a), vb = getValFn(b)
    return va === vb ? 0 : (va < vb ? -1 : 1)
  }
}

// 空过程函数（接受一个函数，返回一个接受参数并返回该函数处理参数的结果的函数）
const pass = sortFn => (...args) => sortFn(...args)

class Sort {
  compare: null
  pipeline: []
  constructor() {
    this.compare = null
    this.pipeline = []
  }
  // 给管道添加解构方法，用于解构对象并处理值
  // @example
  // sort.map(x => String(x.a))
  // 从 x 中取得 a 属性并转换为字符串，再继续比较
  map (_value) {
    this.pipeline.push({ _value, _type: 'map' })
    return this
  }
  // 给管道添加插件，用于调整排序动作
  // @example
  // sort.plugin(fn => (a, b) => -fn(a, b))
  // 将上一个排序结果反转
  plugin (_value) {
    this.pipeline.push({ _value, _type: 'plugin' })
    return this
  }
  // 设定排序方法，用来处理排序的值的顺序
  sortby = function (fn) {
    this.compare = isFn(fn) ? fn : by.type(fn.toLowerCase())
  }
  // 将管道合并为函数
  seal = function () {
    this.compare = this.compare || by.default

    const plugin = plug => sortFn => (...args) => plug(sortFn(...args))
    const mapping = map => sortFn => (...args) => sortFn(...args.map(x => map(x)))

    return this.pipeline.reduce((lastSortFn, current) => {
      const { _type, _value } = current
      if (_type === 'map') return mapping(lastSortFn(_value))
      if (_type === 'plugin') return plugin(_value)(lastSortFn)
    }, pass)(this.compare)
  }
}

// TODO refactor type
type SortInstance = any
type SortPlugin = (sort: SortInstance, args?: any) => void

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
function generateSortFnFromStr(s: string): SortFn {
  const sort = new Sort()

  let [...actions] = s.split('-')
  actions = actions.filter(x => x)
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
    (fns: SortFn[]) => (anyValA: any, antValB: any) => SortVal =
    (fns => (a, b) => fns.reduce((sortResult: SortVal, fn: SortFn) => sortResult || fn(a, b), 0))

  return flat(sortFns)
}

/* Extensible */

let extendPlugins:
  (exts: {[key: string]: SortPlugin}) => void =
  (exts => Object.entries(exts).map(([k, v]) => plugins[k] = v))
factory.extends = extendPlugins

// factory.extends('asdf')

/* Module Exports */

module.exports = factory
