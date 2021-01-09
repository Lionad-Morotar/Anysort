const anysort = require('../src')
var get = require('get-value');

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

var compare = function (prop) {
  return function (a, b, fn) {
    var valA = get(a, prop);
    var valB = get(b, prop);
    console.log(valA, valB)
    return valA === valB ? 0 : (valA < valB ? -1 : 1);
  };
};

console.log(
  posts.sort(
    anysort(
      'locals.date',
      'doesnt.exist',
      compare('locals.foo'),
      compare('locals.bar'),
    )
  )
)
