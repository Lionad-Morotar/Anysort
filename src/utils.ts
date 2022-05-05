import type { SortableTypeEnum, SortableValue } from './type'

export const isDev = () => process.env.NODE_ENV === 'development'
export const warn = (msg: String) => isDev() && console.log(`[WARN] ${msg}`)
export const strObj = (obj: Object) => JSON.stringify(obj)

export const isVoid = (x: SortableValue): boolean => x == undefined
export const isVoidType = (x: SortableTypeEnum): boolean => x === 'void'
export const getType = (x: SortableValue): SortableTypeEnum => isVoid(x) ? 'void' : Object.prototype.toString.call(x).slice(8, -1).toLowerCase()
export const isFn = (x: SortableValue): boolean => getType(x) === 'function'
export const notNull = (x: any) => !!x
export const getValsFrom = (x: any[]): any[] => {
  const ret = []
  while (x.length > 0) ret.push(x.shift())
  return ret
}

/**
 * @example
 *    1. walk('a.b')({a:{b:3}}) returns 3
 *    2. walk(['a','b'])({a:{b:3}}) returns 3
 */
export const walk = (pathsStore: String | String[]) => (x: any) => {
  const paths = pathsStore instanceof Array
    ? [].concat(pathsStore)
    : pathsStore.split('.')
  let val = x; let nextPath = null
  while (val && paths.length) {
    nextPath = paths.shift()
    if (!Object.prototype.hasOwnProperty.call(val, nextPath)) {
      warn(`cant find path "${JSON.stringify(pathsStore)}" in ${strObj(x)}, skip by default`)
    }
    val = val[nextPath]
  }
  return val
}

/** Type Utils */

export type isStringLiteral<T> = T extends string ? string extends T ? never : T : never;
