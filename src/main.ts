import Sort from './sort'
import plugins from './build-in-plugins'
import config from './config'
import { isFn, notNull } from './utils'

import type { Anysort, SortVal, SortFn, SortStringCMD, SortCMD, SortPlugin } from './type'
import type { PluginNames, PluginNamesWithArgMaybe, PluginNamesWithoutArg } from './build-in-plugins'

type P1 = PluginNames
type P2 = PluginNamesWithArgMaybe
type P3 = PluginNamesWithoutArg

/**
 * generate SortFn from string command
 * @exam 'date-reverse()' would be a valid command,
 *        it would be split into 'date', 'reverse()'  two plugins
 */
function genSortFnFromStr<
  P1 extends PluginNames,
  P2 extends PluginNamesWithArgMaybe,
  P3 extends PluginNamesWithoutArg,
  ARR extends unknown[],
  CMD
> (ss: SortStringCMD<P1, P2, P3, ARR, CMD>) {
  const sort = new Sort()
  ss.split(config.delim)
    .filter(notNull)
    .map(action => {
      // if match with parens, it's a plugin, such as is(a)),
      // else it's a object path such as 'a.b'
      const matchRes = action.match(/([^(]+)(\(([^)]*)\))?/)
      if (matchRes) {
        const [, name, callable, fnArg] = matchRes
        callable
          ? sort.register(plugins[name], fnArg)
          : sort.register(plugins.get, name)
      } else {
        throw new Error(`[ANYSORT] illegal command: ${ss}`)
      }
    })
  return sort.seal()
}

type AnySortWrapper<ARR> = ARR

function wrapperProxy<
  P1 extends PluginNames,
  P2 extends PluginNamesWithArgMaybe,
  P3 extends PluginNamesWithoutArg,
  ARR extends any[],
  CMD = ''
> (arr: ARR): AnySortWrapper<ARR> {
  if (arr[config.patched]) {
    throw new Error('[ANYSORT] patched arr cant be wrapped again')
  }
  let proxy: AnySortWrapper<ARR> | null = null
  const pathStore: string[] = []
  return (proxy = new Proxy(arr, {
    get (target, prop: string) {
      if (prop === config.patched) {
        return true
      }
      if (prop === 'apply') {
        return (...args: SortCMD<P1, P2, P3, ARR, CMD>[]) =>
          factory(target, ...args as unknown as SortCMD<PluginNames, PluginNamesWithArgMaybe, PluginNamesWithoutArg, ARR, CMD>[])
      }
      if (prop === 'sort') {
        return (arg: SortFn) =>
          factory(target, arg as unknown as SortCMD<PluginNames, PluginNamesWithArgMaybe, PluginNamesWithoutArg, ARR, CMD>)
      }
      if (Object.prototype.hasOwnProperty.call(plugins, prop)) {
        // TODO check typeof arg
        return (arg: string = '') => {
          const cmdName = [pathStore.splice(0, pathStore.length).join('.'), prop].join('-')
          const cmd = `${cmdName}(${String(arg)})`
          return factory(target, cmd as unknown as SortCMD<PluginNames, PluginNamesWithArgMaybe, PluginNamesWithoutArg, ARR, CMD>)
        }
      }
      if (prop in target) {
        return target[prop]
      }
      if (prop.includes('_')) {
        return (arg: string = '') => {
          const cmdName = [pathStore.splice(0, pathStore.length).join('.'), prop].join('-')
          const cmd = `${cmdName.replace('_', '()-')}(${String(arg)})`
          return factory(target, cmd as unknown as SortCMD<PluginNames, PluginNamesWithArgMaybe, PluginNamesWithoutArg, ARR, CMD>)
        }
      }
      pathStore.push(prop)
      return proxy
    }
  }) as unknown as AnySortWrapper<ARR>)
}

/**
 * main
 * @exam 3 ways to use anysort
 *       1. anysort(arr: any[], args: SortCMD[]) => any[];
 *       2. anysort(arr: any[], ...args: SortCMD[]) => any[];
 *       3. anysort(arr: any[]) => any[]
 */
function genFactory<
  P1 extends PluginNames,
  P2 extends PluginNamesWithArgMaybe,
  P3 extends PluginNamesWithoutArg,
> () {
  const factory = <ARR extends unknown[], CMD> (arr: ARR, ...cmds: SortCMD<P1, P2, P3, ARR, CMD>[]): ARR => {
    const filteredCMDs = cmds
      .reduce((h, c) => (h.concat(c)), <SortCMD<P1, P2, P3, ARR, CMD>[]>[])
      .filter(Boolean)

    const isEmptyCMDs = filteredCMDs.length === 0
    if (isEmptyCMDs && !config.autoSort) {
      if (config.autoWrap) {
        return wrapperProxy<P1, P2, P3, ARR, CMD>(arr)
      } else {
        return arr
      }
    }

    const sortFns = isEmptyCMDs
      ? [new Sort().seal()]
      : filteredCMDs.map((x: SortCMD<P1, P2, P3, ARR, CMD>, i: number) => {
        try {
          return isFn(x) ? <SortFn>x : genSortFnFromStr<P1, P2, P3, ARR, CMD>(<SortStringCMD<P1, P2, P3, ARR, CMD>>x)
        } catch (err) {
          throw new Error(`[ERR] Error on generate sort function, Index ${i + 1}th: ${x}, error: ${err}`)
        }
      })

    const flat:
      (fns: SortFn[]) => SortFn =
      fns => (a, b) => fns.reduce((sortResult: SortVal, fn: SortFn) => (sortResult || fn(a, b)) as SortVal, 0)
    const flattenCMDs = flat(sortFns)

    type NormalSort = (a: any, b: any) => number
    let result = arr.sort(flattenCMDs as NormalSort)
    if (config.autoWrap) {
      if (!result[config.patched]) {
        result = wrapperProxy(result)
      }
    }

    return result
  }
  return factory as Anysort<P1, P2, P3>
}
const factory = genFactory<P1, P2, P3>()

// install plugins
// TODO fix type
const extendPlugs = <PluginName extends string>(exts: Record<PluginName, SortPlugin>) => {
  Object.entries(exts).map(([k, v]) => plugins[k] = v)
  return factory as Anysort<P1, P2, P3>
}

/**
 * Module Exports
 */
;(factory as Anysort<P1, P2, P3>).extends = extendPlugs
;(factory as Anysort<P1, P2, P3>).wrap = arr => wrapperProxy(arr)
;(factory as Anysort<P1, P2, P3>).config = config

export default factory as Anysort<P1, P2, P3>
