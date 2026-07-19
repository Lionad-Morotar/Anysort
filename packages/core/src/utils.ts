/**
 * 内部工具：目前仅 walk（按路径取对象值）被 compile 层使用。
 * 路径不存在时 warn + 返回 undefined（由 compile 层决定排序位置，通常排后）。
 */

const isDev = (): boolean => process.env.NODE_ENV === 'development'

const warn = (msg: string): void => {
  if (isDev()) console.warn(`[anysort] ${msg}`)
}

const safeStringify = (value: unknown): string => {
  try { return JSON.stringify(value) } catch { return String(value) }
}

/**
 * 按路径取对象值。
 * @example walk(['a','b'])({a:{b:3}}) → 3 ; walk('a.b')({a:{b:3}}) → 3
 */
export const walk = (pathsStore: string | string[]) => (x: unknown): unknown => {
  const paths = Array.isArray(pathsStore) ? pathsStore.slice(0) : pathsStore.split('.')
  let val: unknown = x
  while (val != null && paths.length > 0) {
    const nextPath = paths.shift() as string
    if (val != null && typeof val === 'object' && !Object.prototype.hasOwnProperty.call(val, nextPath)) {
      const pathStr = Array.isArray(pathsStore) ? pathsStore.join('.') : pathsStore
      warn(`cant find path "${pathStr}" in ${safeStringify(x)}, skip`)
    }
    val = (val as Record<string, unknown>)[nextPath]
  }
  return val
}
