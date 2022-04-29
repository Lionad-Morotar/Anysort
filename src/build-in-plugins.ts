import Sort from './sort'
import { walk } from './utils'

import type { Plugins } from './type'

// build-in plugins
// TODO plugin 'remap'
const plugins: Plugins = {

  /* Plugins that change sort argument */

  i: (sort: Sort) => sort.map(x => (x || '').toLowerCase()),
  is: (sort: Sort, arg: string) => sort.map(x => x === arg),
  nth: (sort: Sort, arg: string) => sort.map(x => x[+arg]),
  all: (sort: Sort, arg: string) =>
    sort.map(x => x.every ? x.every(y => String(y) === arg) : x === arg),
  has: (sort: Sort, arg: string) =>
    sort.map(x => x instanceof Array
      ? x.some(y => String(y) === arg)
      : x.includes(arg)),
  not: (sort: Sort, arg: string) => sort.map(x => arg ? (x !== arg) : !x),
  len: (sort: Sort, arg: string) =>
    arg.length
      ? sort.map(x => x.length === +arg)
      : sort.map(x => x.length),
  get: (sort: Sort, arg: string) => sort.map(walk(arg)),

  /* Plugins that change sort order directly */

  reverse: (sort: Sort) => sort.result(res => -res),
  rand: (sort: Sort) => sort.result(_ => Math.random() < 0.5 ? -1 : 1),

  /* Plugins for Proxy API */

  result: (sort: Sort) => sort.result(res => res)

}

export default plugins
