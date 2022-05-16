# Anysort

<p align="center">
  <img src="./statics/LOGO.jpg" />
</p>

<p align="center">
  <strong>Anysort：符合直觉、类型完备的多属性排序方法</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Coverage-86%25-83A603.svg?prefix=![](https://img.shields.io/badge/Coverage-98%25-83A603.svg?prefix=$coverage$)">
  <span>&nbsp;</span>
  <a href="https://github.com/Lionad-Morotar/anysort/blob/main/LICENSE">
    <img alt="MIT License" src="https://img.shields.io/github/license/Lionad-Morotar/anysort" />
  </a>
</p>

<p></p>

## Install

```sh
# install newest anysort through github
npm install --save anysort-typed
```

## Usage

Short instruction。

```js
const posts = getPosts()
const print = (x) => console.log(JSON.stringify(x))

// select articles being edited with IT tags,
// sorted by date in reverse order and time in positive order
anysort(posts, [
  'status-is(editing)',
  'tag-has(it)',
  'created.date-reverse()',
  'created.hour'
]).map(print)

// {"tag":["it"],"status":"editing","created":{"date":"2021-01-02T00:00:00.000Z","hour":23}}
// {"tag":["it"],"status":"editing","created":{"date":"2021-01-01T00:00:00.000Z","hour":16}}
// {"tag":["game","it"],"status":"editing","created":{"date":"2021-01-01T00:00:00.000Z","hour":23}}
// {"tag":["mp3"],"status":"","created":{"date":"2019-08-01T00:00:00.000Z","hour":23}}

// sick of using string manipulation?
// try this!
anysort(getPosts())
  .created.hour.result()
  .created.date.reverse()
  .tag.has('it')
  .status.is('editing')
  .map(print)

// {"tag":["it"],"status":"editing","created":{"date":"2021-01-02T00:00:00.000Z","hour":23}}
// {"tag":["it"],"status":"editing","created":{"date":"2021-01-01T00:00:00.000Z","hour":16}}
// {"tag":["game","it"],"status":"editing","created":{"date":"2021-01-01T00:00:00.000Z","hour":23}}
// {"tag":["mp3"],"status":"","created":{"date":"2019-08-01T00:00:00.000Z","hour":23}}

function getPosts () {
  return [
    {
      tag: ['mp3'],
      status: '',
      created: {
        date: new Date('2019-08-01'),
        hour: 23
      }
    },
    {
      tag: ['game', 'it'],
      status: 'editing',
      created: {
        date: new Date('2021-01-01'),
        hour: 23
      }
    },
    {
      tag: ['it'],
      status: 'editing',
      created: {
        date: new Date('2021-01-01'),
        hour: 16
      }
    },
    {
      tag: ['it'],
      status: 'editing',
      created: {
        date: new Date('2021-01-02'),
        hour: 23
      }
    }
  ]
}
```

## Why Anysort

* Anysort can sort with multi-attributes

```js
// select articles which has 'it' tag, put ahead,
// then move articles which status is 'editing' at the begining
anysort(articles)
  .tag.has('it')
  .status.is('editing')
  .map(print)
```

* Intuitive

```js
// Array.prototype.sort: what hell the result is!
[].sort.apply([0, '0', 1, 'd', '1', '0', 0, ''])
// ['', 0, '0', '0', 0, 1, '1', 'd']

// Anysort：the result is intuitive
anysort([0, '0', 1, undefined, 'd', '1', '0', null, 0, '', undefined])
// [0, 0, 1, '', '0', '0', '1', 'd']
```

* Flexible API

```js
// proxy chain api
anysort(articles).created.date.reverse()

// or
anysort(articles, 'created.date-reverse()')
```

* Full typed, even in call-with-string-mode, **AMAZING**!

```js
// @ts-expect-error
anysort(articles).tag.hass('it')
// @ts-expect-error
anysort(articles, 'created.date-unknownPlugin()')
// OK!
anysort(articles).created.date.reverse()
// OK!
anysort(articles, 'created.date-reverse()')
// @ts-expect-error
anysort(articles).created.date.reverse(123)
// @ts-expect-error
anysort(articles, 'created.date-reverse(123)')
```

* Zero dependencies

* Well tested, logic and type

* <del>WIP: Full API document</del>, help wanted

* <del>WIP: Benchmark</del>, help wanted

## Full API Doc

TODO

## Change Log

See [ChangeLog.md](./CHANGELOG.md)

## Dev & Test

```sh
# run test when files change in directory build
npm run watch:test

# modify source code then build
npm run build
```

## How this work

[《🌐 Anysort：灵活、优雅的多属性排序》](https://zhuanlan.zhihu.com/p/515016977)

## Pull & Request

See [TODO.MD](./TODO.md)，help wanted!

## Related Projects

* [sort-by](https://github.com/kvnneff/sort-by)
* [array-sort](https://github.com/jonschlinkert/array-sort)
* [sort-on](https://github.com/sindresorhus/sort-on)
* [...](https://github.com/search?q=property+sort&type=Repositories)

## License

Copyright © 2021, [Lionad-Morotar](https://github.com/Lionad-Morotar).
Released under the MIT License.