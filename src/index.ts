import Sort from './sort'
import plugins from './build-in-plugins'
import config from './config'
import { isFn, notNull, getValsFrom } from './utils'

import type { Anysort, AnysortFactory, SortVal, SortFn, SortCMD, SortPlugin } from './type'

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

const wrapperProxy = (arr: any[]): any[] => {
  if (arr[config.patched]) {
    throw new Error('[ANYSORT] patched arr cant be wrapped again')
  }
  let proxy = null
  const pathStore: string[] = []
  return (proxy = new Proxy(arr, {
    get (target, prop: string) {
      if (prop === config.patched) {
        return true
      }
      if (prop === 'apply') {
        return (...args: SortCMD[]) => factory(target, ...args)
      }
      if (prop === 'sort') {
        return (arg: SortFn) => factory(target, arg)
      }
      if (Object.prototype.hasOwnProperty.call(plugins, prop)) {
        // TODO check typeof arg
        return (arg: string = '') => {
          const cmdName = [getValsFrom(pathStore).join('.'), prop].join('-')
          const cmd = `${cmdName}(${String(arg)})`
          return factory(target, cmd)
        }
      }
      if (prop in target) {
        return target[prop]
      }
      if (prop.includes('_')) {
        return (arg: string = '') => {
          const cmdName = [getValsFrom(pathStore).join('.'), prop].join('-')
          const cmd = `${cmdName.replace('_', '()-')}(${String(arg)})`
          return factory(target, cmd)
        }
      }
      pathStore.push(prop)
      return proxy
    }
  }))
}

/**
 * main
 * @exam 3 ways to use anysort
 *       1. anysort(arr: any[], args: SortCMD[]) => any[];
 *       2. anysort(arr: any[], ...args: SortCMD[]) => any[];
 *       3. anysort(arr: any[]) => any[]
 * @todo fix types
 */
// @ts-ignore
const factory: AnysortFactory = (arr: any[], ...cmds: SortCMD[]) => {
  const filteredCMDs = cmds
    .reduce((h, c) => (h.concat(c)), [])
    .filter(Boolean)

  const isEmptyCMDs = filteredCMDs.length === 0
  if (isEmptyCMDs && !config.autoSort) {
    if (config.autoWrap) {
      return wrapperProxy(arr)
    } else {
      return arr
    }
  }

  const sortFns = isEmptyCMDs
    ? [new Sort().seal()]
    : filteredCMDs.map((x: SortCMD, i: number) => {
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

  let result = arr.sort(flattenCMDs)
  if (config.autoWrap) {
    if (!result[config.patched]) {
      result = wrapperProxy(result as any[])
    }
  }

  return result
}

// install plugins for Sort
const extendPlugs = (exts: Record<string, SortPlugin>) => {
  Object.entries(exts).map(([k, v]) => plugins[k] = v)
  return factory as Anysort
}

/**
 * Module Exports
 */
;(factory as Anysort).extends = extendPlugs
;(factory as Anysort).genSortFnFromStrGen = genSortFnFromStrGen
;(factory as Anysort).wrap = (arr: any[]) => wrapperProxy(arr)
;(factory as Anysort).config = config
module.exports = factory
