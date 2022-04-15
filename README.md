# Anysort

<center>
  <img src="./statics/LOGO.jpg" style="width: 100%" />
  <p><strong>Anysort：灵活、符合直觉的多属性排序方法。</strong></p>
</center>

## Install

```sh
# install newest anysort through github
npm install --save https://github.com/Lionad-Morotar/anysort
```

## Usage

简明的使用说明。

```js
const posts = [
  {
    tag: ['mp3'], status: '',
    created: {
      date: new Date('2019-08-01'),
      hour: 23
    }
  },
  {
    tag: ['game', 'it'], status: 'editing',
    created: {
      date: new Date('2021-01-01'),
      hour: 23
    }
  },
  {
    tag: ['it'], status: 'editing',
    created: {
      date: new Date('2021-01-01'),
      hour: 16
    }
  },
  {
    tag: ['it'], status: 'editing',
    created: {
      date: new Date('2021-01-02'),
      hour: 23
    }
  },
]

const print = x => console.log(JSON.stringify(x))
posts.sort(
  anysort(
    // use internal plugin "is" to find x in string or x in array
    'status-is(editing)',
    // use internal plugin "has" to find x in array
    'tag-has(it)',
    // use internal plugin reverse to reverse the default orders (less-than)
    'created.date-reverse()',
    // support forms like x dot y (x.y)
    'created.hour'
  )
).map(print)

// illness with string?
// try this!
anysort(getPosts())
  .created.hour.result()
  .created.date.reverse()
  .tag.has('it')
  .status.is('editing')
  .map(print)

// Results:
{ "tag":["it"], 
  "status":"editing",
  "created":{"date":"2021-01-02","hour":23}
}
{ "tag":["it"],        
  "status":"editing",
  "created":{"date":"2021-01-01","hour":16}
}
{ "tag":["game","it"], 
  "status":"editing",
  "created":{"date":"2021-01-01","hour":23}
}
{ "tag":["mp3"],       
  "status":"",
  "created":{"date":"2019-08-01","hour":23}
}
```

## Full API Doc

TODO

## Dev & Test

```sh
# run test when files change in directory build
npm run watch:test
# modify source code then build
npm run build
```

## How this work

请直接阅读源码吧！

以前我写过一篇文章说明 Anysort 是如何工作的，但它的内容已经很旧，不再适合阅读：<del>[《一文学废排序》](https://juejin.cn/post/6916229848126111751)</del>

## Pull & Request

See [TODO.MD](./TODO.md)，help wanted!

## License

Copyright © 2021, [Lionad-Morotar](https://github.com/Lionad-Morotar).
Released under the MIT License.