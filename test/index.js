// TODO test extends

require('mocha')
require('should')

const anysort = require('../build/index.min.js')

const arraySort = (arr, ...arg) => arr.sort(anysort(...arg))

describe('Test basic sorting functions', function () {
  it('arrays of numbers', function () {
    const arr = [3, 5, 0, 2, -9, 6, 1, 4, 7, 8]
    arraySort(arr).should.eql([-9, 0, 1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('arrays of chars', function () {
    const alphas = 'abcdefghijklmnopqrstuvwxyz'
    const arr = alphas.split('').sort((a, b) => Math.random() - 0.5)
    arraySort(arr).should.eql(alphas.split(''))
  })

  it('arrays of strings', function () {
    const arr = ['zoo', 'alpha', '', 'google', 'gap']
    arraySort(arr).should.eql(['', 'alpha', 'gap', 'google', 'zoo'])
  })

  it('arrays of primitives', function () {
    const arr = ['d', 3, 'b', '', 'zoo', 'a', 'd', 1, 0, 'z']
    arraySort(arr).should.eql([0, 1, 3, '', 'a', 'b', 'd', 'd', 'z', 'zoo'])
  })

  it('arrays of mixed-type-elements', function () {
    const arr = ['d', { a: 0 }, 3, 'b', '', 'zoo', { 1: 1 }, 'a', 'd', { c: 3 }, 1, 0, 'z']
    arraySort(arr).should.eql(arr.sort())
  })

  it('arrays of objects sort by shallow property', function () {
    const arr = [{ key: 'y' }, { key: 'z' }, { key: 'x' }]
    arraySort(arr, 'key').should.eql([{ key: 'x' }, { key: 'y' }, { key: 'z' }])
  })

  it('arrays of objects sort by nested property', function () {
    const arr = [{ key: { key: 'y' } }, { key: { key: 'z' } }, { key: { key: 'x' } }]
    arraySort(arr, 'key.key').should.eql([{ key: { key: 'x' } }, { key: { key: 'y' } }, { key: { key: 'z' } }])
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
    const actual = arraySort(
      arr,
      compare('a'),
      compare('b'),
      compare('c'),
      compare('d')
    )
    actual.should.eql([
      { a: 'a', b: 'd', c: 'f', d: 'h' },
      { a: 'b', b: 'c', c: 'f', d: 'h' },
      { a: 'b', b: 'd', c: 'e', d: 'h' },
      { a: 'b', b: 'd', c: 'f', d: 'g' }
    ])
  })
})

describe('Test advance use cases', function () {
  it('sort by multiple properties in order', function () {
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
  it('put null and undefined at the end of array', function () {
    const arr = [null, 'd', 3, 'b', '', 'zoo', undefined, 'a', 'd', 1, 0, 'z']
    arraySort(arr).should.eql([0, 1, 3, '', 'a', 'b', 'd', 'd', 'z', 'zoo', null, undefined])
  })

  it('skip when get wrong properties', function () {
    const arr = [{ key: 'y' }, { key: 'z' }, { key: 'x' }]
    arraySort(arr, 'wrong-key').should.eql([{ key: 'y' }, { key: 'z' }, { key: 'x' }])
  })

  it('skip when cant sort', function () {
    const arr = [{ 1: 1 }, { 3: 1 }, { 2: 1 }, { 4: 1 }]
    arraySort(arr, 'a.b').should.eql(arr)
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
  it('plugin: ignore case', function () {
    const arr = ['a', 'b', 'c', 'D']
    arraySort(arr).should.eql(['D', 'a', 'b', 'c'])
    arraySort(arr, 'i()').should.eql(['a', 'b', 'c', 'D'])
  })

  it('plugin: reverse', function () {
    const arr = ['a', 'b', 'c', 'D']
    arraySort(arr, 'reverse()').should.eql(['c', 'b', 'a', 'D'])
  })

  it('plugin: is', function () {
    const arr = ['a', 'b', 'c', 'D']
    arraySort(arr, 'is(c)').should.eql(['c', 'a', 'b', 'D'])
  })

  it('plugin: has', function () {
    const arrNums = [[1, 2], [2, 3], [2, 3], [1, 3]]
    arraySort(arrNums, 'has(3)').should.eql([[2, 3], [2, 3], [1, 3], [1, 2]])
    const arrStrings = ['alpha', 'google', 'zoo', 'oowps']
    arraySort(arrStrings, 'has(oo)').should.eql(['google', 'zoo', 'oowps', 'alpha'])
  })

  it('plugin: not', function () {
    const arr = ['a', 'b', 'c', 'D']
    arraySort(arr, 'not(c)').should.eql(['a', 'b', 'D', 'c'])
  })

  it('plugin: len', function () {
    const getArrStrings = () => ['alpha', 'google', 'zoo', 'oowps']
    arraySort(getArrStrings(), 'len()').should.eql(['zoo', 'alpha', 'oowps', 'google'])
    arraySort(getArrStrings(), 'len(3)').should.eql(['zoo', 'alpha', 'google', 'oowps'])
  })
})

describe('Test advance plugin operations', function () {
  it('plugin: custom plugin', function () {
    const arr = ['a', 'b', 'c', 'D']
    anysort.extends({
      lowercase: sort => sort.map(x => (x || '').toLowerCase())
    })
    arraySort(arr).should.eql(['D', 'a', 'b', 'c'])
    arraySort(arr, 'lowercase()').should.eql(['a', 'b', 'c', 'D'])
  })

  it('plugin: multy commands', function () {
    const getArr = () => ['b', 'a', 'E', 'c', 'D']
    arraySort(getArr(), 'i()').should.eql(['a', 'b', 'c', 'D', 'E'])
    arraySort(getArr(), 'is(c)').should.eql(['c', 'b', 'a', 'E', 'D'])
    arraySort(getArr(), 'is(c)-reverse()').should.eql(['b', 'a', 'E', 'D', 'c'])
    arraySort(getArr(), 'is(c)-reverse()-reverse()').should.eql(['c', 'b', 'a', 'E', 'D'])
    arraySort(getArr(), 'is(c)', 'i()-reverse()').should.eql(['c', 'E', 'D', 'b', 'a'])
  })
})
