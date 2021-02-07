type SortableTypeEnum = 'void' | 'string' | 'number' | 'date' | 'symbol' | 'boolean' | 'function'

const isVoid = (x: any): boolean => x == undefined
const isVoidType = (x: SortableTypeEnum): boolean => x === 'void'
const getType = (x: any): SortableTypeEnum => isVoid(x) ? 'void' : Object.prototype.toString.call(x).slice(8, -1).toLowerCase()
const isFn = (x: any): boolean => getType(x) === 'function'

// return void to skip sort, by example,
// [3,2,3].sort((a, b) => null) result in [3,2,3]
type SkipCompareValue = void
type ComparableValue = string | number | boolean | SkipCompareValue
type GetCompareValue = (x: any) => ComparableValue

// TODO refactor to function: x => comparableValue
/* get comparable value from specific value */
const getCompareValue: ({ [key: string]: GetCompareValue }) = {
  string: String,
  number: Number,
  date: (x: Date): number => +x,
  symbol: (x: Symbol): string => x.toString(),
  // The priority of true is greater than false
  boolean: (x: any): boolean => !x,
}

type Sort = SkipCompareValue | 1 | 0 | -1
type SortFn = (a: any, b: any) => Sort
type CondSortFn = (type: string) => SortFn

/* compare two value by some methods */
const by: ({ [key: string]: SortFn | CondSortFn }) = {
  default: (a: any, b: any) => {
    const typeA = getType(a)
    const typeB = getType(b)

    const onceEmpty = isVoidType(typeA) || isVoidType(typeB)
    if (onceEmpty) {
      if (typeA === typeB) return 0
      return a ? -1 : 1
    }

    const canSort = getCompareValue[typeA] && typeA === typeB
    if (!canSort) {
      console.warn(`[TIP] cannot sort ${a} with ${b}，skip by default`)
      return undefined
    }

    return by.type(typeA)(a, b)
  },
  type: type => (a, b) => {
    const Type = isFn(type) ? type : getCompareValue[type]
    if (!Type) throw new Error(`Error occured when compare value ${a} with value ${b}`)
    const va = Type(a), vb = Type(b)
    return va === vb ? 0 : (va < vb ? -1 : 1)
  }
}

// 排序实例，用来维护排序管道和排序方法
function Sort() {
  this.compare = null
  this.pipeline = []
}
// 给管道添加解构方法，用于解构对象并处理值
// @example
// sort.map(x => String(x.a))
// 从 x 中取得 a 属性并转换为字符串，再继续比较
Sort.prototype.map = function (_value) {
  this.pipeline.push({ _value, _type: 'map' })
  return this
}
// 给管道添加插件，用于调整排序动作
// @example
// sort.plugin(fn => (a, b) => -fn(a, b))
// 将上一个排序结果反转
Sort.prototype.plugin = function (_value) {
  this.pipeline.push({ _value, _type: 'plugin' })
  return this
}
// 设定排序方法，用来处理排序的值的顺序
Sort.prototype.sortby = function (fn) {
  this.compare = isFn(fn) ? fn : by.type(fn.toLowerCase())
}
// 空过程函数（接受一个函数，返回一个接受参数并返回该函数处理参数的结果的函数）
const pass = sortFn => (...args) => sortFn(...args)
// 将管道合并为函数
Sort.prototype.seal = function () {
  this.compare = this.compare || by.default

  const plugin = plug => sortFn => (...args) => plug(sortFn(...args))
  const mapping = map => sortFn => (...args) => sortFn(...args.map(x => map(x)))

  return this.pipeline.reduce((lastSortFn, current) => {
    const { _type, _value } = current
    if (_type === 'map') return mapping(lastSortFn(_value))
    if (_type === 'plugin') return plugin(_value)(lastSortFn)
  }, pass)(this.compare)
}

// 初始插件
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
      const paths = [...pathsStore]
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
function generate(s) {
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

/**
 * 初始化函数，根据传入的指令（或函数），获得对应的排序方法
 * @returns {function} sortFn 排序方法，可用于 Array.prototype.sort 参数
 * @todo 根据参数可选是否覆盖 Array.prototype.sort
 */
function factory(...cmd) {
  cmd = cmd.reduce((h, c) => (h.concat(c)), [])
  if (cmd.length < 1) return undefined

  const sortFns = cmd.map((x, i) => {
    try {
      return isFn(x) ? x : generate(x)
    } catch (error) {
      throw new Error(`Error on generate sort function, Index ${i + 1}th: ${x}.`)
    }
  })

  const flat = fns => (a, b) => fns.reduce((sortResult, fn) => sortResult || fn(a, b), 0)
  return flat(sortFns)
}

/**
 * 自定义插件
 * @todo 自定义排序逻辑
 */
factory.extends = function extendPlugin(exts = {}) {
  Object.entries(exts).map(([k, v]) => {
    plugins[k] = v
  })
}

module.exports = factory
