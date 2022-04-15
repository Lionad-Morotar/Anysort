import anysort from '../build/index.min.js'

/* @see example for README.md */

const posts = [
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

const print = (x) => console.log(JSON.stringify(x))

anysort(posts, [
  // use internal plugin "is" to find x in string or x in array
  'status-is(editing)',
  // use internal plugin "has" to find x in array
  'tag-has(it)',
  // use internal plugin reverse to reverse the default orders (less-than)
  'created.date-reverse()',
  // support forms like x dot y (x.y)
  'created.hour'
]).map(print)
