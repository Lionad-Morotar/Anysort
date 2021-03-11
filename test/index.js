const isDev = process.env.NODE === 'DEV'

// TODO test extends

require('mocha');
require('should');
var get = require('get-value');

var anysort = require('../build');

const arraySort = (arr, ...arg) => arr.sort(anysort(...arg))

// describe('排序插件正常工作', function () {
//   const getBasic = _ => [1, 4, 8, '2', '5', '10']
//   it('插件：类型排序', function () {
//     const symbols = [Symbol('a'), Symbol('b'), Symbol('c'), Symbol('d'), Symbol('z')]
//     const symbolArr = [symbols[3], symbols[1], symbols[0], symbols[2], symbols[4]]
//     arraySort(symbolArr, 'by(symbol)').should.eql(symbols)
//     const arr = getBasic()
//     arraySort(arr).should.eql([1, '10', '2', 4, '5', 8])
//     arraySort(arr, 'by(number)').should.eql([1, '2', 4, '5', 8, '10'])
//   })
//   it('插件：忽略大小写', function () {
//     const arr = ['a', 'b', 'c', 'D']
//     arraySort(arr).should.eql(['D', 'a', 'b', 'c'])
//     arraySort(arr, 'i()').should.eql(['a', 'b', 'c', 'D'])
//   })
//   it('插件：正序', function () {
//     const arr = ['a', 'b', 'D', 'c']
//     arraySort(arr, 'asc()').should.eql(['D', 'a', 'b', 'c'])
//   })
//   it('插件：倒序', function () {
//     const arr = ['a', 'b', 'D', 'c']
//     arraySort(arr, 'dec()').should.eql(['c', 'b', 'a', 'D'])
//   })
//   it('插件：选取和比较', function () {
//     const testIs = getBasic()
//     arraySort(testIs, 'is(10)').should.eql(['10', 1, 4, 8, '2', '5'])
//     const testAll = [[1,2,3],[2,2,2],[3,2,1]]
//     arraySort(testAll, 'all(2)').should.eql([[2,2,2],[1,2,3],[3,2,1]])
//     const testHas = testAll
//     arraySort(testHas, 'has(1)').should.eql([[1,2,3],[3,2,1],[2,2,2]])
//   })
//   it('插件：自定义插件', function () {
//     const arr = ['a', 'b', 'c', 'D']
//     anysort.extends({
//       lowercase: sort => sort.map(x => (x || '').toLowerCase())
//     })
//     arraySort(arr).should.eql(['D', 'a', 'b', 'c'])
//     arraySort(arr, 'lowercase()').should.eql(['a', 'b', 'c', 'D'])
//   })
//   // TODO 随机插件怎么写测试？
// })

