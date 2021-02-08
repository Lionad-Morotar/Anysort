var anysort = require('../build');

var posts = [
  { tag: ['mp3'], status: '', date: new Date('2015-01-02'), comments: { length: 5 } },
  { tag: ['mp3'], status: '', date: new Date('2015-01-02'), comments: { length: 6 } } ,
  { tag: ['mp4'], status: '', date: new Date('2014-06-01'), comments: { length: 7 } },
  { tag: ['blog'], status: 'editing', date: new Date('2012-01-02'), comments: { length: 3 } },
  { tag: ['blog'], status: 'done', date: new Date('2013-05-06'), comments: { length: 1 } },
  { tag: ['blog'], status: 'editing', date: new Date('2012-01-02'), comments: { length: 2 } },
  { tag: ['blog'], status: 'editing', date: new Date('2014-01-02'), comments: { length: 3 } },
  { tag: ['blog'], status: 'done', date: new Date('2014-02-02'), comments: { length: 4 } },
];

// 选择正在写的博客，根据评论数倒序、时间倒序展示
posts.sort(
  anysort(
    'tag-has(blog)',
    'status-is(editing)',
    'comments-len()-dec()',
    'date-dec()'
  )
).map(x => console.log(JSON.stringify(x)))

// Results in:
//  { "tag": ["blog"], "status": "editing", "date": "2014-01-02", "comments": { "length": 3 } },
//  { "tag": ["blog"], "status": "editing", "date": "2012-01-02", "comments": { "length": 3 } },
//  { "tag": ["blog"], "status": "editing", "date": "2012-01-02", "comments": { "length": 2 } },
//  { "tag": ["blog"], "status": "done", "date": "2014-02-02", "comments": { "length": 4 } },
//  { "tag": ["blog"], "status": "done", "date": "2013-05-06", "comments": { "length": 1 } },
//  { "tag": ["mp4"], "status": "", "date": "2014-06-01", "comments": { "length": 7 } },
//  { "tag": ["mp3"], "status": "", "date": "2015-01-02", "comments": { "length": 6 } },
//  { "tag": ["mp3"], "status": "", "date": "2015-01-02", "comments": { "length": 5 } },
