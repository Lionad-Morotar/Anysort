const path = require('path')

const input = path.join(__dirname, './src/index.ts')
const ouput = path.join(__dirname, './build/index')

const isDev = process.env.NODE_ENV === 'development'

export default {
  input,
  plugins: [
    require('rollup-plugin-commonjs')(),
    require('rollup-plugin-node-resolve')(),
    require('rollup-plugin-typescript')(),
    // !isDev && require('rollup-plugin-uglify')()
  ],
  external: [/node_modules/],
  output: {
    name: 'module',
    file: ouput + (isDev ? '.js' : '.min.js'),
    format: 'umd',
    sourcemap: true,
  }
}
