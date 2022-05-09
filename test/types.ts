/* eslint-disable */

import type { Anysort } from '../build/types'
import Sort from '../build/types/sort'
import type { PluginNamesWithoutArg, PluginNamesWithArg, PluginNamesWithArgMaybe } from '../build/types/type'
import type { GetPath, UnionToTupleSafe, ObjectKeyPaths, isPathAvailable, isValidStringCMD } from '../build/types/type-utils'
import type { BuildInPlugins } from '../build/types/build-in-plugins'

import { getPosts } from './readme-example'

const anysort: Anysort = require('../build/index')
/* *
 * test whether types imported correctly,
 * because my VS Code halted sometimes when importing complex types
 **/
// @ts-expect-error
anysort([1,2], '')
anysort([1,2], 'reverse()')

const arr = [1, '2', new Date(3), Symbol('4'), null]
const numberArr = [1, 2, 3]
const stringArr = ['1', '2', '3']
const postsArr = getPosts()
type Posts = typeof postsArr

type And<X, Y> = X extends true ? Y extends true ? true : false : false
type Expect<T extends true> = T
type ExpectExtends<A, B extends A> = A
type Extends<A, B> = A extends B ? true : false
type Equal<X, Y> =
  And<IsNever<X>, IsNever<Y>> extends false
  ? (<T>() => T extends X ? 1 : 2) extends
    (<T>() => T extends Y ? 1 : 2) ? true : false
  : true
type IsNever<T> = [T] extends [never] ? true : false
type IsNumberArr<T extends number[]> = T
type IsStringArr<T extends string[]> = T




/*******************************************************************************
 * test cases for GetPath
 ******************************************************************************/

const testPluginsRaw = {
  p1: (sort: Sort) => sort.result(res => -res),
  p2: (sort: Sort, arg = '') => sort.map(x => (x + arg).toLocaleString()),
  p3: (sort: Sort, arg: string) => sort.map(x => (x + arg).toLocaleString()),
  p4: (sort: Sort) => sort.result(res => -res),
  p5: (sort: Sort, arg?: string) => sort.map(x => (x + arg).toLocaleString()),
  p6: (sort: Sort, arg: string) => sort.map(x => (x + arg).toLocaleString()),
}
type PluginsRaw = typeof testPluginsRaw
type test_PluginNamesWithoutArg_1 = PluginNamesWithoutArg<PluginsRaw>
type test_PluginNamesWithArg_1 = PluginNamesWithArg<PluginsRaw>
type test_PluginNamesWithArgMaybe_1 = PluginNamesWithArgMaybe<PluginsRaw>

type test_PluginNamesWithoutArg_2 = PluginNamesWithoutArg<BuildInPlugins>
type test_PluginNamesWithArg_2 = PluginNamesWithArg<BuildInPlugins>
type test_PluginNamesWithArgMaybe_2 = PluginNamesWithArgMaybe<BuildInPlugins>

type test_PluginNamesWithoutArg_3 = PluginNamesWithoutArg<BuildInPlugins & PluginsRaw>
type test_PluginNamesWithArg_3 = PluginNamesWithArg<BuildInPlugins & PluginsRaw>
type test_PluginNamesWithArgMaybe_3 = PluginNamesWithArgMaybe<BuildInPlugins & PluginsRaw>




/*******************************************************************************
 * test cases for GetPath
 ******************************************************************************/

 type test_GetPath = [
  Expect<Equal<GetPath<{a:1}>, "a">>,
  Expect<Equal<GetPath<{b:{c:{d:2}}}>, "b" | "b.c" | "b.c.d">>,
]




/*******************************************************************************
 * test cases for ObjectKeyPaths
 ******************************************************************************/

type test_ObjectKeyPaths = [
  Expect<Equal<ObjectKeyPaths<[{a:1}]>, "a">>,
  Expect<Equal<ObjectKeyPaths<[{a:1},{b:{c:{d:2}}}]>, "a" | "b" | "b.c" | "b.c.d">>,
]



/*******************************************************************************
 * test cases for isPathAvailable
 ******************************************************************************/

type test_isPathAvailable = [
  Expect<Equal<isPathAvailable<[{ a: number; b: { c: string; d: number }}], 'a'>, true>>,
  Expect<Equal<isPathAvailable<[{ a: number; b: { c: string; d: number }}], 'b.c'>, true>>,
  Expect<Equal<isPathAvailable<[{ a: number; b: { c: string; d: number }}], 'a.b'>, false>>,
  Expect<Extends<'created.date', ObjectKeyPaths<UnionToTupleSafe<Posts>>>>,
]



