import { describe, it, expect } from 'vitest'
import { validateOp, validateRule, validateSpec } from '../src/ir'

/**
 * IR 契约层测试：只校验结构合法性（type/path/arg 形态），
 * 不校验插件名是否存在——后者是 compile 时的语义校验，依赖插件表。
 */
describe('IR contract', () => {
  describe('validateOp — get', () => {
    it('accepts a get op with string[] path', () => {
      expect(() => validateOp({ type: 'get', path: ['created', 'date'] })).not.toThrow()
    })
    it('rejects get op with non-array path', () => {
      expect(() => validateOp({ type: 'get', path: 'a.b' })).toThrow()
    })
    it('rejects get op with non-string segment', () => {
      expect(() => validateOp({ type: 'get', path: ['a', 1] })).toThrow()
    })
    it('rejects get op with empty path (no segments)', () => {
      expect(() => validateOp({ type: 'get', path: [] })).toThrow()
    })
  })

  describe('validateOp — call', () => {
    it('accepts a call op without arg', () => {
      expect(() => validateOp({ type: 'call', plugin: 'reverse' })).not.toThrow()
    })
    it('accepts a call op with string arg', () => {
      expect(() => validateOp({ type: 'call', plugin: 'is', arg: 'foo' })).not.toThrow()
    })
    it('accepts a call op with number arg (native type preserved, not string-coerced)', () => {
      expect(() => validateOp({ type: 'call', plugin: 'nth', arg: 2 })).not.toThrow()
    })
    it('accepts a call op with boolean arg', () => {
      expect(() => validateOp({ type: 'call', plugin: 'not', arg: true })).not.toThrow()
    })
    it('accepts a call op with null arg', () => {
      expect(() => validateOp({ type: 'call', plugin: 'is', arg: null })).not.toThrow()
    })
    it('rejects call op with non-string plugin name', () => {
      expect(() => validateOp({ type: 'call', plugin: 123 })).toThrow()
    })
    it('rejects call op with object arg (not a SortArg)', () => {
      expect(() => validateOp({ type: 'call', plugin: 'is', arg: { x: 1 } })).toThrow()
    })
    it('rejects call op with array arg (not a SortArg)', () => {
      expect(() => validateOp({ type: 'call', plugin: 'is', arg: [1, 2] })).toThrow()
    })
  })

  describe('validateOp — shape', () => {
    it('rejects unknown op type', () => {
      expect(() => validateOp({ type: 'foo', path: [] })).toThrow()
    })
    it('rejects non-object op', () => {
      expect(() => validateOp(null)).toThrow()
      expect(() => validateOp('get')).toThrow()
      expect(() => validateOp(undefined)).toThrow()
    })
  })

  describe('validateRule', () => {
    it('accepts a rule with ops array', () => {
      expect(() => validateRule({
        ops: [{ type: 'get', path: ['a'] }, { type: 'call', plugin: 'reverse' }],
      })).not.toThrow()
    })
    it('accepts a rule with empty ops', () => {
      expect(() => validateRule({ ops: [] })).not.toThrow()
    })
    it('rejects rule with non-array ops', () => {
      expect(() => validateRule({ ops: 'no' })).toThrow()
    })
    it('rejects rule containing an invalid op', () => {
      expect(() => validateRule({ ops: [{ type: 'bad' }] })).toThrow()
    })
    it('rejects non-object rule (array is not a rule)', () => {
      expect(() => validateRule([])).toThrow()
    })
    it('rejects null rule', () => {
      expect(() => validateRule(null)).toThrow()
    })
  })

  describe('validateSpec', () => {
    it('accepts an array of rules', () => {
      expect(() => validateSpec([
        { ops: [] },
        { ops: [{ type: 'call', plugin: 'asc' }] },
      ])).not.toThrow()
    })
    it('accepts an empty spec', () => {
      expect(() => validateSpec([])).not.toThrow()
    })
    it('rejects non-array spec', () => {
      expect(() => validateSpec({ ops: [] })).toThrow()
    })
    it('rejects spec containing an invalid rule', () => {
      expect(() => validateSpec([{ ops: [{ type: 'bad' }] }])).toThrow()
    })
  })

  describe('type narrowing (asserts guards)', () => {
    it('validateOp narrows unknown → SortOp', () => {
      const input: unknown = { type: 'get', path: ['a'] }
      validateOp(input)
      // 此处 input 已收窄为 SortOp，可安全访问 type
      expect(input.type).toBe('get')
    })
    it('validateSpec narrows unknown → SortSpec', () => {
      const input: unknown = [{ ops: [] }]
      validateSpec(input)
      expect(input.length).toBe(1)
    })
  })
})
