import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useAnysort } from '../src/useAnysort'

describe('useAnysort', () => {
  it('sorts with default autoSort when no rules', () => {
    const sorted = useAnysort(ref([3, 1, 2]))
    expect(sorted.value).toEqual([1, 2, 3])
  })

  it('re-sorts when source ref changes', () => {
    const source = ref([3, 1, 2])
    const sorted = useAnysort(source)
    expect(sorted.value).toEqual([1, 2, 3])
    source.value = [9, 5, 7]
    expect(sorted.value).toEqual([5, 7, 9])
  })

  it('re-sorts when rules ref changes', () => {
    const source = ref([1, 2, 3])
    const rule = ref<string | ((a: number, b: number) => number)>('')
    const sorted = useAnysort(source, rule)
    expect(sorted.value).toEqual([1, 2, 3])
    rule.value = (a, b) => b - a // 降序
    expect(sorted.value).toEqual([3, 2, 1])
  })

  it('does not mutate the reactive source', () => {
    const source = ref([3, 1, 2])
    const sorted = useAnysort(source)
    expect(sorted.value).toEqual([1, 2, 3])
    // 源未被 in-place 排序污染：内容与顺序保持原样
    // （不断言引用相等——vue ref 的 .value 是 reactive proxy，与原数组本就非同一对象）
    expect(source.value).toEqual([3, 1, 2])
  })

  it('accepts getter as source', () => {
    const source = ref([3, 1, 2])
    const sorted = useAnysort(() => source.value)
    expect(sorted.value).toEqual([1, 2, 3])
    source.value = [8, 4, 6]
    expect(sorted.value).toEqual([4, 6, 8])
  })

  it('returns a pure array (no anysort wrapper Proxy leaking)', () => {
    const sorted = useAnysort(ref([3, 1, 2]))
    // 纯数组：JSON 序列化干净，无 Proxy 内省陷阱
    expect(JSON.parse(JSON.stringify(sorted.value))).toEqual([1, 2, 3])
    expect(Array.isArray(sorted.value)).toBe(true)
  })
})
