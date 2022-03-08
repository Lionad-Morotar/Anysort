const anysort = require('../build/index.js')

const posts = [
  { a: { name: 'shanghai' } },
  { a: { name: 'beijing' } },
  { a: { name: 'zoo' } },
  { a: { name: 'alpha' } },
  { a: { name: 'home' } },
]
posts.sort(anysort('a.name'))

console.log(posts)
