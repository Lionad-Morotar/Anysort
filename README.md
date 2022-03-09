# Anysort

<center>
  <img src="./statics/LOGO.jpg" style="width: 70vw; margin: auto;" />
  <p><strong>Anysort：灵活、优雅、低心智成本的多属性排序方法。</strong></p>
</center>

## Install

```sh
npm install --save https://github.com/Lionad-Morotar/anysort
```

## Basic usage

根据属性进行排序：

```js
const anysort = require('anysort')

const posts = [
  { locals: { foo: 'b', date: '2013-05-06' }},
  { locals: { foo: 'a', date: '2012-01-02' }},
  { locals: { foo: 'c', date: '2014-01-02' }},
  { locals: { foo: 'c', date: '2015-01-02' }},
  { locals: { foo: 'b', date: '2014-06-01' }},
  { locals: { foo: 'a', date: '2014-02-02' }},
];

posts.sort(anysort('locals.foo', 'locals.date'));

// Then you will get:
// [
//   { locals: { foo: 'a', date: '2012-01-02' } },
//   { locals: { foo: 'a', date: '2014-02-02' } },
//   { locals: { foo: 'b', date: '2013-05-06' } },
//   { locals: { foo: 'b', date: '2014-06-01' } },
//   { locals: { foo: 'c', date: '2014-01-02' } },
//   { locals: { foo: 'c', date: '2015-01-02' } }
// ]
```

## Advance Usage

选择正在写的博客，根据评论数倒序、时间倒序展示

```js
var posts = [
  { tag: ['mp3'], status: '', date: new Date('2015-01-02'), comments: { length: 5 } },
  { tag: ['mp3'], status: '', date: new Date('2015-01-02'), comments: { length: 6 } } ,
  { tag: ['mp4'], status: '', date: new Date('2014-06-01'), comments: { length: 7 } },
  { tag: ['blog'], status: 'editing', date: new Date('2012-01-02'), comments: { length: 3 } },
  { tag: ['blog'], status: 'done', date: new Date('2013-05-06'), comments: { length: 1 } },
  { tag: ['blog'], status: 'editing', date: new Date('2012-01-02'), comments: { length: 2 } },
  { tag: ['blog'], status: 'editing', date: new Date('2014-01-02'), comments: { length: 3 } },
  { tag: ['blog'], status: 'done', date: new Date('2014-02-02'), comments: { length: 4 } },
]

posts.sort(
  anysort(
    'tag-has(blog)',
    'status-is(editing)',
    'comments-len()-reverse()',
    'date-reverse()'
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
```

WIP: 近期有用 Proxy 把它重写的想法，这样可以在语义上清晰许多。

## Testing

```sh
$ npm run test
```

## TODO

 * perf benchmark
 * full api doc

## How this work

请直接阅读源码吧！这篇说明文的内容也许有些旧了，不再适合学习：<del>[《一文学废排序》](https://juejin.cn/post/6916229848126111751)</del>

## Author

**Lionad**

* [github/Lionad-Morotar](https://github.com/Lionad-Morotar)

## License

Copyright © 2021, [Lionad-Morotar](https://github.com/Lionad-Morotar).
Released under the MIT License.

## Changelog

##### 2.0.0（Wed Mar 09 2022 15:03:17 GMT+0800）

* 使用 TypeScript 重写了插件逻辑，修复了一些逻辑错误
* 内置插件只留下了关键的 i、reverse、rand、is、all、has、not、len
* 完善了测试用例

##### 1.4.x（Wed Jan 20 2021 02:46:22 GMT+0800）

* 新增自定义插件功能
* 新增统计插件 all

##### 1.3.0（Tue Jan 12 2021 01:41:41 GMT+0800）

* 新增忽略大小写插件

##### 1.2.x（Sun Jan 10 2021 01:30:00 GMT+0800）

* 新增长度插件，以统计字符串或数组的长度
* null 或 undefined 的值在比较时会被移到队尾
* symbol 在比较时会使用其字符串字面量的字典顺序进行比较

##### 1.1.0（Sun Jan 10 2021 00:33:59 GMT+0800）

* 新增了随机排序插件

##### 1.0.0（Thu Dec 07 2017 03:45:17 GMT+0800）

* Anysort 正式版本发布啦~