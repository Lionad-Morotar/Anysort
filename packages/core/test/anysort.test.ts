import { describe, it, expect } from 'vitest'
import anysort from '../src/index'
import { chain } from '../src/chain'
import { parseSpec } from '../src/parse'
import { compileSpec } from '../src/compile'

const posts = [
  { name: 'Bob', age: 30 },
  { name: 'Alice', age: 25 },
  { name: 'carol', age: 25 },
]
type Post = (typeof posts)[number]

describe('anysort — 主入口', () => {
  describe('three input forms converge to the same IR', () => {
    it('string command === hand-written IR === chain (ascending by name)', () => {
      const fromString = anysort([...posts], 'name')
      const fromIR = anysort([...posts], { ops: [{ type: 'get', path: ['name'] }] })
      const fromChain = chain(posts).name.run()
      expect(fromString).toEqual(fromIR)
      expect(fromString).toEqual(fromChain)
      expect(fromString.map(p => p.name)).toEqual(['Alice', 'Bob', 'carol'])
    })
    it('string with plugin === IR with plugin === chain with plugin (descending)', () => {
      const fromString = anysort([...posts], 'name-reverse()')
      const fromIR = anysort([...posts], {
        ops: [{ type: 'get', path: ['name'] }, { type: 'call', plugin: 'reverse' }],
      })
      const fromChain = chain(posts).name.reverse().run()
      expect(fromString).toEqual(fromIR)
      expect(fromString).toEqual(fromChain)
      expect(fromString.map(p => p.name)).toEqual(['carol', 'Bob', 'Alice'])
    })
  })

  describe('comparator function escape hatch', () => {
    it('accepts a raw comparator function (not serialized into IR)', () => {
      const sorted = anysort([...posts], (a: Post, b: Post) => b.age - a.age)
      expect(sorted.map(p => p.age)).toEqual([30, 25, 25])
    })
    it('short-circuits mixed rules (string then comparator then IR)', () => {
      // 先 age 升序（25,25,30），age 平局用自定义 name 降序
      const sorted = anysort(
        [...posts],
        'age',
        (a: Post, b: Post) => (a.name > b.name ? -1 : a.name < b.name ? 1 : 0),
      )
      expect(sorted.map(p => p.name)).toEqual(['carol', 'Alice', 'Bob'])
    })
  })

  describe('no rules keeps source order', () => {
    it('anysort with no rules returns source order', () => {
      const sorted = anysort([...posts])
      expect(sorted.map(p => p.name)).toEqual(['Bob', 'Alice', 'carol'])
    })
  })

  describe('in-place mutation semantics', () => {
    it('mutates the passed array (arr.sort semantics, caller copies if needed)', () => {
      const arr = [...posts]
      const ret = anysort(arr, 'name')
      expect(ret).toBe(arr)
    })
  })

  describe('multi-rule short-circuit via main entry', () => {
    it('age asc then name asc (tie-break)', () => {
      const sorted = anysort([...posts], 'age', 'name')
      expect(sorted.map(p => p.name)).toEqual(['Alice', 'carol', 'Bob'])
    })
    it('chain compile equals anysort on same intent', () => {
      const a = anysort([...posts], 'name-reverse()')
      const b = [...posts].sort(compileSpec(parseSpec('name-reverse()')))
      expect(a).toEqual(b)
    })
  })

  describe('filter(Boolean) tolerance for conditional args', () => {
    it('anysort(arr, null) filters null and keeps order (no crash)', () => {
      const arr = [3, 1, 2]
      expect(() => anysort([...arr], null as never)).not.toThrow()
      expect(anysort([...arr], null as never)).toEqual([3, 1, 2])
    })
    it('anysort(arr, undefined) does not crash', () => {
      expect(() => anysort([...[3, 1, 2]], undefined as never)).not.toThrow()
    })
    it('invalid IR throws readable contract error (not raw TypeError)', () => {
      expect(() => anysort([1, 2], { wrong: true } as never)).toThrow(/\[anysort\]/)
    })
  })

  describe('anysort.extend — 自定义插件（类型累积 + 不可变）', () => {
    it('returns a new anysort instance (not mutating the global anysort)', () => {
      const mysort = anysort.extend({
        evenFirst: { kind: 'mapping', apply: () => (x: unknown) => (typeof x === 'number' && x % 2 === 0 ? 0 : 1) },
      })
      expect(typeof mysort).toBe('function')
      expect(mysort).not.toBe(anysort)
    })
    it('mysort consumes custom plugin via string command', () => {
      const mysort = anysort.extend({
        evenFirst: { kind: 'mapping', apply: () => (x: unknown) => (typeof x === 'number' && x % 2 === 0 ? 0 : 1) },
      })
      expect(mysort([1, 2, 3, 4], 'evenFirst()')).toEqual([2, 4, 1, 3])
    })
    it('mysort preserves built-in plugins (P | Q accumulation)', () => {
      const mysort = anysort.extend({
        evenFirst: { kind: 'mapping', apply: () => (x: unknown) => (typeof x === 'number' && x % 2 === 0 ? 0 : 1) },
      })
      expect(mysort([1, 2, 3], 'reverse()')).toEqual([3, 2, 1])
    })
    it('extend is chainable (P | Q | R)', () => {
      const id = () => (r: number) => r
      const my1 = anysort.extend({ a: { kind: 'result', apply: id } })
      const my2 = my1.extend({ b: { kind: 'result', apply: id } })
      expect(my2([1, 2], 'a()')).toEqual([1, 2])
      expect(my2([1, 2], 'b()')).toEqual([1, 2])
    })
    it('mysort.chain also recognizes custom plugin', () => {
      const mysort = anysort.extend({
        evenFirst: { kind: 'mapping', apply: () => (x: unknown) => (typeof x === 'number' && x % 2 === 0 ? 0 : 1) },
      })
      expect(mysort.chain([1, 2, 3, 4]).evenFirst().run()).toEqual([2, 4, 1, 3])
    })
  })
})
