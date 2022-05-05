import Sort from './sort'
import plugins from './build-in-plugins'
import config from './config'
import { isFn, notNull, getValsFrom } from './utils'

import type { Anysort, SortVal, SortFn, SortStringCMD, SortCMD, SortPlugin } from './type'

/**
 * generate SortFn from string command
 * @exam 'date-reverse()' would be a valid command,
 *        it would be split into 'date', 'reverse()'  two plugins
 */
function genSortFnFromStr<CMD> (ss: SortStringCMD<CMD>) {
  const sort = new Sort()
  ss.split(config.delim)
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

// const testCMD1: SortStringCMD<string> = 'date-reverse()'
// console.log(testCMD1)
const testCMD2 = genSortFnFromStr('date-reverse()')
console.log(testCMD2)

function wrapperProxy<CMD> (arr: any[]): any[] {
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
        return (...args: SortCMD<CMD>[]) => factory(target, ...args)
      }
      if (prop === 'sort') {
        return (arg: SortFn) => factory(target, arg)
      }
      if (Object.prototype.hasOwnProperty.call(plugins, prop)) {
        // TODO check typeof arg
        return (arg: string = '') => {
          const cmdName = [getValsFrom(pathStore).join('.'), prop].join('-')
          const cmd = `${cmdName}(${String(arg)})`
          return factory(target, cmd as SortStringCMD<CMD>)
        }
      }
      if (prop in target) {
        return target[prop]
      }
      if (prop.includes('_')) {
        return (arg: string = '') => {
          const cmdName = [getValsFrom(pathStore).join('.'), prop].join('-')
          const cmd = `${cmdName.replace('_', '()-')}(${String(arg)})`
          return factory(target, cmd as SortStringCMD<CMD>)
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
 * @todo fix types AnysortFactory
 */
function factory<CMD> (arr: any[], ...cmds: SortCMD<CMD>[]) {
  const filteredCMDs = cmds
    .reduce((h, c) => (h.concat(c)), [])
    .filter(Boolean)

  const isEmptyCMDs = filteredCMDs.length === 0
  if (isEmptyCMDs && !config.autoSort) {
    if (config.autoWrap) {
      return wrapperProxy<CMD>(arr)
    } else {
      return arr
    }
  }

  const sortFns = isEmptyCMDs
    ? [new Sort().seal()]
    : filteredCMDs.map((x: SortCMD<CMD>, i: number) => {
      try {
        return isFn(x) ? <SortFn>x : genSortFnFromStr(<SortStringCMD<CMD>>x)
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
  return factory as Anysort<unknown>
}

/**
 * Module Exports
 */
;(factory as Anysort<unknown>).extends = extendPlugs
;(factory as Anysort<unknown>).wrap = (arr: any[]) => wrapperProxy(arr)
;(factory as Anysort<unknown>).config = config
module.exports = factory as Anysort<unknown>

const testFactory = factory([], 'data-reverse()')
console.log(testFactory)
