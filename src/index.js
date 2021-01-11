const isVoid = x => x == undefined
const getType = x => isVoid(x) ? 'void' : Object.prototype.toString.call(x).slice(8, -1).toLowerCase()
const isFn = x => getType(x) === 'function'

const constructor = {
  date: x => +x,
  string: String,
  number: Number,
  // The priority of true is greater than false
  boolean: x => !x,
  symbol: x => x.toString()
}

// 比较值的大小的方法
const by = {
  default: (a, b) => {
    const typeA = getType(a)
    const typeB = getType(b)
    if (typeA === 'void' || typeB === 'void') {
      return by.void(a, b, typeA, typeB)
    } else {
      const canSort = constructor[typeA] && typeA === typeB
      !canSort && console.warn(`[TIP] 不能排序对 ${a} 和 ${b} 排序，忽略此次比较。你可以传入自定义排序函数对对象进行排序。`)
      return canSort
        ? by.type(typeA)(a, b)
        : undefined
    }
  },
  type: type => (a, b) => {
    const Type = isFn(type) ? type : constructor[type]
    if (!Type) throw new Error(`Error occured when compare value ${a} with value ${b}`)
    const va = Type(a), vb = Type(b)
    return va === vb ? 0 : (va < vb ? -1 : 1)
  },
  void: (a, b, ta, tb) => {
    if (ta === tb) return 0
    if (a) return -1
    if (b) return 1
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
  i: (sort, args = '') => sort.map(x => (x || '').toLowerCase()),
  by: (sort, args) => sort.sortby(args),
  asc: sort => sort.plugin(pass),
  dec: sort => sort.plugin(fn => (...args) => -fn(...args)),
  rand: sort => sort.plugin(() => () => Math.random() < .5 ? -1 : 1),
  is: (sort, args = '') => sort.map(x => x === args).sortby('boolean'),
  all: (sort, args = '') => sort.map(x => x.every(y => y === args)).sortby('boolean'),
  has: (sort, args) => sort.map(x => x.includes(args)).sortby('boolean'),
  not: (sort, args = '') => sort.map(x => args ? (x !== args) : !x).sortby('boolean'),
  len: (sort, args = null) => isVoid(args)
    ? sort.map(x => x.length).sortby('number')
    : sort.map(x => x.length === args).sortby('boolean'),

  // 默认使用解构插件，处理对象的属性如 'a.b.c' 的值
  default: name => {
    const pathsStore = name.split('.')
    const getVal = x => {
      const paths = [...pathsStore]
      let val = x
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

module.exports = factory
