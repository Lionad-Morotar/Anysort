const anysort = require('../build/index.js')

const posts = ['b', 'a', 'E', 'c', 'D']


posts.sort(anysort('is(c)', 'i()-reverse()'))

console.log(posts)
