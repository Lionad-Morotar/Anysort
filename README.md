# Anysort

**Anysort：灵活、优雅、无依赖的多属性排序方法。**

## 安装 Install

```sh
npm install --save https://github.com/Lionad-Morotar/any-sort
```

## 基本使用 Basic usage

根据属性进行排序：

```js
var posts = [
  { locals: { foo: 'bbb', date: '2013-05-06' }},
  { locals: { foo: 'aaa', date: '2012-01-02' }},
  { locals: { foo: 'ccc', date: '2014-01-02' }},
  { locals: { foo: 'ccc', date: '2015-01-02' }},
  { locals: { foo: 'bbb', date: '2014-06-01' }},
  { locals: { foo: 'aaa', date: '2014-02-02' }},
];

// sort by `locals.foo`, then `locals.date`
posts.sort(anysort('locals.foo', 'locals.date'));

// Results in:
// [
//   { locals: { foo: 'aaa', date: '2012-01-02' } },
//   { locals: { foo: 'aaa', date: '2014-02-02' } },
//   { locals: { foo: 'bbb', date: '2013-05-06' } },
//   { locals: { foo: 'bbb', date: '2014-06-01' } },
//   { locals: { foo: 'ccc', date: '2014-01-02' } },
//   { locals: { foo: 'ccc', date: '2015-01-02' } }
// ]
```

你也可以传入自定义排序方法：

```js
var arr = [
  {foo: 'w', bar: 'y', baz: 'w'},
  {foo: 'x', bar: 'y', baz: 'w'},
  {foo: 'x', bar: 'y', baz: 'z'},
  {foo: 'x', bar: 'x', baz: 'w'},
];

function compare(prop) {
  return function (a, b) {
    return a[prop].localeCompare(b[prop]);
  };
}

console.log(
  arr.sort(
    anysort(
      compare('foo'), 
      compare('bar'), 
      compare('baz')
    )
  )
);

// Results in:
// [
//   { foo: 'w', bar: 'y', baz: 'w' },
//   { foo: 'x', bar: 'x', baz: 'w' },
//   { foo: 'x', bar: 'y', baz: 'w' },
//   { foo: 'x', bar: 'y', baz: 'z' }
// ]
```

## 高级用法 Powerful API

Anysort 的强大体现在他拥有语义化的排序简写方法。

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
```

Anysort 能使不会写代码的人也能看懂排序的过程。

我猜你也许会好奇这个排序方法的结果会是什么：`date-dec()-dec()`。总之，下载下来试一试吧~

## 测试 Test

```sh
$ npm run test
```

 ## TODO

 * anysort(arrays, options)
 * benchmark
 * full api doc

## 作者 Author

**Lionad**

* [github/Lionad-Morotar](https://github.com/Lionad-Morotar)

## 开源协议 License

Copyright © 2021, [Lionad-Morotar](https://github.com/Lionad-Morotar).
Released under the MIT License.