import { describe, it, expect } from 'vitest'
import { parseRule, parseSpec } from '../src/parse'
import { compileSpec } from '../src/compile'

describe('parse — string → IR', () => {
  describe('path segments (get)', () => {
    it('parses a single property path', () => {
      expect(parseRule('name')).toEqual({ ops: [{ type: 'get', path: ['name'] }] })
    })
    it('parses a nested path split by "."', () => {
      expect(parseRule('created.date')).toEqual({ ops: [{ type: 'get', path: ['created', 'date'] }] })
    })
  })

  describe('plugin segments (call)', () => {
    it('parses a no-arg plugin', () => {
      expect(parseRule('reverse()')).toEqual({ ops: [{ type: 'call', plugin: 'reverse' }] })
    })
    it('parses a string-arg plugin', () => {
      expect(parseRule('is(foo)')).toEqual({ ops: [{ type: 'call', plugin: 'is', arg: 'foo' }] })
    })
    it('parses a number arg as native number (not string-coerced)', () => {
      expect(parseRule('nth(2)')).toEqual({ ops: [{ type: 'call', plugin: 'nth', arg: 2 }] })
      expect(parseRule('len(3)')).toEqual({ ops: [{ type: 'call', plugin: 'len', arg: 3 }] })
    })
    it('parses negative and decimal numbers', () => {
      expect(parseRule('nth(-5)')).toEqual({ ops: [{ type: 'call', plugin: 'nth', arg: -5 }] })
      expect(parseRule('nth(3.14)')).toEqual({ ops: [{ type: 'call', plugin: 'nth', arg: 3.14 }] })
    })
    it('parses boolean args', () => {
      expect(parseRule('not(true)')).toEqual({ ops: [{ type: 'call', plugin: 'not', arg: true }] })
      expect(parseRule('not(false)')).toEqual({ ops: [{ type: 'call', plugin: 'not', arg: false }] })
    })
    it('parses null arg', () => {
      expect(parseRule('is(null)')).toEqual({ ops: [{ type: 'call', plugin: 'is', arg: null }] })
    })
    it('keeps non-numeric / non-boolean literals as string', () => {
      expect(parseRule('is(foobar)')).toEqual({ ops: [{ type: 'call', plugin: 'is', arg: 'foobar' }] })
    })
    it('supports arg containing delim (parens shield inner "-")', () => {
      // 括号内的 delim 不分段，故负数与含 "-" 的 arg 也能表达
      expect(parseRule('is(foo-bar)')).toEqual({ ops: [{ type: 'call', plugin: 'is', arg: 'foo-bar' }] })
    })
  })

  describe('combined segments (delim "-")', () => {
    it('parses path + plugin', () => {
      expect(parseRule('name-reverse()')).toEqual({
        ops: [{ type: 'get', path: ['name'] }, { type: 'call', plugin: 'reverse' }],
      })
    })
    it('parses nested path + plugin', () => {
      expect(parseRule('created.date-reverse()')).toEqual({
        ops: [{ type: 'get', path: ['created', 'date'] }, { type: 'call', plugin: 'reverse' }],
      })
    })
    it('respects custom delim', () => {
      expect(parseRule('name|reverse()', { delim: '|' })).toEqual({
        ops: [{ type: 'get', path: ['name'] }, { type: 'call', plugin: 'reverse' }],
      })
    })
  })

  describe('edge cases', () => {
    it('empty command produces empty rule', () => {
      expect(parseRule('')).toEqual({ ops: [] })
    })
    it('parseSpec collects multiple commands into spec', () => {
      expect(parseSpec('name', 'age-reverse()')).toEqual([
        { ops: [{ type: 'get', path: ['name'] }] },
        { ops: [{ type: 'get', path: ['age'] }, { type: 'call', plugin: 'reverse' }] },
      ])
    })
    it('parseSpec with no commands is empty spec', () => {
      expect(parseSpec()).toEqual([])
    })
  })

  describe('end-to-end: parse → compile → sort', () => {
    it('"name-reverse()" sorts descending, same as hand-written IR', () => {
      const posts = [{ name: 'Bob' }, { name: 'Alice' }, { name: 'carol' }]
      const fromString = [...posts].sort(compileSpec(parseSpec('name-reverse()')))
      const fromIR = [...posts].sort(compileSpec([{
        ops: [{ type: 'get', path: ['name'] }, { type: 'call', plugin: 'reverse' }],
      }]))
      expect(fromString).toEqual(fromIR)
      expect(fromString.map(p => p.name)).toEqual(['carol', 'Bob', 'Alice'])
    })
  })
})
