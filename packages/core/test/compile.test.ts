import { describe, it, expect } from 'vitest'
import { compileRule, compileSpec } from '../src/compile'
import type { SortSpec } from '../src/ir'

const posts = [
  { name: 'Bob', age: 30, tags: ['a', 'b'] },
  { name: 'Alice', age: 25, tags: ['c'] },
  { name: 'carol', age: 25, tags: [] },
]

const run = <T> (arr: T[], spec: SortSpec, opts?: { loose?: boolean }): T[] =>
  [...arr].sort(compileSpec<T>(spec, opts))

describe('compile — IR → SortFn', () => {
  describe('compileRule single rule', () => {
    it('sorts ascending by a path', () => {
      const sorted = run(posts, [{ ops: [{ type: 'get', path: ['name'] }] }])
      expect(sorted.map(p => p.name)).toEqual(['Alice', 'Bob', 'carol'])
    })
    it('sorts descending with reverse result plugin', () => {
      const sorted = run(posts, [{ ops: [{ type: 'get', path: ['name'] }, { type: 'call', plugin: 'reverse' }] }])
      expect(sorted.map(p => p.name)).toEqual(['carol', 'Bob', 'Alice'])
    })
    it('chains mapping ops (get → i for case-insensitive)', () => {
      // i 把 name 转小写后再比：alice < bob < carol
      const sorted = run(posts, [{ ops: [{ type: 'get', path: ['name'] }, { type: 'call', plugin: 'i' }] }])
      expect(sorted.map(p => p.name)).toEqual(['Alice', 'Bob', 'carol'])
    })
    it('uses nth to index an array value', () => {
      const sorted = run(posts, [{ ops: [{ type: 'get', path: ['tags'] }, { type: 'call', plugin: 'nth', arg: 0 }] }])
      // tags[0]: Bob='a', Alice='c', carol=undefined([]) → undefined 排后
      expect(sorted.map(p => p.name)).toEqual(['Bob', 'Alice', 'carol'])
    })
    it('mutates the array in-place (arr.sort semantics)', () => {
      const arr = [...posts]
      const fn = compileSpec([{ ops: [{ type: 'get', path: ['age'] }] }])
      const ret = arr.sort(fn)
      expect(ret).toBe(arr) // 同一引用，in-place
    })
  })

  describe('compileSpec multi-rule short-circuit', () => {
    it('uses later rule only to break ties', () => {
      // 先按 age 升序：25,25,30；age 相同按 name：Alice<carol
      const sorted = run(posts, [
        { ops: [{ type: 'get', path: ['age'] }] },
        { ops: [{ type: 'get', path: ['name'] }] },
      ])
      expect(sorted.map(p => p.name)).toEqual(['Alice', 'carol', 'Bob'])
    })
    it('first rule dominates, second breaks ties (age desc → name)', () => {
      // age desc：30 在前；两个 25 之间 age 平局，回退到 name 升序（Alice < carol）
      const sorted = run(posts, [
        { ops: [{ type: 'get', path: ['age'] }, { type: 'call', plugin: 'reverse' }] },
        { ops: [{ type: 'get', path: ['name'] }] },
      ])
      expect(sorted.map(p => p.name)).toEqual(['Bob', 'Alice', 'carol'])
    })
    it('empty spec keeps source order (returns 0)', () => {
      const sorted = run(posts, [])
      expect(sorted.map(p => p.name)).toEqual(['Bob', 'Alice', 'carol'])
    })
    it('empty-ops rule keeps source order (not "sort by raw value")', () => {
      // 空规则不应退化为按原始值比较（对象数组会不稳定），应保持原序
      const sorted = run(posts, [{ ops: [] }])
      expect(sorted.map(p => p.name)).toEqual(['Bob', 'Alice', 'carol'])
    })
  })

  describe('loose mode', () => {
    it('skips unknown plugin and keeps sorting (warn, no throw)', () => {
      // 未知插件被 skip，规则退化为空 → 原序
      const sorted = run(posts, [{ ops: [{ type: 'call', plugin: 'unknownPlugin' }] }] as SortSpec, { loose: true })
      expect(sorted.map(p => p.name)).toEqual(['Bob', 'Alice', 'carol'])
    })
    it('strict mode throws on unknown plugin', () => {
      expect(() => compileSpec([{ ops: [{ type: 'call', plugin: 'unknownPlugin' }] }]))
        .toThrow(/unknown plugin/)
    })
    it('loose still applies known plugins around the skipped one', () => {
      const sorted = run(posts, [{
        ops: [
          { type: 'get', path: ['name'] },
          { type: 'call', plugin: 'unknownPlugin' },
          { type: 'call', plugin: 'reverse' },
        ],
      }], { loose: true })
      // get + reverse 生效，unknown 被 skip → name 降序
      expect(sorted.map(p => p.name)).toEqual(['carol', 'Bob', 'Alice'])
    })
  })

  describe('result plugin constraints', () => {
    it('throws when a rule has two result plugins', () => {
      expect(() => compileRule({
        ops: [
          { type: 'call', plugin: 'reverse' },
          { type: 'call', plugin: 'desc' },
        ],
      })).toThrow(/at most one result plugin/)
    })
  })

  describe('total order — non-scalar & NaN values (compareSortArg regression)', () => {
    it('non-scalar field value keeps source order (object treated as equal, not "always greater")', () => {
      const objs = [{ addr: { city: 'X' } }, { addr: { city: 'Y' } }, { addr: { city: 'Z' } }]
      const sorted = run(objs, [{ ops: [{ type: 'get', path: ['addr'] }] }])
      expect(sorted).toEqual(objs)
    })
    it('NaN: double NaN equal, single NaN sorts last (antisymmetry preserved)', () => {
      const arr = [{ v: NaN }, { v: 1 }, { v: NaN }, { v: 2 }]
      const sorted = run(arr, [{ ops: [{ type: 'get', path: ['v'] }] }])
      expect(sorted.map(o => o.v)).toEqual([1, 2, NaN, NaN])
    })
    it('loose: all ops skipped keeps source order (no raw-value re-sort)', () => {
      const objs = [{ x: 1 }, { x: 2 }, { x: 3 }]
      const sorted = run(objs, [{ ops: [{ type: 'call', plugin: 'typoPlugin' }] }] as SortSpec, { loose: true })
      expect(sorted).toEqual(objs)
    })
  })
})
