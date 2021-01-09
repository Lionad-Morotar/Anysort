var anysort = require('../src');

var posts = [
  { tag: ['blog'], status: '', date: '2013-05-06', delete: 0 },
  { tag: ['blog'], status: 'todo', date: '2012-01-02', delete: 0 },
  { tag: ['mp3'], status: 'todo', date: '2014-01-02', delete: 0 },
  { tag: ['mp3'], status: '', date: '2015-01-02', delete: 0 },
  { tag: ['mp3'], status: '', date: '2015-01-02', delete: 1 } ,
  { tag: ['mp4'], status: '', date: '2014-06-01', delete: 0 },
  { tag: ['blog'], status: '', date: '2014-02-02', delete: 1 },
];


// 选择还没写完且没有被删除的博客，并按时间排序展示
console.log(
  posts.sort(
    anysort(
      'status-is(todo)',
      'delete-not(0)',
      'tag-has(blog)',
      'date'
    )
  )
)

// Results in:
// [
//   { name: 'aaa', tag: ['5'], status: 'todo', date: '2012-01-02' },
//   { name: 'ccc', tag: [], status: 'todo', date: '2014-01-02' },
//   { name: 'bbb', tag: ['5'], status: '', date: '2013-05-06' },
//   { name: 'bbb', tag: [], status: '', date: '2014-06-01' },
//   { name: 'ccc', tag: [], status: '', date: '2015-01-02' },
//   { name: 'aaa', tag: [], status: '', date: '2015-01-02' },
//   { name: 'aaa', tag: ['5'], status: 'deleted', date: '2014-02-02' }
// ]
