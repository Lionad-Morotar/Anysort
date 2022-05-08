import Sort from './sort'
import plugins from './build-in-plugins'
import config from './config'
import { isFn, notNull } from './utils'

import type { Anysort, AnySortWrapper, SortVal, SortFn, SortStringCMD, SortCMD, SortPlugin } from './type'
import type { PluginNames, PluginNamesWithArgMaybe, PluginNamesWithoutArg } from './build-in-plugins'
import type { RequiredArguments } from './type-utils'

type PS1 = PluginNames
type PS2 = PluginNamesWithArgMaybe
type PS3 = PluginNamesWithoutArg

/**
 * generate SortFn from string command
 * @exam 'date-reverse()' would be a valid command,
 *        it would be split into 'date', 'reverse()'  two plugins
 */
function genSortFnFromStr<
  PS1, PS2, PS3,
  ARR extends unknown[],
  CMD
> (ss: SortStringCMD<PS1, PS2, PS3, ARR, CMD>) {
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

function wrapperProxy<
  PS1, PS2, PS3,
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
      switch (prop) {
        case config.patched:
          return true
        case 'apply':
          return (...args: SortCMD<PS1, PS2, PS3, ARR, CMD>[]) => (factory as Anysort<PS1, PS2, PS3>)(target, ...args)
        case 'sort':
          return (arg: SortFn<ARR>) => factory(target, arg)
        default:
          if (Object.prototype.hasOwnProperty.call(plugins, prop)) {
            // TODO check typeof arg
            return (arg: string = '') => {
              const cmdName = [pathStore.splice(0, pathStore.length).join('.'), prop].join('-')
              const cmd = `${cmdName}(${String(arg)})`
              return (factory as Anysort<PS1, PS2, PS3>)(target, cmd as SortCMD<PS1, PS2, PS3, ARR, CMD>)
            }
          }
          if (prop in target) {
            return target[prop]
          }
          if (prop.includes('_')) {
            return (arg: string = '') => {
              const cmdName = [pathStore.splice(0, pathStore.length).join('.'), prop].join('-')
              const cmd = `${cmdName.replace('_', '()-')}(${String(arg)})`
              return (factory as Anysort<PS1, PS2, PS3>)(target, cmd as SortCMD<PS1, PS2, PS3, ARR, CMD>)
            }
          }
          pathStore.push(prop)
          return proxy
      }
    }
  }) as unknown as AnySortWrapper<ARR>)
}

/**
 * main
 */
function genFactory<
  PS1 extends PluginNames,
  PS2 extends PluginNamesWithArgMaybe,
  PS3 extends PluginNamesWithoutArg,
> () {
  const factory = <ARR extends unknown[], CMD> (arr: ARR, ...cmds: SortCMD<PS1, PS2, PS3, ARR, CMD>[]): AnySortWrapper<ARR> => {
    const filteredCMDs = cmds
      .reduce((h, c) => (h.concat(c)), <SortCMD<PS1, PS2, PS3, ARR, CMD>[]>[])
      .filter(Boolean)

    const isEmptyCMDs = filteredCMDs.length === 0
    if (isEmptyCMDs && !config.autoSort) {
      if (config.autoWrap) {
        return wrapperProxy<PS1, PS2, PS3, ARR, CMD>(arr)
      } else {
        return arr
      }
    }

    const sortFns = isEmptyCMDs
      ? [new Sort().seal()]
      : filteredCMDs.map((x: SortCMD<PS1, PS2, PS3, ARR, CMD>, i: number) => {
        try {
          return isFn(x) ? <SortFn<ARR>>x : genSortFnFromStr<PS1, PS2, PS3, ARR, CMD>(<SortStringCMD<PS1, PS2, PS3, ARR, CMD>>x)
        } catch (err) {
          throw new Error(`[ERR] Error on generate sort function, Index ${i + 1}th: ${x}, error: ${err}`)
        }
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

    return result
  }
  return factory as Anysort<PS1, PS2, PS3>
}
const factory = genFactory<PS1, PS2, PS3>()

// install plugins
const extendPlugs = <PluginName extends string>(exts: Record<PluginName, SortPlugin>) => {
  type ExtsPluginsLiteralTypes = { [K in keyof typeof exts]: typeof exts[K] }
  type ExtsPluginsCallMaybeWithArg = { [K in keyof ExtsPluginsLiteralTypes as RequiredArguments<ExtsPluginsLiteralTypes[K]> extends (_: any) => any ? never : K]: any }
  type ExtsPluginNames = Exclude<keyof typeof exts, never>
  type ExtsPluginNamesWithArgMaybe = Exclude<keyof ExtsPluginsCallMaybeWithArg, never>
  type ExtsPluginNamesWithoutArg = Exclude<ExtsPluginNames, ExtsPluginNamesWithArgMaybe>
  type ExtendedAnysort = Anysort<PS1 | ExtsPluginNames, PS2 | ExtsPluginNamesWithArgMaybe, PS3 | ExtsPluginNamesWithoutArg>

  Object.entries(exts).map(([k, v]) => plugins[k] = v)
  return factory as ExtendedAnysort
}

/**
 * Module Exports
 */
;(factory as Anysort<PS1, PS2, PS3>).extends = extendPlugs
;(factory as Anysort<PS1, PS2, PS3>).wrap = arr => wrapperProxy(arr)
;(factory as Anysort<PS1, PS2, PS3>).config = config

export default factory as Anysort<PS1, PS2, PS3>
