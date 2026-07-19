import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

// e2e 验证 G4：@anysort/nuxt 的 auto-import 与 runtimeConfig 工作。
// rootDir 复用 playground/nuxt（D8：playground 兼 e2e fixture，减少重复）。
describe('@anysort/nuxt', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../../../playground/nuxt', import.meta.url)),
    server: true
  })

  it('auto-imports useAnysort without explicit import', async () => {
    const html = await $fetch('/')
    // useAnysort 免 import 工作 + 排序正确：views 升序 B(10) C(20) A(30)
    expect(html).toContain('data-testid="post"')
    expect(html).toMatch(/B:\s*10[\s\S]*C:\s*20[\s\S]*A:\s*30/)
  })
})
