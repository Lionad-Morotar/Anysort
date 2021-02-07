const path = require('path')

const input = path.join(__dirname, './src/index.js')
const inputFileDir = path.join(__dirname, './src')
const ouput = path.join(__dirname, './build/index.js')

console.log('inputFileDir: ', inputFileDir + '\\**\\*.js')

export default {
  input,
  plugins: [
    require('rollup-plugin-commonjs')(),
    require('rollup-plugin-node-resolve')(),
  ],
  external: [/node_modules/],
  output: {
    name: 'module',
    file: ouput,
    format: 'umd',
    sourcemap: true,
  }
}
