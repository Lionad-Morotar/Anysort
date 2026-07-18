import { describe, it, expect } from 'vitest'
import { plugins, getPlugin, isMappingPlugin, isResultPlugin, extend, extendAll } from '../src/plugins'
import { compileSpec } from '../src/compile'

describe('plugins — declarative registry', () => {
  describe('registry shape', () => {
    it('exposes 11 call plugins (get is IR-native, not in registry)', () => {
      expect(Object.keys(plugins).sort()).toEqual(
        ['all', 'asc', 'desc', 'has', 'i', 'is', 'len', 'not', 'nth', 'rand', 'reverse'],
      )
    })
    it('getPlugin returns def for known name', () => {
      expect(getPlugin('reverse')?.kind).toBe('result')
      expect(getPlugin('i')?.kind).toBe('mapping')
    })
    it('getPlugin returns undefined for unknown name', () => {
      expect(getPlugin('nope')).toBeUndefined()
    })
    it('isMappingPlugin / isResultPlugin discriminate kind', () => {
      expect(isMappingPlugin(plugins.i)).toBe(true)
      expect(isResultPlugin(plugins.i)).toBe(false)
      expect(isMappingPlugin(plugins.desc)).toBe(false)
      expect(isResultPlugin(plugins.desc)).toBe(true)
    })
  })

  describe('mapping plugins — apply returns a value mapper', () => {
    it('i: lowercases string', () => {
      const map = plugins.i.apply(undefined)
      expect(map('ABC')).toBe('abc')
    })
    it('i: throws on non-string', () => {
      expect(() => plugins.i.apply(undefined)(123)).toThrow()
    })
    it('is: equality against arg', () => {
      const map = plugins.is.apply('foo')
      expect(map('foo')).toBe(true)
      expect(map('bar')).toBe(false)
    })
    it('is: throws without arg', () => {
      expect(() => plugins.is.apply(undefined)).toThrow()
    })
    it('nth: indexes string/array with number arg (native number, not string-coerced)', () => {
      const map = plugins.nth.apply(1)
      expect(map(['a', 'b', 'c'])).toBe('b')
      expect(map('xyz')).toBe('y')
    })
    it('nth: throws on non-number arg', () => {
      expect(() => plugins.nth.apply('1')).toThrow()
    })
    it('len: returns length without arg', () => {
      const map = plugins.len.apply(undefined)
      expect(map([1, 2, 3])).toBe(3)
      expect(map('abcd')).toBe(4)
    })
    it('len: compares length with number arg', () => {
      const map = plugins.len.apply(3)
      expect(map([1, 2, 3])).toBe(true)
      expect(map([1, 2])).toBe(false)
    })
    it('has: substring or element inclusion', () => {
      const map = plugins.has.apply('a')
      expect(map('bac')).toBe(true)
      expect(map(['x', 'a'])).toBe(true)
      expect(map('xyz')).toBe(false)
    })
    it('all: every element equals arg', () => {
      expect(plugins.all.apply('a')(['a', 'a'])).toBe(true)
      expect(plugins.all.apply('a')(['a', 'b'])).toBe(false)
    })
    it('not: negates truthiness without arg', () => {
      const map = plugins.not.apply(undefined)
      expect(map(0)).toBe(true)
      expect(map(1)).toBe(false)
    })
    it('not: inequality with arg', () => {
      const map = plugins.not.apply('foo')
      expect(map('bar')).toBe(true)
      expect(map('foo')).toBe(false)
    })
  })

  describe('result plugins — apply returns a result transform', () => {
    it('asc: identity', () => {
      const r = plugins.asc.apply(undefined)
      expect(r(1)).toBe(1)
      expect(r(-3)).toBe(-3)
    })
    it('desc / reverse: negate result', () => {
      expect(plugins.desc.apply(undefined)(1)).toBe(-1)
      expect(plugins.reverse.apply(undefined)(-2)).toBe(2)
    })
    it('rand: returns -1 or 1', () => {
      const r = plugins.rand.apply(undefined)
      for (let i = 0; i < 20; i++) {
        const v = r(0)
        expect(v === -1 || v === 1).toBe(true)
      }
    })
  })
})

describe('extend — custom plugin registration', () => {
  it('extend registers a mapping plugin callable by name', () => {
    extend('lowercase_test', {
      kind: 'mapping',
      apply: () => (x: unknown): string => (typeof x === 'string' ? x.toLowerCase() : ''),
    })
    const def = getPlugin('lowercase_test')
    expect(def?.kind).toBe('mapping')
    if (!def || !isMappingPlugin(def)) throw new Error('expected mapping plugin')
    expect(def.apply(undefined)('ABC')).toBe('abc')
  })
  it('extendAll registers multiple plugins at once', () => {
    extendAll({
      ltZ_test: { kind: 'mapping', apply: () => (x: unknown) => (typeof x === 'string' && x < 'Z' ? -1 : 1) },
    })
    expect(getPlugin('ltZ_test')).toBeDefined()
  })
  it('custom plugin is consumed by compile via IR', () => {
    // evenFirst：偶数映射为 0（排前），奇数为 1
    extend('evenFirst_test', {
      kind: 'mapping',
      apply: () => (x: unknown) => (typeof x === 'number' && x % 2 === 0 ? 0 : 1),
    })
    const sorted = [1, 2, 3, 4].sort(compileSpec([{ ops: [{ type: 'call', plugin: 'evenFirst_test' }] }]))
    expect(sorted).toEqual([2, 4, 1, 3])
  })
  it('built-in plugins take precedence over custom with same name', () => {
    extend('reverse', { kind: 'result', apply: () => (res: number) => res * 100 })
    // 内置 reverse 优先：desc 取反，不是 *100
    expect(plugins.reverse.apply(undefined)(1)).toBe(-1)
  })
})
