var anysort = require('../src');

var posts = [
  { tag: ['blog'], status: '', date: '2013-05-06', delete: 0 },
  { tag: ['blog'], status: 'todo', date: '2012-01-02', delete: 0 },
  { tag: ['blog'], status: 'todo', date: '2014-01-02', delete: 0 },
  { tag: ['mp3'], status: '', date: '2015-01-02', delete: 0 },
  { tag: ['mp3'], status: '', date: '2015-01-02', delete: 1 } ,
  { tag: ['mp4'], status: '', date: '2014-06-01', delete: 0 },
  { tag: ['blog'], status: '', date: '2014-02-02', delete: 1 },
];


// 优先选择还没写完且没有被删除的博客，按时间倒序展示
console.log(
  posts.sort(
    anysort(
      'status-is(todo)',
      'delete-not()',
      'tag-has(blog)',
      'date-dec()'
    )
  )
)

// Results in:
// [
//   { tag: ['blog'], status: 'todo', date: '2014-01-02', delete: 0 },
//   { tag: ['blog'], status: 'todo', date: '2012-01-02', delete: 0 },
//   { tag: ['blog'], status: '', date: '2013-05-06', delete: 0 },
//   { tag: ['mp3'], status: '', date: '2015-01-02', delete: 0 },
//   { tag: ['mp4'], status: '', date: '2014-06-01', delete: 0 },
//   { tag: ['blog'], status: '', date: '2014-02-02', delete: 1 },
//   { tag: ['mp3'], status: '', date: '2015-01-02', delete: 1 }
// ]
