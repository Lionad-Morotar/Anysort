// 检查某个值是否为 null 或 undefined
const isVoid = x => x == undefined

// 比较值的大小的方法
const compareEnum = {
  // todo refactor localeCompare ?
  string: (a, b) => String(a) === String(b) ? 0 : (String(a) < String(b) ? -1 : 1),
  number: (a, b) => +a - +b,
  bool: (a, b) => +a === +b ? 0 : (+a < +b ? 1 : -1),
  default: (a, b) => {
    const isVoidA = isVoid(a)
    const isVoidB = isVoid(b)
    if (!isVoidA && !isVoidB) {
      const type = typeof a
      const canSort = compareEnum[type] && type === typeof b
      return canSort
        ? compareEnum[type](a, b)
        : (console.warn(`[TIP] 不能排序对 ${a} 和 ${b} 排序，忽略此次比较。你可以传入自定义排序函数对对象进行排序。`), undefined)
    }
    return (isVoidA && isVoidB) ? 0 : (isVoidA ? 1 : -1)
  }
}

// 用来保存 Mapping、Plugin 和 Sort 方法
function Sort(fn) {
  this.compare = null
  this.pipeline = []
  fn && this.map(fn)
}
Sort.prototype.map = function (fn) {
  this.pipeline.push({
    _type: 'map',
    _value: fn
  })
  return this
}
Sort.prototype.plugin = function (fn) {
  this.pipeline.push({
    _type: 'plugin',
    _value: fn
  })
  return this
}
Sort.prototype.sortby = function (fn) {
  this.compare = compareEnum[fn] || fn
  return this
}
Sort.prototype.seal = function () {

  // console.log(this.pipeline)

  this.compare = this.compare || compareEnum.default

  const pass = piped => (...args) => piped(...args)
  const plugin = plug => piped => (...args) => plug(piped(...args))
  const mapping = map => piped => (...args) => piped(...args.map(x => map(x)))

  // return this.pipeline[1]._value(mapping(this.pipeline[0]._value)(this.pipeline[2]._value))

  return this.pipeline.reduce((last, piped) => {
    const { _type: type, _value: value } = piped
    switch (type) {
      case 'map':
        return mapping(last(value))
      case 'plugin':
        return plugin(value)(last)
    }
  }, pass)(this.compare)
}

const pass = piped => (...args) => piped(...args)
const plugins = {
  asc: sort => sort.plugin(pass),
  // FIXME
  dec: sort => sort.plugin(last => (...args) => -last(...args)),
  is: (sort, args = '') => sort.map(x => x === args).sortby('bool'),
  not: (sort, args = '') => sort.map(x => x !== args).sortby('bool'),
  has: (sort, args) => sort.map(x => x.includes(args)).sortby('bool'),
  // todo change to symbol
  default: name => {
    // todo property fallback to plugin
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

/**
 * 从指令中得到排序函数（排序管道中的一个函数）
 * @param {string} s
 * @todo 直接传入排序函数
 */
function generate(s) {
  if (s instanceof Function) return s
  const sort = new Sort()
  let [...actions] = s.split('-')
  actions = actions.filter(x => x)
    .map(action => {
      const [all, name, argsWithQuote, args] = action.match(/([^(]+)(\(([^)]*)\))?/)
      const plugin = argsWithQuote
        ? plugins[name]
        : plugins.default(name)
      plugin(sort, args)
    })
  return sort.seal()
}

/**
 * 初始化函数，根据传入的指令（或函数），获得对应的排序方法（或排序插件）
 * @returns {function} sortFn 排序方法，可用于 Array.prototype.sort 参数
 * @todo 根据参数可选是否覆盖 Array.prototype.sort
 */
function factory(...cmd) {
  cmd = cmd.reduce((h, c) => (h.concat(c)), [])
  if (cmd.length < 1) return undefined

  const sortFns = cmd.map(x => generate(x))

  const flat = fns => (a, b) => fns.reduce((sortResult, fn) => sortResult || fn(a, b), 0)
  return flat(sortFns)
}

module.exports = factory
