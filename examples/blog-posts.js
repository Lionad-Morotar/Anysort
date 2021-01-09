var anysort = require('../src');

var posts = [
  { path: 'c.md', locals: { date: '2014-01-09' } },
  { path: 'a.md', locals: { date: '2014-01-02' } },
  { path: 'b.md', locals: { date: '2013-05-06' } },
];

// by `locals.date`
console.log(posts.sort(anysort('locals.date')));

// Results in:
// [
//   { path: 'b.md', locals: { date: '2013-05-06' } },
//   { path: 'a.md', locals: { date: '2014-01-02' } },
//   { path: 'c.md', locals: { date: '2014-01-09' } }
// ]
