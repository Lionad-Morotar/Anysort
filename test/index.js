// @ts-ignore
/* eslint-disable */

// TODO test extends

require('mocha')
require('should')

const assert = require('assert')
const anysort = require('../build/index.min.js')

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
    anysort(getArr()).should.eql([3, 5, 0, 2, -9, 6, 1, 4, 7, 8])
    anysort(getArr(), []).should.eql([3, 5, 0, 2, -9, 6, 1, 4, 7, 8])

    anysort.config.autoSort = true
    anysort(getArr()).should.eql([-9, 0, 1, 2, 3, 4, 5, 6, 7, 8])
    anysort(getArr(), []).should.eql([-9, 0, 1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('config.autoWrap', function () {
    const patchedKey = anysort.config.patched
    const patchedResult = true

    const getArr = () => [3, 5, 0, 2, -9, 6, 1, 4, 7, 8]

    anysort.config.autoWrap = false
    assert.equal(anysort(getArr())[patchedKey], undefined)

    anysort.config.autoWrap = true
    assert.equal(anysort(getArr())[patchedKey], patchedResult)
  })

  it('config.orders', function () {
    const backupOrders = anysort.config.orders
    const d1 = new Date(1)
    const d5 = new Date(5)
    const getArr = () => ['d', { a: 0 }, 3, 'b', d5, '', null, d1, 'zoo', null, { 1: 1 }, undefined, 'a', 'd', { c: 3 }, 1, 0, 'z']

    anysort.config.orders = { string: 1, number: 2, rest: 3, void: 4 }
    console.log(anysort(getArr()))
    anysort(getArr()).should.eql(['', 'a', 'b', 'd', 'd', 'z', 'zoo', 0, 1, 3, { a: 0 }, d1, d5, { 1: 1 }, { c: 3 }, null, null, undefined])

    anysort.config.orders = backupOrders
    anysort(getArr()).should.eql([0, 1, 3, '', 'a', 'b', 'd', 'd', 'z', 'zoo', d1, d5, {a:0}, {1:1}, {c:3}, null, null, undefined])
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
          arraySort(arr).should.eql([-9, 0, 1, 2, 3, 4, 5, 6, 7, 8])
          arraySort(arr, []).should.eql([-9, 0, 1, 2, 3, 4, 5, 6, 7, 8])
        })

        it('arrays of chars', function () {
          const alphas = 'abcdefghijklmnopqrstuvwxyz'
          const arr = alphas.split('').sort(() => Math.random() - 0.5)
          arraySort(arr).should.eql(alphas.split(''))
        })

        it('arrays of strings', function () {
          const arr = ['zoo', 'alpha', '', 'google', 'gap']
          arraySort(arr).should.eql(['', 'alpha', 'gap', 'google', 'zoo'])
        })

        it('arrays of primitives', function () {
          const arr = [0, '0', 1, undefined, 'd', '1', '0', null, 0, '', undefined]
          arraySort(arr).should.eql([0, 0, 1, '', '0', '0', '1', 'd', null, undefined, undefined])
        })

        it('arrays of dates', function () {
          const d1 = new Date(1)
          const d5 = new Date(5)
          const d100 = new Date(100)
          const d500 = new Date(500)
          const arr = [d100, d5, d1, d500]
          arraySort(arr).should.eql([d1, d5, d100, d500])
        })

        it('arrays of symbols', function () {
          const toString = xs => xs.map(x => x.toString())
          const arr = [Symbol('d'), Symbol('c'), Symbol('a'), Symbol('b')]
          toString(arraySort(arr)).should.eql(toString([Symbol('a'), Symbol('b'), Symbol('c'), Symbol('d')]))
        })

        it('arrays of functions by name', function () {
          const arr = [
            function name_c() {},
            () => {},
            function name_a() {},
            function name_b() {},
          ]
          console.log(arraySort(arr))
          arraySort(arr).should.eql([
            () => {},
            function name_a() {},
            function name_b() {},
            function name_c() {},
          ])
        })

        it('do nothing with objects if no plugins in use', function () {
          const arr = [{b:'b'}, {c:'c'}, {e:'e'}, {a:'a'}, {f:'f'}, {d:'d'}]
          arraySort(arr).should.eql([{b:'b'}, {c:'c'}, {e:'e'}, {a:'a'}, {f:'f'}, {d:'d'}])
        })

        it('arrays of mixed-type-elements', function () {
          const arr = ['d', { a: 0 }, 3, 'b', '', 'zoo', { 1: 1 }, 'a', 'd', { c: 3 }, 1, 0, 'z']
          arraySort(arr).should.eql([0, 1, 3, '', 'a', 'b', 'd', 'd', 'z', 'zoo', {a:0}, {1:1}, {c:3}])
        })

        it('arrays of objects sort by shallow property', function () {
          const arr = [{ key: 'y' }, { key: 'z' }, { key: 'x' }]
          arraySort(arr, ['key']).should.eql([{ key: 'x' }, { key: 'y' }, { key: 'z' }])
        })

        it('arrays of objects sort by nested property', function () {
          const arr = [{ key: { key: 'y' } }, { key: { key: 'z' } }, { key: { key: 'x' } }]
          arraySort(arr, ['key.key']).should.eql([{ key: { key: 'x' } }, { key: { key: 'y' } }, { key: { key: 'z' } }])
        })

        it('arrays of objects sort by property on its prototype', function () {
          const arr = ['aa', 'cccc', 'd', 'eee', 'b']
          arraySort(arr, ['length']).should.eql(['d', 'b', 'aa', 'eee', 'cccc'])
          const arr2 = ['aa', 'cccc', 'd', 'eee', 'b']
          arraySort(arr2, ['length-reverse()']).should.eql(['cccc', 'eee', 'aa', 'd', 'b'])
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
          actual.should.eql([
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
          results.should.eql([
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
          arraySort(arr).should.eql([])
          arraySort(arr, []).should.eql([])
        })

        it('put null and undefined at the end of array', function () {
          const arr = [null, 'd', 3, 'b', '', 'zoo', undefined, 'a', 'd', 1, 0, 'z']
          arraySort(arr).should.eql([0, 1, 3, '', 'a', 'b', 'd', 'd', 'z', 'zoo', null, undefined])
        })

        it('skip when get wrong properties', function () {
          const arr = [{ key: 'y' }, { key: 'z' }, { key: 'x' }]
          arraySort(arr, ['wrong-key']).should.eql([{ key: 'y' }, { key: 'z' }, { key: 'x' }])
        })

        it('skip when cant sort', function () {
          const arr = [{ 1: 1 }, { 3: 1 }, { 2: 1 }, { 4: 1 }]
          arraySort(arr, ['a.b']).should.eql(arr)
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
          actual.should.eql([
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
          arraySort(arr).should.eql(['D', 'a', 'b', 'c'])
          arraySort(arr, ['i()']).should.eql(['a', 'b', 'c', 'D'])
        })

        it('plugin: reverse', function () {
          const arr = ['a', 'b', 'c', 'D']
          arraySort(arr, ['reverse()']).should.eql(['c', 'b', 'a', 'D'])
        })

        it('plugin: is', function () {
          const arr = ['a', 'b', 'c', 'D']
          arraySort(arr, ['is(c)']).should.eql(['c', 'a', 'b', 'D'])
          // * wrong usage because '0' cant compare with number 0
          // const arr2 = [3, 5, 0, 2, -9, 6, 1, 4, 7, 8]
          // arraySort(arr2, ['is(0)']).should.eql([0, 3, 5, 2, -9, 6, 1, 4, 7, 8])
        })

        it('plugin: nth', function () {
          const arr = ['aaac', 'aaaa', 'aaad', 'aaab']
          arraySort(arr, ['nth(3)']).should.eql(['aaaa', 'aaab', 'aaac', 'aaad'])
          const arr2 = [['aaac'], ['aaaa'], ['aaad'], ['aaab']]
          arraySort(arr2, ['nth(0)-nth(3)']).should.eql([['aaaa'], ['aaab'], ['aaac'], ['aaad']])
          // * wrong usage
          // const arr3 = [[3, 'aaac'], ['aaaa'], [1, 'aaad', 1], ['aaab']]
          // arraySort(arr3, ['nth(0)-nth(3)']).should.eql([['aaaa'], ['aaab'], [3, 'aaac'], [1, 'aaad', 1]])
        })

        it('plugin: all', function () {
          const arr = [['a', 'b'], ['a'], ['a', 'c']]
          arraySort(arr, ['all(a)']).should.eql([['a'], ['a', 'b'], ['a', 'c']])
          // * wrong usage
          // const arr2 = ['aaac', 'aaaa', 'aaad', 'aaab']
          const arr2 = ['c', 'a', 'd', 'b']
          arraySort(arr2, ['all(a)']).should.eql(['a', 'c', 'd', 'b'])
        })

        it('plugin: has', function () {
          const arrNums = [[1, 2], [2, 3], [2, 3], [1, 3]]
          arraySort(arrNums, ['has(3)']).should.eql([[2, 3], [2, 3], [1, 3], [1, 2]])
          const arrStrings = ['alpha', 'google', 'zoo', 'oowps']
          arraySort(arrStrings, ['has(oo)']).should.eql(['google', 'zoo', 'oowps', 'alpha'])
        })

        it('plugin: not', function () {
          const arr = ['a', 'b', 'c', 'D']
          arraySort(arr, ['not(c)']).should.eql(['a', 'b', 'D', 'c'])
        })

        it('plugin: len', function () {
          const getArrStrings = () => ['alpha', 'google', 'zoo', 'oowps']
          arraySort(getArrStrings(), ['len()']).should.eql(['zoo', 'alpha', 'oowps', 'google'])
          arraySort(getArrStrings(), ['len(3)']).should.eql(['zoo', 'alpha', 'google', 'oowps'])
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
          actual.should.eql([
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

      describe('Test advance plugin operations', function () {

        it('plugin: custom plugin', function () {
          const arr = ['a', 'b', 'c', 'D']
          anysort.extends({
            lowercase: sort => sort.map(x => (x || '').toLowerCase())
          })
          arraySort(arr).should.eql(['D', 'a', 'b', 'c'])
          arraySort(arr, ['lowercase()']).should.eql(['a', 'b', 'c', 'D'])
        })

        it('plugin: multy commands', function () {
          const getArr = () => ['b', 'a', 'E', 'c', 'D']
          arraySort(getArr(), ['i()']).should.eql(['a', 'b', 'c', 'D', 'E'])
          arraySort(getArr(), ['is(c)']).should.eql(['c', 'b', 'a', 'E', 'D'])
          arraySort(getArr(), ['is(c)-reverse()']).should.eql(['b', 'a', 'E', 'D', 'c'])
          arraySort(getArr(), ['is(c)-reverse()-reverse()']).should.eql(['c', 'b', 'a', 'E', 'D'])
          arraySort(getArr(), ['is(c)', 'i()-reverse()']).should.eql(['c', 'E', 'D', 'b', 'a'])
        })

        it('plugin: advance custom plugin usage', function () {
          const getArr = () => ['b', 'a', 'E', 'c', 'D']
          anysort.extends({
            ltZ: sort => sort.map(x => (x < 'Z') ? -1 : 1),
            // ltZ_filter: sort => sort.map(x => (x < 'Z') ? -1 : x),
          })
          arraySort(getArr(), ['is(c)', ((a, b) => (a < b) ? -1 : 1)]).should.eql(['c', 'D', 'E', 'a', 'b'])
          arraySort(getArr(), ['is(c)', ((a, b) => (a < 'Z') ? -1 : 1), ((a, b) => (a < b) ? -1 : 1), 'i()-reverse()', ]).should.eql(['c', 'D', 'E', 'b', 'a'])
          arraySort(getArr(), ['is(c)', 'ltZ()']).should.eql(['c', 'E', 'D', 'b', 'a'])
          arraySort(getArr(), ['is(c)', 'ltZ()-reverse()']).should.eql(['c', 'b', 'a', 'E', 'D'])
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
    anysort(getArr()).should.eql(['D', 'a', 'b', 'c'])
    assert.equal(anysort(getArr())[patchedKey], patchedResult)
  })

  it('anysort(arr).plugin(arg)', function () {
    anysort(getArr())
      .i().should.eql(['a', 'b', 'c', 'D'])
    anysort(getArr())
      .is('b').should.eql(['b', 'D', 'a', 'c'])
    anysort(['aaac', 'aaaa', 'aaad', 'aaab'])
      .nth(3).should.eql(['aaaa', 'aaab', 'aaac', 'aaad'])
    anysort([['a', 'b'], ['a'], ['a', 'c']])
      .all('a').should.eql([['a'], ['a', 'b'], ['a', 'c']])

    anysort.config.autoSort = false
    anysort(['alpha', 'google', 'zoo', 'oowps'])
      .has('oo').should.eql(['google', 'zoo', 'oowps', 'alpha'])
    anysort.config.autoSort = true
    anysort(['alpha', 'google', 'zoo', 'oowps'])
      .has('oo').should.eql(['google', 'oowps', 'zoo', 'alpha'])
  })

  it('anysort(arr).plugin(arg).plugin(arg)', function () {
    anysort(getArr())
      .i().should.eql(['a', 'b', 'c', 'D'])
    anysort(getArr())
      .i().is('c').should.eql(['c', 'a', 'b', 'D'])
    anysort(getArr())
      .i().is('c').is('b').should.eql(['b', 'c', 'a', 'D'])
    anysort(getArr())
      .i().is('c').is('b').all('a').should.eql(['a', 'b', 'c', 'D'])
  })

  it('anysort(arr).plugin(arg).plugin(arg) with custom plugin', function () {
    anysort.extends({
      ltZ: sort => sort.map(x => (x < 'Z') ? -1 : 1)
    })
    anysort(getArr())
      .i().should.eql(['a', 'b', 'c', 'D'])
    anysort(getArr())
      .i().is('c').should.eql(['c', 'a', 'b', 'D'])
    anysort(getArr())
      .i().is('c').is('b').should.eql(['b', 'c', 'a', 'D'])
    anysort(getArr())
      .i().is('c').is('b').ltZ().should.eql(['D', 'b', 'c', 'a'])
    anysort(getArr())
      .i().is('c').ltZ().is('b').should.eql(['b', 'D', 'c', 'a'])
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
    anysort(getPosts())
      .get('locals.date')
      .should.eql([
        { foo: 'bbb', locals: { date: '2013-05-06' } },
        { foo: 'ccc', locals: { date: '2014-01-02' } },
        { foo: 'ddd', locals: { date: '2014-01-09' } },
        { foo: 'aac', locals: { date: '2014-02-02' } },
        { locals: { date: '2015-01-02' } },
        { locals: { date: '2015-04-12' } },
        { foo: 'aab', locals: { date: null } },
        { foo: null, locals: {} }
      ])
    anysort(getPosts())
      .get('locals.date')
      .get('foo')
      .should.eql([
        { foo: 'aab', locals: { date: null } },
        { foo: 'aac', locals: { date: '2014-02-02' } },
        { foo: 'bbb', locals: { date: '2013-05-06' } },
        { foo: 'ccc', locals: { date: '2014-01-02' } },
        { foo: 'ddd', locals: { date: '2014-01-09' } },
        { locals: { date: '2015-01-02' } },
        { locals: { date: '2015-04-12' } },
        { foo: null, locals: {} }
      ])
    anysort(getPosts())
      .locals.date.result()
      .foo.result()
      .should.eql([
        { foo: 'aab', locals: { date: null } },
        { foo: 'aac', locals: { date: '2014-02-02' } },
        { foo: 'bbb', locals: { date: '2013-05-06' } },
        { foo: 'ccc', locals: { date: '2014-01-02' } },
        { foo: 'ddd', locals: { date: '2014-01-09' } },
        { locals: { date: '2015-01-02' } },
        { locals: { date: '2015-04-12' } },
        { foo: null, locals: {} }
      ])
    anysort(getPosts())
      .locals.date.result()
      .foo.result()
      .foo.is('ccc')
      .should.eql([
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
