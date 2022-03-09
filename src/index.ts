import { SortVal, SortFn, SortPlugin, SortCMD } from './type'

import Sort from './Sort'
import { isFn, getValueFromPath, notNull } from './utils'

/**
 * build-in plugins
 */
const plugins = {
  i: sort => sort.map(x => (x || '').toLowerCase()),
  reverse: sort => sort.result(res => -res),
  rand: sort => sort.result(_ => Math.random() < 0.5 ? -1 : 1),
  is: (sort, arg) => sort.map(x => x === arg),
  all: (sort, arg) => sort.map(x => x.every
    ? x.every(y => String(y) === arg)
    : x === arg),
  has: (sort, arg) => sort.map(x => x instanceof Array
    ? x.some(y => String(y) === arg)
    : x.includes(arg)),
  not: (sort, arg) => sort.map(x => arg
    ? (x !== arg)
    : !x),
  len: (sort, arg) => !arg.length
    ? sort.map(x => x.length)
    : sort.map(x => x.length === +arg),
  getValue: (paths: string) => sort => sort.map(getValueFromPath(paths.split('.')))
}

/**
 * generate SortFn from string
 */
function generateSortFnFromStr (ss: string): SortFn {
  const sort = new Sort()
  ss.split('-')
    .filter(notNull)
    .map(action => {
      // TODO args
      const [, fnName, argsWithParen, arg] = action.match(/([^(]+)(\(([^)]*)\))?/)
      const plugin = argsWithParen
        ? plugins[fnName]
        : plugins.getValue(fnName)
      // the default value of arg is empty string because the value cames from regex matching
      plugin(sort, arg)
    })
  return sort.seal()
}

/**
 * main
 * @todo anysort(Array)
 */
function factory (...cmd: SortCMD[]): SortFn {
  // flatten
  // TODO perf count
  cmd = cmd.reduce((h, c) => (h.concat(c)), [])

  const sortFns = cmd.length === 0
    ? [new Sort().seal()]
    : cmd.map((x, i) => {
      try {
        return isFn(x) ? <SortFn>x : generateSortFnFromStr(<string>x)
      } catch (err) {
        throw new Error(`[ERR] Error on generate sort function, Index ${i + 1}th: ${x}, error: ${err}`)
      }
    })

  const flat:
    (fns: SortFn[]) => SortFn =
    fns => (a, b) => fns.reduce((sortResult: SortVal, fn: SortFn) => sortResult || fn(a, b), 0)

  return flat(sortFns)
}

/**
 * install plugins for SortCMD strings
 */
const extendPlugins:
  (exts: {[key: string]: SortPlugin}) => void =
  exts => Object.entries(exts).map(([k, v]) => plugins[k] = v)
factory.extends = extendPlugins

/* Module Exports */

module.exports = factory
