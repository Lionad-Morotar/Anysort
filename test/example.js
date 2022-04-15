const anysort = require('../build/index.min.js')

/* @see example for README.md */

const getPosts = () => [
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

anysort(getPosts(), [
  // use internal plugin "is" to find x in string or x in array
  'status-is(editing)',
  // use internal plugin "has" to find x in array
  'tag-has(it)',
  // use internal plugin reverse to reverse the default orders (less-than)
  'created.date-reverse()',
  // support forms like x dot y (x.y)
  'created.hour'
]).map(print)

// {"tag":["it"],"status":"editing","created":{"date":"2021-01-02T00:00:00.000Z","hour":23}}
// {"tag":["it"],"status":"editing","created":{"date":"2021-01-01T00:00:00.000Z","hour":16}}
// {"tag":["game","it"],"status":"editing","created":{"date":"2021-01-01T00:00:00.000Z","hour":23}}
// {"tag":["mp3"],"status":"","created":{"date":"2019-08-01T00:00:00.000Z","hour":23}}

console.log('\n')

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
