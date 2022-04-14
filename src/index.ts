import { SortVal, SortFn, SortPlugin, SortCMD } from './type'

import Sort from './sort'
import { isFn, getValueFromPath, notNull } from './utils'

// build-in plugins
const plugins: { [k: string]: SortPlugin } = {

  /* Plugins that change sort argument */

  i: (sort: Sort) => sort.map(x => (x || '').toLowerCase()),
  is: (sort: Sort, arg: string) => sort.map(x => x === arg),
  all: (sort: Sort, arg: string) =>
    sort.map(x => x.every ? x.every(y => String(y) === arg) : x === arg),
  has: (sort: Sort, arg: string) =>
    sort.map(x => x instanceof Array
      ? x.some(y => String(y) === arg)
      : x.includes(arg)),
  not: (sort: Sort, arg: string) => sort.map(x => arg ? (x !== arg) : !x),
  len: (sort: Sort, arg: string) =>
    !arg.length ? sort.map(x => x.length) : sort.map(x => x.length === +arg),
  get: (sort: Sort, arg: string) => sort.map(getValueFromPath(arg.split('.'))),

  /* Plugins that change sort order directly */

  reverse: (sort: Sort) => sort.result(res => -res),
  rand: (sort: Sort) => sort.result(_ => Math.random() < 0.5 ? -1 : 1)
}

/**
 * generate SortFn from string command
 * @exam 'date-reverse()' would be a valid command,
 *        then would be split into 'date' and 'reverse()' plugin
 */
const genSortFnFromStrGen = (delim: string = '-') => (ss: string): SortFn => {
  const sort = new Sort()
  ss.split(delim)
    .filter(notNull)
    .map(action => {
      // if match with parens, it's a plugin, such as is(a)),
      // else it's a object path such as 'a.b'
      const [, name, callable, fnArg] = action.match(/([^(]+)(\(([^)]*)\))?/)
      callable
        ? sort.register(plugins[name], fnArg)
        : sort.register(plugins.get, name)
    })
  return sort.seal()
}
const genSortFnFromStr = genSortFnFromStrGen()

/**
 * main
 * @exam UnsortArray.sort(anysort(...cmds))
 * @exam anysort(UnsortArray, ...cmds)
 * @todo types override (3 ways to call anysort's factory function)
 *       1. function factory (arr: any[], cmds: SortCMD[]): any[];
 *       2. function factory (arr: any[], ...cmds: SortCMD[]): any[];
 *       3. function factory (...cmds: SortCMD[]): SortFn;
 */
function factory (arr: any[], ...args: SortCMD[]) {
  const isFirstArr = arr instanceof Array
  const cmds = (isFirstArr ? args : [].concat(arr).concat(args))
    .reduce((h, c) => (h.concat(c)), [])
    .filter(Boolean)

  // * for debug
  // console.log('@@', args, '=>', cmds)

  const sortFns = cmds.length === 0
    ? [new Sort().seal()]
    : cmds.map((x: SortCMD, i: number) => {
      try {
        return isFn(x) ? <SortFn>x : genSortFnFromStr(<string>x)
      } catch (err) {
        throw new Error(`[ERR] Error on generate sort function, Index ${i + 1}th: ${x}, error: ${err}`)
      }
    })

  const flat:
    (fns: SortFn[]) => SortFn =
    fns => (a, b) => fns.reduce((sortResult: SortVal, fn: SortFn) => sortResult || fn(a, b), 0)
  const flattenCMDs = flat(sortFns)

  return isFirstArr
    ? arr.sort(flattenCMDs)
    : flattenCMDs
}

// install plugins for Sort
const extendPlugins:
  (exts: {[key: string]: SortPlugin}) => void =
  exts => Object.entries(exts).map(([k, v]) => plugins[k] = v)

/**
 * Module Exports
 */
factory.extends = extendPlugins
factory.genSortFnFromStrGen = genSortFnFromStrGen
module.exports = factory
