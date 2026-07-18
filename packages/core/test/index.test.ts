 

// TODO test extends

import { describe, it, expect } from 'vitest'
import anysort from '../src/main'

/**
 * Test Anysort Types
 */

// TODO

/**
 * Test Anysort Configuration
 */

describe('Test Anysort Configuration', function () {

  // TODO test cases for delimeter

  it('config.autoSort', function () {
    const getArr = () => [3, 5, 0, 2, -9, 6, 1, 4, 7, 8]

    anysort.config.autoSort = false
    expect(anysort(getArr())).toEqual([3, 5, 0, 2, -9, 6, 1, 4, 7, 8])
    expect(anysort(getArr(), [])).toEqual([3, 5, 0, 2, -9, 6, 1, 4, 7, 8])

    anysort.config.autoSort = true
    expect(anysort(getArr())).toEqual([-9, 0, 1, 2, 3, 4, 5, 6, 7, 8])
    expect(anysort(getArr(), [])).toEqual([-9, 0, 1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('config.autoWrap', function () {
    const patchedKey = anysort.config.patched
    const patchedResult = true

    const getArr = () => [3, 5, 0, 2, -9, 6, 1, 4, 7, 8]

    anysort.config.autoWrap = false
    expect(anysort(getArr())[patchedKey]).toBe(undefined)

    anysort.config.autoWrap = true
    expect(anysort(getArr())[patchedKey]).toBe(patchedResult)
  })

  it('config.orders', function () {
    const backupOrders = anysort.config.orders
    const d1 = new Date(1)
    const d5 = new Date(5)
    const getArr = () => ['d', { a: 0 }, 3, 'b', d5, '', null, d1, 'zoo', null, { 1: 1 }, undefined, 'a', 'd', { c: 3 }, 1, 0, 'z']

    anysort.config.orders = { string: 1, number: 2, rest: 3, void: 4 }
    expect(anysort(getArr())).toEqual(['', 'a', 'b', 'd', 'd', 'z', 'zoo', 0, 1, 3, { a: 0 }, d1, d5, { 1: 1 }, { c: 3 }, null, null, undefined])

    anysort.config.orders = backupOrders
    expect(anysort(getArr())).toEqual([0, 1, 3, '', 'a', 'b', 'd', 'd', 'z', 'zoo', d1, d5, {a:0}, {1:1}, {c:3}, null, null, undefined])
  })

})

/**
 * Test Anysort APIs
 */

describe('Test Anysort APIs', function () {
  let arraySort
  for (let i = 1;;i++) {

    // two ways of calling anysort
    if (i === 1)
      arraySort = (arr, args) => args ? anysort(arr, ...args) : anysort(arr)
    else if (i === 2)
      arraySort = (arr, args) => anysort.wrap(arr).apply(args)
    else
      break

    describe(`The ${i+1}th api`, function () {

      describe('Test basic sorting functions', function () {

        it('arrays of numbers', function () {
          const arr = [3, 5, 0, 2, -9, 6, 1, 4, 7, 8]
          expect(arraySort(arr)).toEqual([-9, 0, 1, 2, 3, 4, 5, 6, 7, 8])
          expect(arraySort(arr, [])).toEqual([-9, 0, 1, 2, 3, 4, 5, 6, 7, 8])
        })

        it('arrays of chars', function () {
          const alphas = 'abcdefghijklmnopqrstuvwxyz'
          const arr = alphas.split('').sort(() => Math.random() - 0.5)
          expect(arraySort(arr)).toEqual(alphas.split(''))
        })

        it('arrays of strings', function () {
          const arr = ['zoo', 'alpha', '', 'google', 'gap']
          expect(arraySort(arr)).toEqual(['', 'alpha', 'gap', 'google', 'zoo'])
        })

        it('arrays of primitives', function () {
          const arr = [0, '0', 1, undefined, 'd', '1', '0', null, 0, '', undefined]
          expect(arraySort(arr)).toEqual([0, 0, 1, '', '0', '0', '1', 'd', null, undefined, undefined])
        })

        it('arrays of dates', function () {
          const d1 = new Date(1)
          const d5 = new Date(5)
          const d100 = new Date(100)
          const d500 = new Date(500)
          const arr = [d100, d5, d1, d500]
          expect(arraySort(arr)).toEqual([d1, d5, d100, d500])
        })

        it('arrays of symbols', function () {
          const toString = xs => xs.map(x => x.toString())
          const arr = [Symbol('d'), Symbol('c'), Symbol('a'), Symbol('b')]
          expect(toString(arraySort(arr))).toEqual(toString([Symbol('a'), Symbol('b'), Symbol('c'), Symbol('d')]))
        })

        it('arrays of functions by name', function () {
          const getFnName = x => x.name
          const arr = [
            function name_c() {},
            () => {},
            function name_a() {},
            function name_b() {},
          ]
          expect(arraySort(arr).map(getFnName)).toEqual([
            () => {},
            function name_a() {},
            function name_b() {},
            function name_c() {},
          ].map(getFnName))
        })

        it('do nothing with objects if no plugins in use', function () {
          const arr = [{b:'b'}, {c:'c'}, {e:'e'}, {a:'a'}, {f:'f'}, {d:'d'}]
          expect(arraySort(arr)).toEqual([{b:'b'}, {c:'c'}, {e:'e'}, {a:'a'}, {f:'f'}, {d:'d'}])
        })

        it('arrays of mixed-type-elements', function () {
          const arr = ['d', { a: 0 }, 3, 'b', '', 'zoo', { 1: 1 }, 'a', 'd', { c: 3 }, 1, 0, 'z']
          expect(arraySort(arr)).toEqual([0, 1, 3, '', 'a', 'b', 'd', 'd', 'z', 'zoo', {a:0}, {1:1}, {c:3}])
        })

        it('arrays of objects sort by shallow property', function () {
          const arr = [{ key: 'y' }, { key: 'z' }, { key: 'x' }]
          expect(arraySort(arr, ['key'])).toEqual([{ key: 'x' }, { key: 'y' }, { key: 'z' }])
        })

        it('arrays of objects sort by nested property', function () {
          const arr = [{ key: { key: 'y' } }, { key: { key: 'z' } }, { key: { key: 'x' } }]
          expect(arraySort(arr, ['key.key'])).toEqual([{ key: { key: 'x' } }, { key: { key: 'y' } }, { key: { key: 'z' } }])
        })

        it('arrays of objects sort by property on its prototype', function () {
          const arr = ['aa', 'cccc', 'd', 'eee', 'b']
          expect(arraySort(arr, ['length'])).toEqual(['d', 'b', 'aa', 'eee', 'cccc'])
          const arr2 = ['aa', 'cccc', 'd', 'eee', 'b']
          expect(arraySort(arr2, ['length-reverse()'])).toEqual(['cccc', 'eee', 'aa', 'd', 'b'])
        })

        it('sort with custom functions', function () {
          const arr = [
            { a: 'b', b: 'd', c: 'f', d: 'g' },
            { a: 'b', b: 'd', c: 'e', d: 'h' },
            { a: 'b', b: 'c', c: 'f', d: 'h' },
            { a: 'a', b: 'd', c: 'f', d: 'h' }
          ]
          const compare = function (prop) {
            return function (a, b) {
              return a[prop].localeCompare(b[prop])
            }
          }
          const actual = arraySort(arr, [
            compare('a'),
            compare('b'),
            compare('c'),
            compare('d')
          ])
          expect(actual).toEqual([
            { a: 'a', b: 'd', c: 'f', d: 'h' },
            { a: 'b', b: 'c', c: 'f', d: 'h' },
            { a: 'b', b: 'd', c: 'e', d: 'h' },
            { a: 'b', b: 'd', c: 'f', d: 'g' }
          ])
        })

      })

      describe('Test advance use cases', function () {

        it('sort by multi-properties(multi-indexes)', function () {
          const posts = [
            { foo: 'bbb', locals: { date: '2013-05-06' } },
            { foo: 'aaa', locals: { date: '2012-01-02' } },
            { foo: 'ddd', locals: { date: '2015-04-12' } },
            { foo: 'ccc', locals: { date: '2014-01-02' } },
            { foo: 'ccc', locals: { date: '2015-01-02' } },
            { foo: 'ddd', locals: { date: '2014-01-09' } },
            { foo: 'bbb', locals: { date: '2014-06-01' } },
            { foo: 'aaa', locals: { date: '2014-02-02' } }
          ]
          const results = arraySort(posts, ['foo', 'locals.date'])
          expect(results).toEqual([
            { foo: 'aaa', locals: { date: '2012-01-02' } },
            { foo: 'aaa', locals: { date: '2014-02-02' } },
            { foo: 'bbb', locals: { date: '2013-05-06' } },
            { foo: 'bbb', locals: { date: '2014-06-01' } },
            { foo: 'ccc', locals: { date: '2014-01-02' } },
            { foo: 'ccc', locals: { date: '2015-01-02' } },
            { foo: 'ddd', locals: { date: '2014-01-09' } },
            { foo: 'ddd', locals: { date: '2015-04-12' } }
          ])
        })

      })

      describe('Test edge cases', function () {

        it('empty args', function () {
          const arr = []
          expect(arraySort(arr)).toEqual([])
          expect(arraySort(arr, [])).toEqual([])
        })

        it('put null and undefined at the end of array', function () {
          const arr = [null, 'd', 3, 'b', '', 'zoo', undefined, 'a', 'd', 1, 0, 'z']
          expect(arraySort(arr)).toEqual([0, 1, 3, '', 'a', 'b', 'd', 'd', 'z', 'zoo', null, undefined])
        })

        it('skip when get wrong properties', function () {
          const arr = [{ key: 'y' }, { key: 'z' }, { key: 'x' }]
          expect(arraySort(arr, ['wrong-key'])).toEqual([{ key: 'y' }, { key: 'z' }, { key: 'x' }])
        })

        it('skip when cant sort', function () {
          const arr = [{ 1: 1 }, { 3: 1 }, { 2: 1 }, { 4: 1 }]
          expect(arraySort(arr, ['a.b'])).toEqual(arr)
        })

        it('sort by multiple properties in order with null, undefined and empty property', function () {
          const posts = [
            { foo: 'bbb', locals: { date: '2013-05-06' } },
            { foo: 'aaa', locals: { date: null } },
            { locals: { date: '2015-04-12' } },
            { foo: 'ccc', locals: { date: '2014-01-02' } },
            { locals: { date: '2015-01-02' } },
            { foo: 'ddd', locals: { date: '2014-01-09' } },
            { foo: null, locals: {} },
            { foo: 'aaa', locals: { date: '2014-02-02' } }
          ]
          const actual = arraySort(posts, ['foo', 'locals.date'])
          expect(actual).toEqual([
            { foo: 'aaa', locals: { date: '2014-02-02' } },
            { foo: 'aaa', locals: { date: null } },
            { foo: 'bbb', locals: { date: '2013-05-06' } },
            { foo: 'ccc', locals: { date: '2014-01-02' } },
            { foo: 'ddd', locals: { date: '2014-01-09' } },
            { locals: { date: '2015-01-02' } },
            { locals: { date: '2015-04-12' } },
            { foo: null, locals: {} }
          ])
        })

      })

      describe('Test build-in plugins', function () {

        it('plugin: i (ignorecase)', function () {
          const arr = ['a', 'b', 'c', 'D']
          expect(arraySort(arr)).toEqual(['D', 'a', 'b', 'c'])
          expect(arraySort(arr, ['i()'])).toEqual(['a', 'b', 'c', 'D'])
        })

        it('plugin: reverse', function () {
          const arr = ['a', 'b', 'c', 'D']
          expect(arraySort(arr, ['reverse()'])).toEqual(['c', 'b', 'a', 'D'])
        })

        it('plugin: is', function () {
          const arr = ['a', 'b', 'c', 'D']
          expect(arraySort(arr, ['is(c)'])).toEqual(['c', 'a', 'b', 'D'])
          // * wrong usage because '0' cant compare with number 0
          // const arr2 = [3, 5, 0, 2, -9, 6, 1, 4, 7, 8]
          // expect(arraySort(arr2, ['is(0)'])).toEqual([0, 3, 5, 2, -9, 6, 1, 4, 7, 8])
        })

        it('plugin: nth', function () {
          const arr = ['aaac', 'aaaa', 'aaad', 'aaab']
          expect(arraySort(arr, ['nth(3)'])).toEqual(['aaaa', 'aaab', 'aaac', 'aaad'])
          const arr2 = [['aaac'], ['aaaa'], ['aaad'], ['aaab']]
          expect(arraySort(arr2, ['nth(0)-nth(3)'])).toEqual([['aaaa'], ['aaab'], ['aaac'], ['aaad']])
          // * wrong usage
          // const arr3 = [[3, 'aaac'], ['aaaa'], [1, 'aaad', 1], ['aaab']]
          // expect(arraySort(arr3, ['nth(0)-nth(3)'])).toEqual([['aaaa'], ['aaab'], [3, 'aaac'], [1, 'aaad', 1]])
        })

        it('plugin: all', function () {
          const arr = [['a', 'b'], ['a'], ['a', 'c']]
          expect(arraySort(arr, ['all(a)'])).toEqual([['a'], ['a', 'b'], ['a', 'c']])
          // * wrong usage
          // const arr2 = ['aaac', 'aaaa', 'aaad', 'aaab']
          const arr2 = ['c', 'a', 'd', 'b']
          expect(arraySort(arr2, ['all(a)'])).toEqual(['a', 'c', 'd', 'b'])
        })

        it('plugin: has', function () {
          const arrNums = [[1, 2], [2, 3], [2, 3], [1, 3]]
          expect(arraySort(arrNums, ['has(3)'])).toEqual([[2, 3], [2, 3], [1, 3], [1, 2]])
          const arrStrings = ['alpha', 'google', 'zoo', 'oowps']
          expect(arraySort(arrStrings, ['has(oo)'])).toEqual(['google', 'zoo', 'oowps', 'alpha'])
        })

        it('plugin: not', function () {
          const arr = ['a', 'b', 'c', 'D']
          expect(arraySort(arr, ['not(c)'])).toEqual(['a', 'b', 'D', 'c'])
          expect(arraySort(arr, ['not()'])).toEqual(arr)
        })

        it('plugin: len', function () {
          const getArrStrings = () => ['alpha', 'google', 'zoo', 'oowps']
          expect(arraySort(getArrStrings(), ['len()'])).toEqual(['zoo', 'alpha', 'oowps', 'google'])
          expect(arraySort(getArrStrings(), ['len(3)'])).toEqual(['zoo', 'alpha', 'google', 'oowps'])
          const getArrArrs = () => [[1,1], [1,1,1], [1], [1,1,1,1]]
          expect(arraySort(getArrArrs(), ['len()'])).toEqual([[1], [1,1], [1,1,1], [1,1,1,1]])
          expect(arraySort(getArrArrs(), ['len(4)'])).toEqual([[1,1,1,1], [1,1], [1,1,1], [1]])
        })

        it('plugin: get', function () {
          const posts = [
            { foo: 'bbb', locals: { date: '2013-05-06' } },
            { foo: 'aaa', locals: { date: null } },
            { locals: { date: '2015-04-12' } },
            { foo: 'ccc', locals: { date: '2014-01-02' } },
            { locals: { date: '2015-01-02' } },
            { foo: 'ddd', locals: { date: '2014-01-09' } },
            { foo: null, locals: {} },
            { foo: 'aaa', locals: { date: '2014-02-02' } }
          ]
          const actual = arraySort(posts, ['foo', 'get(locals.date)'])
          expect(actual).toEqual([
            { foo: 'aaa', locals: { date: '2014-02-02' } },
            { foo: 'aaa', locals: { date: null } },
            { foo: 'bbb', locals: { date: '2013-05-06' } },
            { foo: 'ccc', locals: { date: '2014-01-02' } },
            { foo: 'ddd', locals: { date: '2014-01-09' } },
            { locals: { date: '2015-01-02' } },
            { locals: { date: '2015-04-12' } },
            { foo: null, locals: {} }
          ])
        })

        it('plugin: rand', function () {
          const arr = ['a', 'b', 'c', 'D']
          expect(arraySort(arr, ['rand()']).length).toEqual(arr.length)
        })

      })

      describe('Test advance plugin operations', function () {

        it('plugin: custom plugin', function () {
          const arr = ['a', 'b', 'c', 'D']
          anysort.extends({
            lowercase: sort => sort.map(x => (x || '').toLowerCase())
          })
          expect(arraySort(arr)).toEqual(['D', 'a', 'b', 'c'])
          expect(arraySort(arr, ['lowercase()'])).toEqual(['a', 'b', 'c', 'D'])
        })

        it('plugin: multy commands', function () {
          const getArr = () => ['b', 'a', 'E', 'c', 'D']
          expect(arraySort(getArr(), ['i()'])).toEqual(['a', 'b', 'c', 'D', 'E'])
          expect(arraySort(getArr(), ['is(c)'])).toEqual(['c', 'b', 'a', 'E', 'D'])
          expect(arraySort(getArr(), ['is(c)-reverse()'])).toEqual(['b', 'a', 'E', 'D', 'c'])
          expect(arraySort(getArr(), ['is(c)-reverse()-reverse()'])).toEqual(['c', 'b', 'a', 'E', 'D'])
          expect(arraySort(getArr(), ['is(c)', 'i()-reverse()'])).toEqual(['c', 'E', 'D', 'b', 'a'])
        })

        it('plugin: advance custom plugin usage', function () {
          const getArr = () => ['b', 'a', 'E', 'c', 'D']
          anysort.extends({
            ltZ: sort => sort.map(x => (x < 'Z') ? -1 : 1),
            // ltZ_filter: sort => sort.map(x => (x < 'Z') ? -1 : x),
          })
          expect(arraySort(getArr(), ['is(c)', ((a, b) => (a < b) ? -1 : 1)])).toEqual(['c', 'D', 'E', 'a', 'b'])
          expect(arraySort(getArr(), ['is(c)', ((a, b) => (a < 'Z') ? -1 : 1), ((a, b) => (a < b) ? -1 : 1), 'i()-reverse()', ])).toEqual(['c', 'D', 'E', 'b', 'a'])
          expect(arraySort(getArr(), ['is(c)', 'ltZ()'])).toEqual(['c', 'E', 'D', 'b', 'a'])
          expect(arraySort(getArr(), ['is(c)', 'ltZ()-reverse()'])).toEqual(['c', 'b', 'a', 'E', 'D'])
        })

      })

    })
  }
})

/**
 * Test Proxy API
 */

 describe('Test Proxy API', function () {

  const getArr = () => ['a', 'b', 'c', 'D']
  const patchedKey = anysort.config.patched
  const patchedResult = true

  it('anysort(arr)', function () {
    expect(anysort(getArr())).toEqual(['D', 'a', 'b', 'c'])
    expect(anysort(getArr())[patchedKey]).toBe(patchedResult)
  })

  it('anysort(arr).plugin(arg)', function () {
    expect(anysort(getArr()).i()).toEqual(['a', 'b', 'c', 'D'])
    expect(anysort(getArr()).is('b')).toEqual(['b', 'D', 'a', 'c'])
    expect(anysort(['aaac', 'aaaa', 'aaad', 'aaab']).nth(3)).toEqual(['aaaa', 'aaab', 'aaac', 'aaad'])
    expect(anysort([['a', 'b'], ['a'], ['a', 'c']]).all('a')).toEqual([['a'], ['a', 'b'], ['a', 'c']])

    anysort.config.autoSort = false
    expect(anysort(['alpha', 'google', 'zoo', 'oowps']).has('oo')).toEqual(['google', 'zoo', 'oowps', 'alpha'])
    expect(anysort(['alpha', 'google', 'zoo', 'oowps'])).toEqual(['alpha', 'google', 'zoo', 'oowps'])
    anysort.config.autoSort = true
    expect(anysort(['alpha', 'google', 'zoo', 'oowps']).has('oo')).toEqual(['google', 'oowps', 'zoo', 'alpha'])
    expect(anysort(['alpha', 'google', 'zoo', 'oowps'])).toEqual(['alpha', 'google', 'oowps', 'zoo'])
  })

  it('anysort(arr).plugin(arg).plugin(arg)', function () {
    expect(anysort(getArr()).i()).toEqual(['a', 'b', 'c', 'D'])
    expect(anysort(getArr()).i().is('c')).toEqual(['c', 'a', 'b', 'D'])
    expect(anysort(getArr()).i().is('c').is('b')).toEqual(['b', 'c', 'a', 'D'])
    expect(anysort(getArr()).i().is('c').is('b').all('a')).toEqual(['a', 'b', 'c', 'D'])
  })

  it('anysort(arr).plugin(arg).plugin(arg) with custom plugin', function () {
    anysort.extends({
      ltZ: sort => sort.map(x => (x < 'Z') ? -1 : 1)
    })
    expect(anysort(getArr()).i()).toEqual(['a', 'b', 'c', 'D'])
    expect(anysort(getArr()).i().is('c')).toEqual(['c', 'a', 'b', 'D'])
    expect(anysort(getArr()).i().is('c').is('b')).toEqual(['b', 'c', 'a', 'D'])
    expect(anysort(getArr()).i().is('c').is('b').ltZ()).toEqual(['D', 'b', 'c', 'a'])
    expect(anysort(getArr()).i().is('c').ltZ().is('b')).toEqual(['b', 'D', 'c', 'a'])
  })

  it('anysort(arr).xxx: test nested objects', function () {
    const getPosts = () => [
      { foo: 'bbb', locals: { date: '2013-05-06' } },
      { foo: 'aab', locals: { date: null } },
      { locals: { date: '2015-04-12' } },
      { foo: 'ccc', locals: { date: '2014-01-02' } },
      { locals: { date: '2015-01-02' } },
      { foo: 'ddd', locals: { date: '2014-01-09' } },
      { foo: null, locals: {} },
      { foo: 'aac', locals: { date: '2014-02-02' } }
    ]
    expect(anysort(getPosts()).get('locals.date')).toEqual([
      { foo: 'bbb', locals: { date: '2013-05-06' } },
      { foo: 'ccc', locals: { date: '2014-01-02' } },
      { foo: 'ddd', locals: { date: '2014-01-09' } },
      { foo: 'aac', locals: { date: '2014-02-02' } },
      { locals: { date: '2015-01-02' } },
      { locals: { date: '2015-04-12' } },
      { foo: 'aab', locals: { date: null } },
      { foo: null, locals: {} }
    ])
    expect(anysort(getPosts()).get('locals.date').get('foo')).toEqual([
      { foo: 'aab', locals: { date: null } },
      { foo: 'aac', locals: { date: '2014-02-02' } },
      { foo: 'bbb', locals: { date: '2013-05-06' } },
      { foo: 'ccc', locals: { date: '2014-01-02' } },
      { foo: 'ddd', locals: { date: '2014-01-09' } },
      { locals: { date: '2015-01-02' } },
      { locals: { date: '2015-04-12' } },
      { foo: null, locals: {} }
    ])
    expect(anysort(getPosts()).locals.date.result().foo.result()).toEqual([
      { foo: 'aab', locals: { date: null } },
      { foo: 'aac', locals: { date: '2014-02-02' } },
      { foo: 'bbb', locals: { date: '2013-05-06' } },
      { foo: 'ccc', locals: { date: '2014-01-02' } },
      { foo: 'ddd', locals: { date: '2014-01-09' } },
      { locals: { date: '2015-01-02' } },
      { locals: { date: '2015-04-12' } },
      { foo: null, locals: {} }
    ])
    expect(anysort(getPosts()).locals.date.result().foo.result().foo.is('ccc')).toEqual([
      { foo: 'ccc', locals: { date: '2014-01-02' } },
      { foo: 'aab', locals: { date: null } },
      { foo: 'aac', locals: { date: '2014-02-02' } },
      { foo: 'bbb', locals: { date: '2013-05-06' } },
      { foo: 'ddd', locals: { date: '2014-01-09' } },
      { locals: { date: '2015-01-02' } },
      { locals: { date: '2015-04-12' } },
      { foo: null, locals: {} }
    ])
    expect(anysort(getPosts()).locals.date.result().foo.result().foo.is('ccc').reverse_reverse()).toEqual([
      { foo: 'ccc', locals: { date: '2014-01-02' } },
      { foo: 'aab', locals: { date: null } },
      { foo: 'aac', locals: { date: '2014-02-02' } },
      { foo: 'bbb', locals: { date: '2013-05-06' } },
      { foo: 'ddd', locals: { date: '2014-01-09' } },
      { locals: { date: '2015-01-02' } },
      { locals: { date: '2015-04-12' } },
      { foo: null, locals: {} }
    ])
  })

})

/**
 * Test Error Catch
 */

 describe('Expected Error', function () {

  it('error: illegal command', function () {
    expect(() => anysort([1,2,3], '()is-(a)')).toThrow(/\[ANYSORT\]/)
  })

  it('error: build-in plugin errors', function () {

    expect(() => anysort([1,2,3]).i()).toThrow(/\[ANYSORT\]/)

    expect(() => anysort([1,2,3]).is()).toThrow(/\[ANYSORT\]/)

    expect(() => anysort([1,2,3]).nth()).toThrow(/\[ANYSORT\]/)

    expect(() => anysort([{},{}]).nth(1)).toThrow(/\[ANYSORT\]/)

    expect(() => anysort([1,2,3]).all()).toThrow(/\[ANYSORT\]/)

    expect(() => anysort([{},{}]).all('1')).toThrow(/\[ANYSORT\]/)

    expect(() => anysort([1,2,3]).has()).toThrow(/\[ANYSORT\]/)

    expect(() => anysort([{},{}]).has('1')).toThrow(/\[ANYSORT\]/)

    expect(() => anysort([{},{}]).len()).toThrow(/\[ANYSORT\]/)

    expect(() => anysort([{},{}]).len(1)).toThrow(/\[ANYSORT\]/)

    expect(() => anysort([1,2,3]).get()).toThrow(/\[ANYSORT\]/)

  })

  it('error: custom plugin errors', function () {
    expect(() => {
      anysort.extends({
        aaa: sort => { throw new Error('asdf') }
      })
      anysort([1,2,3]).aaa()
    }).toThrow(/asdf/)
  })

  it('error: wrapper patched arr again', function () {
    expect(() => anysort.wrap(anysort([1,2,3]))).toThrow(/\[ANYSORT\]/)
  })

})

/**
 * Test Error Catch
 */

 describe('Warn (increase code coverage for if-else sentences)', function () {

  it('uncomparable type', function () {
    const a1 = { [Symbol.toStringTag]: 'a1', a1: 'a1' }
    const a2 = { [Symbol.toStringTag]: 'a2', a2: 'a2' }
    expect(anysort([a1,a2])).toEqual([a1, a2])
  })

})
