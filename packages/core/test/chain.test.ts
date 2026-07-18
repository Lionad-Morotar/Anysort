import { describe, it, expect } from 'vitest'
import { chain } from '../src/chain'
import { parseSpec } from '../src/parse'
import { compileSpec } from '../src/compile'

const posts = [
  { name: 'Bob', age: 30, created: { date: '2020-01-01' } },
  { name: 'Alice', age: 25, created: { date: '2021-01-01' } },
  { name: 'carol', age: 25, created: { date: '2019-01-01' } },
]
type Post = (typeof posts)[number]

// 链式 .run() 当前经 [key: string]: any 流转，结果需显式标注元素类型；
// Full Typed 递归补全（链式保 T）留待后续增强
const run = <T> (c: { run (): T[] }): T[] => c.run()

describe('chain — 链式前端（形态 B）', () => {
  describe('IR accumulation', () => {
    it('accumulates a single property path as one get op', () => {
      expect(chain(posts).name.spec).toEqual({ ops: [{ type: 'get', path: ['name'] }] })
    })
    it('merges consecutive property accesses into one get op', () => {
      expect(chain(posts).created.date.spec).toEqual({
        ops: [{ type: 'get', path: ['created', 'date'] }],
      })
    })
    it('accumulates path + plugin', () => {
      expect(chain(posts).name.reverse().spec).toEqual({
        ops: [{ type: 'get', path: ['name'] }, { type: 'call', plugin: 'reverse' }],
      })
    })
    it('accumulates plugin with arg', () => {
      expect(chain(posts).name.is('foo').spec).toEqual({
        ops: [{ type: 'get', path: ['name'] }, { type: 'call', plugin: 'is', arg: 'foo' }],
      })
    })
  })

  describe('immutability & no side effects', () => {
    it('each chained call returns a new instance (does not mutate internal state)', () => {
      const c1 = chain(posts).name
      const c2 = c1.reverse()
      expect(c1.spec).toEqual({ ops: [{ type: 'get', path: ['name'] }] })
      expect(c2.spec).toEqual({
        ops: [{ type: 'get', path: ['name'] }, { type: 'call', plugin: 'reverse' }],
      })
    })
    it('chaining does not sort the source (no side effect until run)', () => {
      const source = [...posts]
      chain(source).name.reverse()
      expect(source.map(p => p.name)).toEqual(['Bob', 'Alice', 'carol'])
    })
    it('run does not mutate the source (copies before sort)', () => {
      const source = [...posts]
      const sorted = run<Post>(chain(source).name.reverse())
      expect(sorted.map(p => p.name)).toEqual(['carol', 'Bob', 'Alice'])
      expect(source.map(p => p.name)).toEqual(['Bob', 'Alice', 'carol'])
    })
  })

  describe('run / compile / spec outputs', () => {
    it('run sorts ascending by default path', () => {
      const sorted = run<Post>(chain(posts).name)
      expect(sorted.map(p => p.name)).toEqual(['Alice', 'Bob', 'carol'])
    })
    it('run sorts nested path descending', () => {
      const sorted = run<Post>(chain(posts).created.date.reverse())
      expect(sorted.map(p => p.created.date)).toEqual(['2021-01-01', '2020-01-01', '2019-01-01'])
    })
    it('compile returns a reusable SortFn', () => {
      const fn = chain(posts).age.compile()
      expect(typeof fn).toBe('function')
      const other = [{ age: 9 }, { age: 1 }, { age: 5 }]
      expect([...other].sort(fn).map(p => p.age)).toEqual([1, 5, 9])
    })
    it('source is exposed read-only', () => {
      expect(chain(posts).source).toBe(posts)
    })
    it('is not thenable (no .then trap for Promise interop)', () => {
      expect(chain(posts).then).toBeUndefined()
    })
  })

  describe('equivalence with string command', () => {
    it('chain().name.reverse() produces same IR as parseSpec("name-reverse()")', () => {
      const fromChain = chain(posts).name.reverse().spec
      const fromString = parseSpec('name-reverse()')[0]
      expect(fromChain).toEqual(fromString)
    })
    it('chain run equals compileSpec(parseSpec(...)) sort', () => {
      const a = run<Post>(chain(posts).name.reverse())
      const b = [...posts].sort(compileSpec(parseSpec('name-reverse()')))
      expect(a).toEqual(b)
    })
  })
})
