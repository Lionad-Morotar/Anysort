const anysort = require('../src')
var get = require('get-value');

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

console.log(
  posts.sort(
    anysort(
      'foo', 'locals.date'
    )
  )
)
