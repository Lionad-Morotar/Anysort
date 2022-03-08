import {
  SortVal,
  SortFn,
  SortPlugin,
  SortCMD
} from './type'

import Sort from './Sort'
import { pass } from './Sort'
import { isVoid, isFn, getValueFromPath, notNull } from './utils'

/**
 * default plugins
 */
const plugins = {
  // by: (sort, args) => sort.sortby(args),
  // i: sort => sort.map(x => (x || '').toLowerCase()),
  // asc: sort => sort.plugin(pass),
  // dec: sort => sort.plugin(fn => (...args) => -fn(...args)),
  // rand: sort => sort.plugin(() => () => Math.random() < .5 ? -1 : 1),
  // is: (sort, args = '') => sort.map(x => x === args).sortby('boolean'),
  // all: (sort, args = '') => sort.map(x => x.every ? x.every(y => String(y) === args) : x === args).sortby('boolean'),
  // has: (sort, args) => sort.map(x => x.some(y => String(y) === args)).sortby('boolean'),
  // not: (sort, args = '') => sort.map(x => args ? (x !== args) : !x).sortby('boolean'),
  // len: (sort, args = null) => isVoid(args)
  //   ? sort.map(x => x.length).sortby('number')
  //   : sort.map(x => x.length === args).sortby('boolean'),

  getValue: (name: string) => (sort: Sort) => sort.map(getValueFromPath(name.split('.')))
}

/**
 * generate SortFn from string
 */
function generateSortFnFromStr(ss: string): SortFn {
  const sort = new Sort()
  ss.split('-')
    .filter(notNull)
    .map(action => {
      const [, fnName, argsWithParen, args] = action.match(/([^(]+)(\(([^)]*)\))?/)
      const plugin = argsWithParen
        ? plugins[fnName]
        : plugins.getValue(fnName)
      plugin(sort, args || undefined)
    })
  return sort.seal()
}


/**
 * main
 * @todo anysort(Array)
 */
function factory(...cmd: SortCMD[]): SortFn {
  // flatten
  // TODO perf count
  cmd = cmd.reduce((h, c) => (h.concat(c)), [])
  // sort by default if no arguments
  if (cmd.length === 0) return undefined

  const sortFns = cmd.map((x, i) => {
    try {
      return isFn(x) ? <SortFn>x : generateSortFnFromStr(<string>x)
    } catch (err) {
      throw new Error(`[ERR] Error on generate sort function, Index ${i + 1}th: ${x}, error: ${err}`)
    }
  })

  const flat:
    (fns: SortFn[]) => SortFn =
    (fns => (a, b) => fns.reduce((sortResult: SortVal, fn: SortFn) => sortResult || fn(a, b), 0))

  return flat(sortFns)
}

/**
 * install plugins for SortCMD strings
 */
const extendPlugins:
  (exts: {[key: string]: SortPlugin}) => void =
  (exts => Object.entries(exts).map(([k, v]) => plugins[k] = v))
factory.extends = extendPlugins

/* Module Exports */

module.exports = factory
