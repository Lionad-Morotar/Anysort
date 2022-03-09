const anysort = require('../build/index.js')

const posts = [
  { a: { count: [1], name: 'shanghaioo' } },
  { a: { count: [2], name: 'beijing' } },
  { a: { count: [3], name: 'zoo' } },
  { a: { count: [4], name: 'alpha' } },
  { a: { count: [5], name: 'home' } },
]

anysort.extends({
  short: (sort) => sort.map(x => x.length)
})

// posts.sort(anysort('a.count-has(5)'))
posts.sort(anysort('a.name-len()'))

console.log(posts)