/*******************************************************************************
 * test cases for isValidStringCMD
 ******************************************************************************/

type test = isValidStringCMD<BuildInPlugins, Posts, 'i()'>
type test_isValidStringCMD = [
  Expect<Equal<isValidStringCMD<BuildInPlugins, Posts, ''>, never>>,
  Expect<Equal<isValidStringCMD<BuildInPlugins, Posts, 'created.date'>, 'created.date'>>,
  Expect<Equal<isValidStringCMD<BuildInPlugins, Posts, 'created.date-reverse()'>, 'created.date-reverse()'>>,
  Expect<Equal<isValidStringCMD<BuildInPlugins, Posts, 'created.date-notBuildInPlugin()'>, never>>,
  Expect<Equal<isValidStringCMD<BuildInPlugins, Posts, 'created.date-notBuildInPlugin()-reverse()'>, never>>,
  Expect<Equal<isValidStringCMD<BuildInPlugins, Posts, 'created.date-reverse()-reverse()'>, 'created.date-reverse()-reverse()'>>,
  Expect<Equal<isValidStringCMD<BuildInPlugins, Posts, 'created.date-is(20220324)'>, 'created.date-is(20220324)'>>,
  Expect<Equal<isValidStringCMD<BuildInPlugins, Posts, 'created.date-is()'>, never>>,
  Expect<Equal<isValidStringCMD<BuildInPlugins, Posts, 'created.date-reverse(20220324)'>, never>>,
  Expect<Equal<isValidStringCMD<BuildInPlugins, Posts, 'created.date--reverse()'>, never>>,
  Expect<Equal<isValidStringCMD<BuildInPlugins, Posts, 'created.date--'>, never>>,
]




/*******************************************************************************
 * test cases for the type of the result of anysort.wrap
 ******************************************************************************/

const test_anysort_wrap_1 = anysort.wrap(numberArr)
const test_anysort_wrap_2 = anysort.wrap(stringArr)
type test_anysort_wrap = [
  IsNumberArr<typeof test_anysort_wrap_1>,
  IsStringArr<typeof test_anysort_wrap_2>,
]

// TODO
const wrappedArr = anysort(arr)





/*******************************************************************************
 * test cases for extendPlugins
 ******************************************************************************/

// @ts-expect-error unknownPlugin
const test_anysort_extend_ = anysort(numberArr, 'customPlugin()')

const anysortWithCustomPlugins_wrong = anysort.extends({
  // @ts-expect-error incorrect sort types
  wrongPlugin1: (sort: any) => sort.map((x: string) => (x || '').toLowerCase()),
  // @ts-expect-error incorrect return types
  wrongPlugin2: (sort: Sort, x1: string) => x1.toLocaleString(),
  // @ts-expect-error incorrect counts of arguments
  wrongPlugin3: (sort: Sort, x1: string, x2: string) => sort.map(x => x.toLocaleString()),
})

const anysortWithCustomPlugins_1 = anysort.extends({
  customPluginWithoutArg_1: (sort: Sort) => sort.map(x => (x || '').toLowerCase()),
  customPluginWithArg_1: (sort: Sort, arg: string) => sort.map(x => x === arg),
  customPluginWithArgMaybe_1: (sort: Sort, arg?: string) => sort.map(x => x === arg),
  // customPluginWithArgMaybe_1: (sort: Sort, arg = '') => sort.map(x => x === arg),
})
const test_anysort_extend_1 = [
  anysortWithCustomPlugins_1(numberArr, 'customPluginWithoutArg_1()'),
  // @ts-expect-error
  anysortWithCustomPlugins_1(numberArr, 'customPluginWithoutArg_1(123)'),
  // @ts-expect-error
  anysortWithCustomPlugins_1(numberArr, 'customPluginWithArg_1()'),
  anysortWithCustomPlugins_1(numberArr, 'customPluginWithArg_1(234)'),
  anysortWithCustomPlugins_1(numberArr, 'customPluginWithArgMaybe_1()'),
  anysortWithCustomPlugins_1(numberArr, 'customPluginWithArgMaybe_1(123)'),
]

/**
 * temperary disabled
 * TODO maybe fix in the future
 * TSError 类型实例化过深，且可能无限
 */
