import Sort from './sort'
import plugins from './build-in-plugins'
import config from './config'
import { isFn, notNull } from './utils'

import type { Anysort, AnySortWrapper, SortVal, SortFn, SortStringCMD, SortCMD, isSortPluginObjects } from './type'
import type { BuildInPlugins } from './build-in-plugins'

/**
 * generate SortFn from string command
 * @exam 'date-reverse()' would be a valid command,
 *        it would be split into 'date', 'reverse()'  two plugins
 */
function genSortFnFromStr<
  Plugins,
  ARR extends unknown[],
  CMD
> (ss: SortStringCMD<Plugins, ARR, CMD>) {
  const sort = new Sort()
  ss.split(config.delim)
    .filter(notNull)
    .map(action => {
      // if match with parens, it's a plugin, such as is(a)),
      // else it's a object path such as 'a.b'
      const matchRes = action.match(/^([^(]+)(\(([^)]*)\))?$/)
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

function wrapperProxy<
  Plugins,
  ARR extends any[],
  CMD = ''
> (arr: ARR): AnySortWrapper<Plugins, ARR> {
  if (arr[config.patched]) {
    throw new Error('[ANYSORT] patched arr cant be wrapped again')
  }
  let proxy: AnySortWrapper<Plugins, ARR> | null = null
  const pathStore: string[] = []
  return (proxy = new Proxy(arr, {
    get (target, prop: string) {
      switch (prop) {
        case config.patched:
          return true
        case 'apply':
          return (...args: SortCMD<Plugins, ARR, CMD>[]) => (factory as Anysort<Plugins>)(target, ...args)
        default:
          if (Object.prototype.hasOwnProperty.call(plugins, prop)) {
            // TODO check typeof arg
            return (arg: string = '') => {
              const cmdName = [pathStore.splice(0, pathStore.length).join('.'), prop].join('-')
              const cmd = `${cmdName}(${String(arg)})`
              return (factory as Anysort<Plugins>)(target, cmd as SortCMD<Plugins, ARR, CMD>)
            }
          }
          if (prop in target) {
            return target[prop]
          }
          // being considered for deprecation
          if (prop.includes('_')) {
            return (arg: string = '') => {
              const cmdName = [pathStore.splice(0, pathStore.length).join('.'), prop].join('-')
              const cmd = `${cmdName.replace('_', '()-')}(${String(arg)})`
              return (factory as Anysort<Plugins>)(target, cmd as SortCMD<Plugins, ARR, CMD>)
            }
          }
          pathStore.push(prop)
          return proxy
      }
    }
  }) as unknown as AnySortWrapper<Plugins, ARR>)
}

/**
 * main
 */
function genFactory<Plugins> () {
  const factory = <ARR extends unknown[], CMD> (arr: ARR, ...cmds: SortCMD<Plugins, ARR, CMD>[]): AnySortWrapper<Plugins, ARR> => {
    const filteredCMDs = cmds
      .reduce((h, c) => (h.concat(c)), <SortCMD<Plugins, ARR, CMD>[]>[])
      .filter(Boolean)

    const isEmptyCMDs = filteredCMDs.length === 0
    if (isEmptyCMDs && !config.autoSort) {
      if (config.autoWrap) {
        return wrapperProxy<Plugins, ARR, CMD>(arr)
      } else {
        // !FIXME fix type
        return arr as AnySortWrapper<Plugins, ARR>
      }
    }

    const sortFns = isEmptyCMDs
      ? [new Sort().seal()]
      : filteredCMDs.map((x: SortCMD<Plugins, ARR, CMD>, i: number) => {
        return isFn(x)
          ? <SortFn<ARR>>x
          : genSortFnFromStr<Plugins, ARR, CMD>(<SortStringCMD<Plugins, ARR, CMD>>x)
      })

    const flat:
      (fns: SortFn<ARR>[]) => SortFn<ARR> =
      fns => ((a, b) => fns.reduce((sortResult: SortVal, fn: SortFn<ARR>) => (sortResult || fn(a, b)) as SortVal, 0)) as SortFn<ARR>
    const flattenCMDs = flat(sortFns as SortFn<ARR>[])

    type NormalSort = (a: any, b: any) => number
    let result = arr.sort(flattenCMDs as NormalSort)
    if (config.autoWrap) {
      if (!result[config.patched]) {
        result = wrapperProxy(result)
      }
    }

    return result as AnySortWrapper<Plugins, ARR>
  }
  return factory as Anysort<Plugins>
}
const factory = genFactory<BuildInPlugins>()

// install plugins
const extendPlugs = <U>(exts: isSortPluginObjects<U>) => {
  Object.entries(exts).map(([k, v]) => plugins[k] = v)
  type ExtPlugins = { [K in keyof typeof exts]: typeof exts[K] }
  return factory as Anysort<ExtPlugins & BuildInPlugins>
}

/**
 * Module Exports
 */
;(factory as Anysort<BuildInPlugins>).extends = extendPlugs
;(factory as Anysort<BuildInPlugins>).wrap = arr => wrapperProxy(arr)
;(factory as Anysort<BuildInPlugins>).config = config

export default factory as Anysort<BuildInPlugins>
