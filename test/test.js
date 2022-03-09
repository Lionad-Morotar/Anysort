const anysort = require('../build/index.js')

const posts = [null, 'd']


posts.sort(anysort())

console.log(posts)