// const anysortWithCustomPlugins_2 = anysortWithCustomPlugins_1.extends({
//   customPluginWithoutArg_2: (sort: Sort) => sort.map(x => (x || '').toLowerCase()),
//   customPluginWithArg_2: (sort: Sort, arg: string) => sort.map(x => x === arg),
//   customPluginWithArgMaybe_2: (sort: Sort, arg?: string) => sort.map(x => x === arg),
// })
// const test_anysort_extend_2 = [
//   anysortWithCustomPlugins_2(numberArr, 'customPluginWithoutArg_2()'),
//   // @ts-expect-error
//   anysortWithCustomPlugins_2(numberArr, 'customPluginWithoutArg_2(123)'),
//   // @ts-expect-error
//   anysortWithCustomPlugins_2(numberArr, 'customPluginWithArg_2()'),
//   anysortWithCustomPlugins_2(numberArr, 'customPluginWithArg_2(234)'),
//   anysortWithCustomPlugins_2(numberArr, 'customPluginWithArgMaybe_2()'),
//   anysortWithCustomPlugins_2(numberArr, 'customPluginWithArgMaybe_2(123)'),

//   anysortWithCustomPlugins_1(numberArr, 'customPluginWithoutArg_1()'),
//   // @ts-expect-error
//   anysortWithCustomPlugins_1(numberArr, 'customPluginWithoutArg_1(123)'),
//   // @ts-expect-error
//   anysortWithCustomPlugins_1(numberArr, 'customPluginWithArg_1()'),
//   anysortWithCustomPlugins_1(numberArr, 'customPluginWithArg_1(234)'),
//   anysortWithCustomPlugins_1(numberArr, 'customPluginWithArgMaybe_1()'),
//   anysortWithCustomPlugins_1(numberArr, 'customPluginWithArgMaybe_1(123)'),
// ]




/*******************************************************************************
 * test cases for factory function
 ******************************************************************************/

anysort(numberArr, function (a, b) { return a - b })
anysort(stringArr, function (a, b) { return a.length - b.length })
anysort(arr, function (a, b) { return Math.random() - 0.5 })

const test_anysort_1 = anysort(numberArr, 'reverse()')
const test_anysort_2 = anysort(stringArr, 'reverse()')
const test_anysort_3 = anysort(postsArr, 'created.date-reverse()', 'tag-has(editing)')
type test_anysort = [
  IsNumberArr<typeof test_anysort_1>,
  IsStringArr<typeof test_anysort_2>,
  ExpectExtends<Posts, typeof test_anysort_3>
]
// @ts-expect-error unknownPlugin
const test_anysort_4 = anysort(stringArr, 'reverse()-unknownPlugin()')
// @ts-expect-error illeagal SortStringCMD
const test_anysort_5 = anysort(stringArr, 'reverse()--reverse()')
// @ts-expect-error illeagal SortStringCMD
const test_anysort_6 = anysort(stringArr, 'reverse()-')
// @ts-expect-error illeagal SortStringCMD, some plugins cant call with arguments
const test_anysort_7 = anysort(stringArr, 'reverse(123)')
// @ts-expect-error illeagal SortStringCMD, unknown property
const test_anysort_8 = anysort(stringArr, 'unknownProperty')
const test_anysort_9 = anysort(stringArr, 'length')
// @ts-expect-error illeagal SortStringCMD, unknown property
const test_anysort_10 = anysort(postsArr, 'created.data-reverse()')
const test_anysort_11 = anysort(postsArr, 'created.date-reverse()')

// @ts-expect-error
const test_anysort_apply_1 = anysort(postsArr).apply('')
const test_anysort_apply_2 = anysort(postsArr).apply('reverse()')
const test_anysort_apply_3 = anysort(postsArr).apply('created.date-reverse()')
// @ts-expect-error
const test_anysort_apply_4 = anysort(postsArr).apply('created.dat-reverse()')
// @ts-expect-error
const test_anysort_apply_5 = anysort(postsArr).apply('created.date-reverse(123)')
// @ts-expect-error
const test_anysort_apply_6 = anysort(postsArr).apply('created.date-is()')
// @ts-expect-error
const test_anysort_apply_7 = anysort(postsArr).apply('created.date-unknownPlugin()')

anysort(['c', 'b', 'd', 'a']).has('123')
// @ts-expect-error
anysort(['c', 'b', 'd', 'a']).unknown('123')
anysort(postsArr).i()
// @ts-expect-error
anysort(postsArr).tag()
anysort(postsArr).tag.has('editing')
anysort(postsArr).created.date.reverse()
// @ts-expect-error
anysort(postsArr).created.date.reverse(123)
anysort(postsArr).created.date.has('editing').reverse()
