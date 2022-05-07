/* eslint-disable */

import { Anysort } from '../build/types'
import { GetPath, UnionToTupleSafe, ObjectKeyPaths, isPathAvailable, validOut } from '../build/types/type-utils'

import { getPosts } from './readme-example'

const anysort: Anysort = require('../build/index')

const arr = [1, '2', new Date(3), Symbol('4'), null]
const numberArr = [1, 2, 3]
const stringArr = ['1', '2', '3']
const postsArr = getPosts()
type Posts = typeof postsArr

type And<X, Y> = X extends true ? Y extends true ? true : false : false
type Expect<T extends true> = T
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
 * test cases for validOut
 ******************************************************************************/

type test_validOut = [
  Expect<Equal<validOut<Posts, ''>, never>>,
  Expect<Equal<validOut<Posts, 'created.date'>, 'created.date'>>,
  Expect<Equal<validOut<Posts, 'created.date-reverse()'>, 'created.date-reverse()'>>,
  Expect<Equal<validOut<Posts, 'created.date-notBuildInPlugin()'>, never>>,
  Expect<Equal<validOut<Posts, 'created.date-notBuildInPlugin()-reverse()'>, never>>,
  Expect<Equal<validOut<Posts, 'created.date-reverse()-reverse()'>, 'created.date-reverse()-reverse()'>>,
  Expect<Equal<validOut<Posts, 'created.date-is(20220324)'>, 'created.date-is(20220324)'>>,
  Expect<Equal<validOut<Posts, 'created.date-reverse(20220324)'>, never>>,
  Expect<Equal<validOut<Posts, 'created.date--reverse()'>, never>>,
  Expect<Equal<validOut<Posts, 'created.date--'>, never>>,
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

// const testExtend_1 = extendPlugs({
//   lowercase: sort => sort.map(x => (x || '').toLowerCase())
// })





/*******************************************************************************
 * test cases for factory function
 ******************************************************************************/

const test_anysort_1 = anysort(numberArr, 'reverse()')
const test_anysort_2 = anysort(stringArr, 'reverse()')
const test_anysort_3 = anysort(postsArr, 'created.date-reverse()', 'tag-has(editing)')
type test_anysort = [
  IsNumberArr<typeof test_anysort_1>,
  IsStringArr<typeof test_anysort_2>,
  Expect<Equal<typeof test_anysort_3, Posts>>
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

