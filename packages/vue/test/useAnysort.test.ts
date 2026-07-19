import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useAnysort } from '../src/useAnysort'

describe('useAnysort', () => {
  it('keeps source order when no rules', () => {
    // 无规则不再触发 core 的默认类型排序，原样返回
    const sorted = useAnysort(ref([3, 1, 2]))
    expect(sorted.value).toEqual([3, 1, 2])
  })

  it('keeps source order for empty-ish rules (undefined / null / empty string / empty array)', () => {
    const src = [3, 1, 2]
    expect(useAnysort(ref(src)).value).toEqual([3, 1, 2])
    expect(useAnysort(ref(src), null as never).value).toEqual([3, 1, 2])
    // 空字符串被 filter(Boolean) 视为无规则，与 core 语义对齐
    expect(useAnysort(ref(src), '').value).toEqual([3, 1, 2])
    expect(useAnysort(ref(src), []).value).toEqual([3, 1, 2])
  })

  it('re-sorts when source ref changes', () => {
    const source = ref([3, 1, 2])
    const sorted = useAnysort(source, (a, b) => a - b)
    expect(sorted.value).toEqual([1, 2, 3])
    source.value = [9, 5, 7]
    expect(sorted.value).toEqual([5, 7, 9])
  })

  it('re-sorts when rules ref changes', () => {
    const source = ref([1, 2, 3])
    const rule = ref<string | ((a: number, b: number) => number)>('')
    const sorted = useAnysort(source, rule)
    // 空字符串规则 = 原序
    expect(sorted.value).toEqual([1, 2, 3])
    rule.value = (a, b) => b - a // 降序
    expect(sorted.value).toEqual([3, 2, 1])
  })

  it('supports getter rules (reactive rule switching)', () => {
    const desc = ref(false)
    const source = ref([{ v: 1 }, { v: 3 }, { v: 2 }])
    // getter 规则：随 desc 响应式切换升降序（playground/vue 的核心用法）
    const sorted = useAnysort(source, () => (desc.value ? 'v-reverse()' : 'v'))
    expect(sorted.value.map(i => i.v)).toEqual([1, 2, 3])
    desc.value = true
    expect(sorted.value.map(i => i.v)).toEqual([3, 2, 1])
  })

  it('accepts a bare comparator function as rule', () => {
    // 直接传比较函数（非 ref 包裹）：toValue 会误调，这里验证 unwrapRules 的 length 区分
    const sorted = useAnysort(ref([3, 1, 2]), (a, b) => a - b)
    expect(sorted.value).toEqual([1, 2, 3])
  })

  it('does not mutate the reactive source', () => {
    const source = ref([3, 1, 2])
    const sorted = useAnysort(source, (a, b) => a - b)
    expect(sorted.value).toEqual([1, 2, 3])
    // 源未被 in-place 排序污染：内容与顺序保持原样
    expect(source.value).toEqual([3, 1, 2])
  })

  it('accepts getter as source', () => {
    const source = ref([3, 1, 2])
    const sorted = useAnysort(() => source.value, (a, b) => a - b)
    expect(sorted.value).toEqual([1, 2, 3])
    source.value = [8, 4, 6]
    expect(sorted.value).toEqual([4, 6, 8])
  })

  it('returns a pure array (no anysort wrapper Proxy leaking)', () => {
    const sorted = useAnysort(ref([3, 1, 2]), (a, b) => a - b)
    // 纯数组：JSON 序列化干净，无 Proxy 内省陷阱
    expect(JSON.parse(JSON.stringify(sorted.value))).toEqual([1, 2, 3])
    expect(Array.isArray(sorted.value)).toBe(true)
  })
})
