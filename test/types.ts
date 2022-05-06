/* eslint-disable */

import { Anysort } from '../build/types'
import { SortStringCMD } from '../build/types/type'

const anysort: Anysort = require('../build/index')

const arr = [1, '2', new Date(3), Symbol('4'), null]
const numberArr = [1, 2, 3]
const stringArr = ['1', '2', '3']

type And<X, Y> = X extends true ? Y extends true ? true : false : false
type Expect<T extends true> = T
type Equal<X, Y> =
  And<IsNever<X>, IsNever<Y>> extends false
  ? (<T>() => T extends X ? 1 : 2) extends
    (<T>() => T extends Y ? 1 : 2) ? true : false
  : true
type IsNever<T> = [T] extends [never] ? true : false
type IsNumberArr<T extends number[]> = T
type IsStringArr<T extends string[]> = T




/*******************************************************************************
 * test cases for SortStringCMD
 ******************************************************************************/

type test_SortStringCMD = [
  Expect<Equal<SortStringCMD<''>, never>>,
  Expect<Equal<SortStringCMD<'date.test'>, 'date.test'>>,
  Expect<Equal<SortStringCMD<'date-reverse()'>, 'date-reverse()'>>,
  Expect<Equal<SortStringCMD<'date-notBuildInPlugin()'>, never>>,
  Expect<Equal<SortStringCMD<'date-notBuildInPlugin()-reverse()'>, never>>,
  Expect<Equal<SortStringCMD<'date-reverse()-reverse()'>, 'date-reverse()-reverse()'>>,
  Expect<Equal<SortStringCMD<'date-is(20220324)'>, 'date-is(20220324)'>>,
  Expect<Equal<SortStringCMD<'date-reverse(20220324)'>, never>>,
  Expect<Equal<SortStringCMD<'date--reverse()'>, never>>,
  Expect<Equal<SortStringCMD<'date--'>, never>>,
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

const test_anysort_1 = anysort(numberArr, 'date-reverse()')
const test_anysort_2 = anysort(stringArr, 'date-reverse()', 'tag-has(editing)')
type test_anysort = [
  IsNumberArr<typeof test_anysort_1>,
  IsStringArr<typeof test_anysort_2>,
]

// @ts-expect-error unknownPlugin
const test_anysort_3 = anysort(stringArr, 'date-reverse()', 'tag-has(editing)-unknownPlugin()')
// @ts-expect-error illeagal SortStringCMD
const test_anysort_4 = anysort(stringArr, 'date--reverse()')
// @ts-expect-error illeagal SortStringCMD
const test_anysort_5 = anysort(stringArr, 'date--')

