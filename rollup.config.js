import common from '@rollup/plugin-commonjs'
import node from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import minize from 'rollup-plugin-minize'

const path = require('path')

const getPath = _path => path.resolve(__dirname, _path)
const input = path.join(__dirname, './src/index.ts')
const output = path.join(__dirname, './build/index')

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
      file: output + (isPro ? '.min.js' : '.js'),
      format: 'umd',
      sourcemap: true,
      globals: {
        tslib: 'tslib'
      }
    },
    {
      name: 'module',
      file: output + (isPro ? '.cjs.min.js' : '.cjs.js'),
      format: 'cjs',
      exports: 'auto',
      sourcemap: false,
      globals: {
        tslib: 'tslib'
      }
    }
  ]
}