describe('array sort', function() {
  var posts = [
    { path: 'a.md', locals: { date: '2014-01-09' } },
    { path: 'f.md', locals: { date: '2014-01-02' } },
    { path: 'd.md', locals: { date: '2013-05-06' } },
    { path: 'e.md', locals: { date: '2015-01-02' } },
    { path: 'b.md', locals: { date: '2012-01-02' } },
    { path: 'f.md', locals: { date: '2014-06-01' } },
    { path: 'c.md', locals: { date: '2015-04-12' } },
    { path: 'g.md', locals: { date: '2014-02-02' } },
  ];

  it('should sort an array of primitives', function () {
    var arr = ['d', 3, 'b', 'a', 'd', 1, 0, 'z'];
    arraySort(arr).should.eql([0, 1, 3, 'a', 'b', 'd', 'd', 'z']);
  })

  it('should sort by a property:', function() {
    var arr = [{key: 'y'}, {key: 'z'}, {key: 'x'}];
    arraySort(arr, 'key').should.eql([
      {key: 'x'},
      {key: 'y'},
      {key: 'z'}
    ]);

    arraySort(posts, 'path').should.eql([
      { path: 'a.md', locals: { date: '2014-01-09' } },
      { path: 'b.md', locals: { date: '2012-01-02' } },
      { path: 'c.md', locals: { date: '2015-04-12' } },
      { path: 'd.md', locals: { date: '2013-05-06' } },
      { path: 'e.md', locals: { date: '2015-01-02' } },
      { path: 'f.md', locals: { date: '2014-01-02' } },
      { path: 'f.md', locals: { date: '2014-06-01' } },
      { path: 'g.md', locals: { date: '2014-02-02' } }
    ]);
  });

  it('should sort by a property with null values:', function() {
    var arr = [{ key: 'z' }, { key: null }, {key: 'x'}];
    arraySort(arr, 'key').should.eql([
      {key: 'x'},
      {key: 'z'},
      {key: null},
    ]);
  });

  it('should sort by a property with undefined values:', function() {
    var arr = [{ key: 'z' }, {}, {key: 'x'}];
    arraySort(arr, 'key').should.eql([
      {key: 'x'},
      {key: 'z'},
      {},
    ]);
  });

  it('should sort by a property with null and undefined values:', function() {
    var arr = [{key: null}, {key: 'z'}, {}, {key: 'x'}];
    arraySort(arr, 'key').should.eql([
      {key: 'x'},
      {key: 'z'},
      {key: null},
      {},
    ]);
  });

  it('should sort by a nested property:', function() {
    var res = arraySort(posts, 'locals.date');
    res.should.eql([
      { path: 'b.md', locals: { date: '2012-01-02' } },
      { path: 'd.md', locals: { date: '2013-05-06' } },
      { path: 'f.md', locals: { date: '2014-01-02' } },
      { path: 'a.md', locals: { date: '2014-01-09' } },
      { path: 'g.md', locals: { date: '2014-02-02' } },
      { path: 'f.md', locals: { date: '2014-06-01' } },
      { path: 'e.md', locals: { date: '2015-01-02' } },
      { path: 'c.md', locals: { date: '2015-04-12' } }
    ]);
  });

  it('should do nothing when the specified property is not supported:', function() {
    var arr = [
      {a: {b: {c: 'c'}}},
      {a: {b: {z: 'z'}}},
      {a: {b: {u: 'u'}}},
      {a: {b: {y: 'y'}}}
    ];

    arraySort(arr, 'a.b').should.eql([
      {a: {b: {c: 'c'}}},
      {a: {b: {z: 'z'}}},
      {a: {b: {u: 'u'}}},
      {a: {b: {y: 'y'}}}
    ]);
  });

  it('should sort by multiple properties:', function() {
    var posts = [
      { foo: 'bbb', locals: { date: '2013-05-06' } },
      { foo: 'aaa', locals: { date: '2012-01-02' } },
      { foo: 'ddd', locals: { date: '2015-04-12' } },
      { foo: 'ccc', locals: { date: '2014-01-02' } },
      { foo: 'ccc', locals: { date: '2015-01-02' } },
      { foo: 'ddd', locals: { date: '2014-01-09' } },
      { foo: 'bbb', locals: { date: '2014-06-01' } },
      { foo: 'aaa', locals: { date: '2014-02-02' } },
    ];

    var actual = arraySort(posts, ['foo', 'locals.date']);

    actual.should.eql([
      { foo: 'aaa', locals: { date: '2012-01-02' } },
      { foo: 'aaa', locals: { date: '2014-02-02' } },
      { foo: 'bbb', locals: { date: '2013-05-06' } },
      { foo: 'bbb', locals: { date: '2014-06-01' } },
      { foo: 'ccc', locals: { date: '2014-01-02' } },
      { foo: 'ccc', locals: { date: '2015-01-02' } },
      { foo: 'ddd', locals: { date: '2014-01-09' } },
      { foo: 'ddd', locals: { date: '2015-04-12' } }
    ]);
  });

  it('should sort by multiple properties with null values:', function() {
    var posts = [
      { foo: 'bbb', locals: { date: '2013-05-06' } },
      { foo: 'aaa', locals: { date: '2012-01-02' } },
      { foo: null, locals: { date: '2015-04-12' } },
      { foo: 'ccc', locals: { date: '2014-01-02' } },
      { foo: null, locals: { date: '2015-01-02' } },
      { foo: 'ddd', locals: { date: '2014-01-09' } },
      { foo: 'bbb', locals: { date: null } },
      { foo: 'aaa', locals: { date: '2014-02-02' } },
    ];

    var actual = arraySort(posts, ['foo', 'locals.date']);

    actual.should.eql([
      { foo: 'aaa', locals: { date: '2012-01-02' } },
      { foo: 'aaa', locals: { date: '2014-02-02' } },
      { foo: 'bbb', locals: { date: '2013-05-06' } },
      { foo: 'bbb', locals: { date: null } },
      { foo: 'ccc', locals: { date: '2014-01-02' } },
      { foo: 'ddd', locals: { date: '2014-01-09' } },
      { foo: null, locals: { date: '2015-01-02' } },
      { foo: null, locals: { date: '2015-04-12' } },
    ]);
  });

  it('should sort by multiple properties with undefined values:', function() {
    var posts = [
      { foo: 'bbb', locals: { date: '2013-05-06' } },
      { foo: 'aaa', locals: { date: '2012-01-02' } },
      { locals: { date: '2015-04-12' } },
      { foo: 'ccc', locals: { date: '2014-01-02' } },
      { locals: { date: '2015-01-02' } },
      { foo: 'ddd', locals: { date: '2014-01-09' } },
      { foo: 'bbb', locals: {} },
      { foo: 'aaa', locals: { date: '2014-02-02' } },
    ];

    var actual = arraySort(posts, ['foo', 'locals.date']);

    actual.should.eql([
      { foo: 'aaa', locals: { date: '2012-01-02' } },
      { foo: 'aaa', locals: { date: '2014-02-02' } },
      { foo: 'bbb', locals: { date: '2013-05-06' } },
      { foo: 'bbb', locals: {} },
      { foo: 'ccc', locals: { date: '2014-01-02' } },
      { foo: 'ddd', locals: { date: '2014-01-09' } },
      { locals: { date: '2015-01-02' } },
      { locals: { date: '2015-04-12' } },
    ]);
  });

  it('should sort by multiple properties with null and undefined values:', function() {
    var posts = [
      { foo: 'bbb', locals: { date: '2013-05-06' } },
      { foo: 'aaa', locals: { date: null } },
      { locals: { date: '2015-04-12' } },
      { foo: 'ccc', locals: { date: '2014-01-02' } },
      { locals: { date: '2015-01-02' } },
      { foo: 'ddd', locals: { date: '2014-01-09' } },
      { foo: null, locals: {} },
      { foo: 'aaa', locals: { date: '2014-02-02' } },
    ];

    var actual = arraySort(posts, ['foo', 'locals.date']);

    actual.should.eql([
      { foo: 'aaa', locals: { date: '2014-02-02' } },
      { foo: 'aaa', locals: { date: null } },
      { foo: 'bbb', locals: { date: '2013-05-06' } },
      { foo: 'ccc', locals: { date: '2014-01-02' } },
      { foo: 'ddd', locals: { date: '2014-01-09' } },
      { locals: { date: '2015-01-02' } },
      { locals: { date: '2015-04-12' } },
      { foo: null, locals: {} },
    ]);
  });

  it('should sort with a function:', function() {
    var arr = [{key: 'y'}, {key: 'z'}, {key: 'x'}];

    var actual = arraySort(arr, function(a, b) {
      return a.key < b.key ? -1 : (a.key > b.key ? 1 : 0);
    });

    actual.should.eql([
      {key: 'x'},
      {key: 'y'},
      {key: 'z'}
    ]);
  });

  it('should support sorting with a list of function:', function() {
    var arr = [
      {foo: 'w', bar: 'y', baz: 'w', quux: 'a'},
      {foo: 'x', bar: 'y', baz: 'w', quux: 'b'},
      {foo: 'x', bar: 'y', baz: 'z', quux: 'c'},
      {foo: 'x', bar: 'x', baz: 'w', quux: 'd'},
    ];

    var compare = function(prop) {
      return function(a, b) {
        return a[prop].localeCompare(b[prop]);
      };
    };

    var actual = arraySort(arr,
      compare('foo'),
      compare('bar'),
      compare('baz'),
      compare('quux'));

    actual.should.eql([
      { foo: 'w', bar: 'y', baz: 'w', quux: 'a' },
      { foo: 'x', bar: 'x', baz: 'w', quux: 'd' },
      { foo: 'x', bar: 'y', baz: 'w', quux: 'b' },
      { foo: 'x', bar: 'y', baz: 'z', quux: 'c' }
    ]);
  });

  it('should support sorting with an array of function:', function() {
    var arr = [
      {foo: 'w', bar: 'y', baz: 'w', quux: 'a'},
      {foo: 'x', bar: 'y', baz: 'w', quux: 'b'},
      {foo: 'x', bar: 'y', baz: 'z', quux: 'c'},
      {foo: 'x', bar: 'x', baz: 'w', quux: 'd'},
    ];

    var compare = function(prop) {
      return function(a, b) {
        return a[prop].localeCompare(b[prop]);
      };
    };

    var actual = arraySort(arr, [
      compare('foo'),
      compare('bar'),
      compare('baz'),
      compare('quux')
    ]);

    actual.should.eql([
      { foo: 'w', bar: 'y', baz: 'w', quux: 'a' },
      { foo: 'x', bar: 'x', baz: 'w', quux: 'd' },
      { foo: 'x', bar: 'y', baz: 'w', quux: 'b' },
      { foo: 'x', bar: 'y', baz: 'z', quux: 'c' }
    ]);
  });

  it('should support sorting with any combination of functions and properties:', function() {
    var posts = [
      { path: 'a.md', locals: { date: '2014-01-01', foo: 'zzz', bar: 1 } },
      { path: 'f.md', locals: { date: '2014-01-01', foo: 'mmm', bar: 2 } },
      { path: 'd.md', locals: { date: '2014-01-01', foo: 'xxx', bar: 3 } },
      { path: 'i.md', locals: { date: '2014-01-01', foo: 'xxx', bar: 5 } },
      { path: 'k.md', locals: { date: '2014-01-01', foo: 'xxx', bar: 1 } },
      { path: 'j.md', locals: { date: '2014-01-01', foo: 'xxx', bar: 4 } },
      { path: 'h.md', locals: { date: '2014-01-01', foo: 'xxx', bar: 6 } },
      { path: 'l.md', locals: { date: '2014-01-01', foo: 'xxx', bar: 7 } },
      { path: 'e.md', locals: { date: '2015-01-02', foo: 'aaa', bar: 8 } },
      { path: 'b.md', locals: { date: '2012-01-02', foo: 'ccc', bar: 9 } },
      { path: 'f.md', locals: { date: '2014-06-01', foo: 'rrr', bar: 10 } },
      { path: 'c.md', locals: { date: '2015-04-12', foo: 'ttt', bar: 11 } },
      { path: 'g.md', locals: { date: '2014-02-02', foo: 'yyy', bar: 12 } },
    ];

    var compare = function(prop) {
      return function(a, b, fn) {
        var valA = get(a, prop);
        var valB = get(b, prop);
        return valA === valB ? 0 : (valA < valB ? -1 : 1);
      };
    };

    var actual = arraySort(posts, 'locals.date', 'doesnt.exist', compare('locals.foo'), [
      compare('locals.bar')
    ]);

    actual.should.eql([
      { path: 'b.md', locals: { date: '2012-01-02', foo: 'ccc', bar: 9 } },
      { path: 'f.md', locals: { date: '2014-01-01', foo: 'mmm', bar: 2 } },
      { path: 'k.md', locals: { date: '2014-01-01', foo: 'xxx', bar: 1 } },
      { path: 'd.md', locals: { date: '2014-01-01', foo: 'xxx', bar: 3 } },
      { path: 'j.md', locals: { date: '2014-01-01', foo: 'xxx', bar: 4 } },
      { path: 'i.md', locals: { date: '2014-01-01', foo: 'xxx', bar: 5 } },
      { path: 'h.md', locals: { date: '2014-01-01', foo: 'xxx', bar: 6 } },
      { path: 'l.md', locals: { date: '2014-01-01', foo: 'xxx', bar: 7 } },
      { path: 'a.md', locals: { date: '2014-01-01', foo: 'zzz', bar: 1 } },
      { path: 'g.md', locals: { date: '2014-02-02', foo: 'yyy', bar: 12 } },
      { path: 'f.md', locals: { date: '2014-06-01', foo: 'rrr', bar: 10 } },
      { path: 'e.md', locals: { date: '2015-01-02', foo: 'aaa', bar: 8 } },
      { path: 'c.md', locals: { date: '2015-04-12', foo: 'ttt', bar: 11 } }
    ]);
  });
});
