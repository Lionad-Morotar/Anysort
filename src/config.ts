import type { AnysortConfiguration } from './type'

// global configuration
const config: AnysortConfiguration = {
  delim: '-',
  patched: '__ANYSORT_PATCHED__',
  autoWrap: true,
  autoSort: true,
  orders: {
    number: 1,
    string: 2,
    symbol: 3,
    date: 4,
    object: 5,
    function: 6,
    rest: 7,
    // if no 'void' provided,
    // undefined value will be ignored in sort,
    // null value will be treated as normal unrecognized value
    void: 8
  }
}

export default config
