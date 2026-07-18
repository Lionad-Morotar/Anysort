import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// 库模式构建：rolldown 后端，三格式（esm/cjs/umd）+ sourcemap + terser 压缩。
// fileName 把 Vite 的 'es' format 映射回 'esm' 命名以保持产物契约。
// d.ts 由 tsc 直接 emit（build script 的 `tsc -p` 步骤），不依赖 vite-plugin-dts
// ——后者在 TS 7（tsgo）下经 @typescript/typescript6 fallback 只生成不完整的单文件。
export default defineConfig({
  build: {
    outDir: 'build',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    lib: {
      entry: resolve(process.cwd(), 'src/index.ts'),
      name: 'module',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.min.js`,
    },
  },
})
