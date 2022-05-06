/* eslint-disable */

import { Anysort } from '../build/types'

const anysort: Anysort = require('../build/index')

/* TODO test cases for SortStringCMD */

// // @ts-expect-error
// const testCMD_empty = genSortFnFromStr('')
// const testCMD_1 = genSortFnFromStr('date.test')
// const testCMD_2 = genSortFnFromStr('date-reverse()')
// // @ts-expect-error
// const testCMD_3 = genSortFnFromStr('date-notBuildInPlugin()')
// // @ts-expect-error
// const testCMD_4 = genSortFnFromStr('date-notBuildInPlugin()-reverse()')
// const testCMD_5 = genSortFnFromStr('date-reverse()-reverse()')
// const testCMD_6 = genSortFnFromStr('date-is(20220324)')
// // @ts-expect-error
// const testCMD_7 = genSortFnFromStr('date-reverse(20220324)')

/* test cases for anysort.wrap */

const numberArr = [1, 2, 3]
const test_anysort_wrap_2 = anysort.wrap(numberArr)
const stringArr = ['1', '2', '3']
const test_anysort_wrap_4 = anysort.wrap(stringArr)

/* test cases for extendPlugins */

// const testExtend_1 = extendPlugs({
//   lowercase: sort => sort.map(x => (x || '').toLowerCase())
// })

/* test cases for factory function */

const test_anysort_1 = anysort(numberArr, 'date-reverse()')
const test_anysort_2 = anysort(numberArr, 'date-reverse()', 'tag-has(editing)')
const test_anysort_3 = anysort(stringArr, 'date-reverse()')
const test_anysort_4 = anysort(stringArr, 'date-reverse()', 'tag-has(editing)')
// @ts-expect-error
const test_anysort_5 = anysort(stringArr, 'date-reverse()', 'tag-has(editing)-unknownPlugin()')
