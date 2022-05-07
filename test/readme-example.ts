/* eslint-disable */

import { Anysort } from '../build/types'

const anysort: Anysort = require('../build/index')

const post = getPosts()

const test_type = anysort(post, 'tag.length')

console.log(test_type)

export function getPosts () {
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
    },
    /* illegal objects */
    {},
    null,
    undefined
  ]
}
