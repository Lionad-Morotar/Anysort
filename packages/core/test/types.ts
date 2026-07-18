// 纯编译期类型断言：验证链式 Full Typed（路径补全 + 非法路径报错 + run/compile 保元素类型）。
// 由 vitest typecheck（tsgo）驱动，作为类型回归门禁。无运行时产物。

import { chain } from '../src/chain'

/* 合法路径：沿元素 keyof 递归补全 */
chain([{ a: { b: 1 } }]).a.b
chain([{ a: { b: 1 } }]).a.b.reverse()
chain([{ name: 'x', created: { date: 'd' } }]).created.date.reverse()
chain([{ items: ['x', 'y'] }]).items

/* 非法路径：编译期报错 */
// @ts-expect-error 'hass' 不是元素属性也不是插件
chain([{ a: 1 }]).hass
// @ts-expect-error 访问不存在的嵌套属性
chain([{ a: { b: 1 } }]).a.typo

/* 插件方法签名 */
chain([{ a: 1 }]).reverse()
chain([{ a: 1 }]).asc()
chain([{ a: 1 }]).nth(2)
chain([{ a: 'x' }]).is('foo')
chain([{ a: 'x' }]).len(3)
// @ts-expect-error nth 需 number arg，不接受 string
chain([{ a: 1 }]).nth('2')
// @ts-expect-error is 至少需一个 arg
chain([{ a: 'x' }]).is()

/* run 返回源元素类型（T 固定，路径上下文不改变 run 的返回类型） */
chain([{ a: { b: 1 } }]).a.b.run() satisfies { a: { b: number } }[]

/* compile 返回绑定元素类型的 SortFn */
const fn = chain([{ a: 1 }]).compile()
const _arr: { a: number }[] = [{ a: 1 }]
_arr.sort(fn)
// @ts-expect-error SortFn<{a:number}> 不能排异构元素类型
;[{ b: 'x' }].sort(fn)
