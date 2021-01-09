# Anysort

**Anysort：灵活、优雅、无依赖的排序方法。**
 
 你可以以一个或多个属性、长度比较、数值比较、字符串比较等方法进行排序。更加惊奇的是，这些方法可以任意组合。

 WIP Warning

 ## TODO

 * fix plugins
 * anysort(arrays, options)
 * perf compare
 * full api doc

## 安装 Install

```sh
npm install --save https://github.com/Lionad-Morotar/any-sort
```

## 基本使用 Basic usage

根据属性进行排序：

```js
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

any-sort 的强大体现在他拥有语义化的排序简写方法。

```js
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
```

不过，灵活的代价是缓慢。Anysort 对比 array-sort 的运行速度要慢了一倍以上。好消息是，在大部分项目中，你并不会在意从 array-sort 的 50ms 到 any-sort 的 100ms 之间的性能差距。

## 测试 Test

```sh
$ npm run test
```

## 作者 Author

**Lionad**

* [github/Lionad-Morotar](https://github.com/Lionad-Morotar)

## 开源协议 License

Copyright © 2021, [Lionad-Morotar](https://github.com/Lionad-Morotar).
Released under the MIT License.