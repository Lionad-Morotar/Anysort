import {
  SortVal,
  SortFn,
  SortPlugin,
  SortCMD
} from './type'
import Sort from './Sort'
import { pass } from './Sort'
import { isVoid, isFn } from './utils'

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

/* Module Exports */

module.exports = factory
