import path from 'path'
import common from '@rollup/plugin-commonjs'
import node from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import { minize } from 'rollup-plugin-minize'

const getPath = _path => path.resolve(process.cwd(), _path)
const input = path.join(process.cwd(), './src/index.ts')
const output = path.join(process.cwd(), './build/index')

const isPro = process.env.NODE_ENV === 'production'

console.log('isPro', isPro)

export default {
  input,
  plugins: ([
    common(),
    node(),
    typescript({
      tsconfig: getPath('./tsconfig.json')
    })
  ]).concat(isPro
    ? [
        minize({
          sourceMap: true
        })
      ]
    : []
  ),
  external: [/node_modules/],
  output: [
    {
      name: 'module',
      file: output + (isPro ? '.umd.min.js' : '.umd.js'),
      format: 'umd',
      sourcemap: true
    },
    {
      name: 'module',
      file: output + '.cjs.min.js',
      format: 'cjs',
      exports: 'auto',
      sourcemap: true
    },
    // * coverage test
    {
      name: 'module',
      file: output + '.cjs.js',
      format: 'cjs',
      exports: 'auto',
      sourcemap: true
    },
    {
      name: 'module',
      file: output + (isPro ? '.esm.min.js' : '.esm.js'),
      format: 'esm',
      exports: 'auto',
      sourcemap: true
    }
  ]
}
