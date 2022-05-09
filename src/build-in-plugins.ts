import Sort from './sort'
import { walk } from './utils'

import type {
  SortVal,
  SortPlugin,
  ComparableValue,
  PluginNames,
  PluginNamesWithArg,
  PluginNamesWithoutArg,
  PluginNamesWithArgMaybe
} from './type'

// TODO reduce compiled code size
// TODO plugin 'remap'
const plugins = {

  /* Plugins that change sort argument */

  i: (sort: Sort) => sort.map(x => {
    if (typeof x === 'string') return x.toLowerCase()
    else throw new Error('[ANYSORT] "i" plugin only works on string')
  }),
  is: (sort: Sort, arg: string) => {
    if (arg !== '') {
      return sort.map(x => x === arg)
    } else {
      throw new Error('[ANYSORT] "is" plugin need a string as arg')
    }
  },
  nth: (sort: Sort, arg: string) => {
    if (arg !== '') {
      return sort.map(x => {
        if (x instanceof Array) return x[+arg]
        if (typeof x === 'string') return x[+arg]
        else throw new Error('[ANYSORT] "nth" plugin only works on string or array')
      })
    } else {
      throw new Error('[ANYSORT] "nth" plugin need a string as arg')
    }
  },
  all: (sort: Sort, arg: string) => sort.map(x => {
    if (arg !== '') {
      if (x instanceof Array) return x.every(y => String(y) === arg)
      if (typeof x === 'string') return x === arg
      else throw new Error('[ANYSORT] "all" plugin only works on string or array')
    } else {
      throw new Error('[ANYSORT] "all" plugin need a string as arg')
    }
  }),
  has: (sort: Sort, arg: string) => sort.map(x => {
    if (arg !== '') {
      if (x instanceof Array) return x.some(y => String(y) === arg)
      if (typeof x === 'string') return x.includes(arg)
      else throw new Error('[ANYSORT] "has" plugin only works on string or array')
    } else {
      throw new Error('[ANYSORT] "has" plugin need a string as arg')
    }
  }),
  not: (sort: Sort, arg = '') => {
    if (arg !== '') {
      return sort.map(x => x !== arg)
    } else {
      return sort.map(x => !x)
    }
  },
  len: (sort: Sort, arg: string) => {
    if (arg !== '') {
      return sort.map(x => {
        if (x instanceof Array) return (x.length === +arg)
        if (typeof x === 'string') return (x.length === +arg)
        else throw new Error('[ANYSORT] "len" plugin only works on string or array')
      })
    } else {
      return sort.map(x => {
        if (x instanceof Array) return x.length
        if (typeof x === 'string') return x.length
        else throw new Error('[ANYSORT] "len" plugin only works on string or array')
      })
    }
  },
  get: (sort: Sort, arg: string) => {
    if (arg !== '') return sort.map(walk(arg))
    else throw new Error('[ANYSORT] "get" plugin must have a string argument')
  },

  /* Plugins that change sort order directly */

  reverse: (sort: Sort) => sort.result(res => -res as SortVal),
  rand: (sort: Sort) => sort.result(_ => Math.random() < 0.5 ? -1 : 1),

  /* Plugins for Proxy API */

  result: (sort: Sort) => sort.result(res => res)

}

export type BuildInPlugins = typeof plugins
export type BuildInPluginNames = PluginNames<BuildInPlugins>
export type BuildInPluginNamesWithoutArg = PluginNamesWithoutArg<BuildInPlugins>
export type BuildInPluginNamesWithArg = PluginNamesWithArg<BuildInPlugins>
export type BuildInPluginNamesWithArgMaybe = PluginNamesWithArgMaybe<BuildInPlugins>

type ReadonlyBuildInPlugins = Readonly<Record<keyof BuildInPlugins, SortPlugin>>

// TODO maybe better types next line
export type MappingFn = (x: any) => ComparableValue
export type ResultFn = (x: SortVal) => SortVal

export default plugins as ReadonlyBuildInPlugins
