import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// 库模式构建：vue + @anysort/core 作为 external（peer / workspace 依赖，不打进 bundle）。
// 产物 dist/index.mjs + dist/index.cjs；d.ts 由 build script 的 `tsc -p` emit。
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'AnysortVue',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`
    },
    rollupOptions: {
      external: ['vue', '@anysort/core']
    }
  }
})
