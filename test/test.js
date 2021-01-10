const anysort = require('../src')
var get = require('get-value');

const posts = [
  { name: 'shanghai' },
  { name: 'beijing' },
  { name: 'home' }
]
posts.sort(anysort('name-is(home)'))

console.log(posts)
