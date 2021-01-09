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
  { tag: ['blog'], status: '', date: '2013-05-06', deleted: 0 },
  { tag: ['blog'], status: 'todo', date: '2012-01-02', deleted: 0 },
  { tag: ['blog'], status: 'todo', date: '2014-01-02', deleted: 0 },
  { tag: ['mp3'], status: '', date: '2015-01-02', deleted: 0 },
  { tag: ['mp3'], status: '', date: '2015-01-02', deleted: 1 } ,
  { tag: ['mp4'], status: '', date: '2014-06-01', deleted: 0 },
  { tag: ['blog'], status: '', date: '2014-02-02', deleted: 1 },
];


// 优先选择还没写完且没有被删除的博客，按时间倒序展示
console.log(
  posts.sort(
    anysort(
      'status-is(todo)',
      'deleted-not()',
      'tag-has(blog)',
      'date-dec()'
    )
  )
)

// Results in:
// [
//   { tag: ['blog'], status: 'todo', date: '2014-01-02', deleted: 0 },
//   { tag: ['blog'], status: 'todo', date: '2012-01-02', deleted: 0 },
//   { tag: ['blog'], status: '', date: '2013-05-06', deleted: 0 },
//   { tag: ['mp3'], status: '', date: '2015-01-02', deleted: 0 },
//   { tag: ['mp4'], status: '', date: '2014-06-01', deleted: 0 },
//   { tag: ['blog'], status: '', date: '2014-02-02', deleted: 1 },
//   { tag: ['mp3'], status: '', date: '2015-01-02', deleted: 1 }
// ]
```

你也可以传入自定义排序方法：

```js
var anysort = require('../src');

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

console.log(arr.sort(anysort(compare('foo'), compare('bar'), compare('baz'))));

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