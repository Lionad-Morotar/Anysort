var anysort = require('../src');

var posts = [
  { locals: { foo: 'bbb', date: '2013-05-06' }},
  { locals: { foo: 'aaa', date: '2012-01-02' }},
  { locals: { foo: 'ccc', date: '2014-01-02' }},
  { locals: { foo: 'ccc', date: '2015-01-02' }},
  { locals: { foo: 'bbb', date: '2014-06-01' }},
  { locals: { foo: 'aaa', date: '2014-02-02' }},
];

// sort by `locals.foo`, then `locals.date`
console.log(posts.sort(anysort('locals.foo', 'locals.date')))

// Results in:
// [
//   { locals: { foo: 'aaa', date: '2012-01-02' } },
//   { locals: { foo: 'aaa', date: '2014-02-02' } },
//   { locals: { foo: 'bbb', date: '2013-05-06' } },
//   { locals: { foo: 'bbb', date: '2014-06-01' } },
//   { locals: { foo: 'ccc', date: '2014-01-02' } },
//   { locals: { foo: 'ccc', date: '2015-01-02' } }
// ]
