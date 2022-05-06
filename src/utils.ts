import type { SortableTypeEnum, SortableValue } from './type'

export const isDev = () => process.env.NODE_ENV === 'development'
export const warn = (msg: String) => isDev() && console.log(`[WARN] ${msg}`)
export const strObj = (obj: Object) => JSON.stringify(obj)

export const isVoid = (x: SortableValue): boolean => x == undefined
export const isVoidType = (x: SortableTypeEnum): boolean => x === 'void'
export const getType = (x: SortableValue): SortableTypeEnum | string =>
  isVoid(x) ? 'void' : Object.prototype.toString.call(x).slice(8, -1).toLowerCase()
export const isFn = (x: SortableValue): boolean => getType(x) === 'function'
export const notNull = (x: any) => !!x

/**
 * @example
 *    1. walk('a.b')({a:{b:3}}) returns 3
 *    2. walk(['a','b'])({a:{b:3}}) returns 3
 */
export const walk = (pathsStore: String | String[]) => (x: any) => {
  const paths = pathsStore instanceof Array
    ? pathsStore.slice(0, pathsStore.length)
    : pathsStore.split('.')
  let val = x
  let nextPath: string | null = null
  while (val && paths.length) {
    nextPath = paths.shift() as string
    if (!Object.prototype.hasOwnProperty.call(val, nextPath)) {
      warn(`cant find path "${JSON.stringify(pathsStore)}" in ${strObj(x)}, skip by default`)
    }
    val = val[nextPath]
  }
  return val
}
