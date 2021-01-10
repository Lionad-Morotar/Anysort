const anysort = require('../src')
var get = require('get-value');

var posts = [Symbol('d'), Symbol('b'), Symbol('a'), Symbol('c'), Symbol('z')]

posts.sort(
  anysort('by(symbol)')
)

console.log(posts)
