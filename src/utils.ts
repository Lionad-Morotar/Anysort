import {
  SortableTypeEnum,
  SortableValue
} from './type'

const __DEBUG = false

export const isDev = () => process.env.NODE_ENV === 'development'
export const warn = (msg: String) => __DEBUG && console.log(`[WARN] ${msg}`)
export const strObj = (obj: Object) => JSON.stringify(obj)

export const isVoid = (x: SortableValue): boolean => x == undefined
export const isVoidType = (x: SortableTypeEnum): boolean => x === 'void'
export const getType = (x: SortableValue): SortableTypeEnum => isVoid(x) ? 'void' : Object.prototype.toString.call(x).slice(8, -1).toLowerCase()
export const isFn = (x: SortableValue): boolean => getType(x) === 'function'
export const notNull = (x: any) => !!x

export const getValueFromPath = (pathsStore: String[]) => (x: any) => {
  const paths = [].concat(pathsStore)
  let val = x, nextPath = null
  while (val && paths.length) {
    nextPath = paths.shift()
    if (!val.hasOwnProperty(nextPath)) {
      warn(`cant find path "${pathsStore.join('.')}" in ${strObj(x)}, skip by default`)
    }
    val = val[nextPath]
  }
  return val
}
