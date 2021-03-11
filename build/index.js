(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

  /**
   * Utils
   */
  var isVoid = function (x) { return x == undefined; };
  var isVoidType = function (x) { return x === 'void'; };
  var getType = function (x) { return isVoid(x) ? 'void' : Object.prototype.toString.call(x).slice(8, -1).toLowerCase(); };
  var isFn = function (x) { return getType(x) === 'function'; };
  var notNull = function (x) { return !!x; };
  //# sourceMappingURL=utils.js.map

  // TODO refactor to function: x => comparableValue
  /* get comparable value from specific value */
  var getCompareValue = {
      string: String,
      number: Number,
      date: function (x) { return +x; },
      symbol: function (x) { return x.toString(); },
      // The priority of true is greater than false
      boolean: function (x) { return !x; },
  };
  var sortByType = function (type) { return function (a, b) {
      var getValFn = getCompareValue[type];
      if (!getValFn)
          throw new Error("[ERR] Error occured when compare value " + a + " with value " + b);
      var va = getValFn(a), vb = getValFn(b);
      return va === vb ? 0 : (va < vb ? -1 : 1);
  }; };
  var sortByDefault = function (a, b) {
      var typeA = getType(a);
      var typeB = getType(b);
      var onceEmpty = isVoidType(typeA) || isVoidType(typeB);
      if (onceEmpty) {
          if (typeA === typeB)
              return 0;
          return a ? -1 : 1;
      }
      var canSort = getCompareValue[typeA] && typeA === typeB;
      if (!canSort) {
          console &&
              console.warn &&
              console.warn("[TIP] Cannot sort " + a + " with " + b + "\uFF0Cskip by default");
          return undefined;
      }
      return sortByType(typeA)(a, b);
  };
  var pass = function (fn) { return function (a, b) { return fn(a, b); }; };
  var maping = function (map) { return function (fn) { return function (a, b) { return fn(map(a), map(b)); }; }; };
  var plugin = function (plug) { return function (fn) { return function (a, b) { return plug(fn(a, b)); }; }; };
  var Sort = /** @class */ (function () {
      function Sort() {
          this.compare = sortByDefault;
          this.pipeline = [];
      }
      // 给管道添加解构方法，用于解构对象并处理值
      // @example
      // sort.map(x => String(x.a))
      // 从 x 中取得 a 属性并转换为字符串，再继续比较
      Sort.prototype.map = function (_value) {
          this.pipeline.push({ _value: _value, _type: 'maping' });
          return this;
      };
      // 给管道添加插件，用于调整排序动作
      // @example
      // sort.plugin(fn => (a, b) => -fn(a, b))
      // 将上一个排序结果反转
      Sort.prototype.plugin = function (_value) {
          this.pipeline.push({ _value: _value, _type: 'plugin' });
          return this;
      };
      // 设定排序方法，用来处理排序的值的顺序
      Sort.prototype.sortby = function (s) {
          var validMethod = s.toLowerCase();
          this.compare = sortByType(validMethod);
      };
      // 将管道合并为函数
      Sort.prototype.seal = function () {
          var compose = function (last, current) {
              var _type = current._type, _value = current._value;
              if (_type === 'maping')
                  return maping(last(_value));
              if (_type === 'plugin')
                  return plugin(_value)(last);
          };
          return this.pipeline.reduce(compose, pass)(this.compare);
      };
      return Sort;
  }());
  //# sourceMappingURL=Sort.js.map

  /* Default Plugins */
  var plugins = {
      // by: (sort, args) => sort.sortby(args),
      // i: sort => sort.map(x => (x || '').toLowerCase()),
      // asc: sort => sort.plugin(pass),
      // dec: sort => sort.plugin(fn => (...args) => -fn(...args)),
      // rand: sort => sort.plugin(() => () => Math.random() < .5 ? -1 : 1),
      // is: (sort, args = '') => sort.map(x => x === args).sortby('boolean'),
      // all: (sort, args = '') => sort.map(x => x.every ? x.every(y => String(y) === args) : x === args).sortby('boolean'),
      // has: (sort, args) => sort.map(x => x.some(y => String(y) === args)).sortby('boolean'),
      // not: (sort, args = '') => sort.map(x => args ? (x !== args) : !x).sortby('boolean'),
      // len: (sort, args = null) => isVoid(args)
      //   ? sort.map(x => x.length).sortby('number')
      //   : sort.map(x => x.length === args).sortby('boolean'),
      default: function (name) {
          var pathsStore = name.split('.');
          var getVal = function (x) {
              var paths = [].concat(pathsStore);
              var val = x, next = null;
              while (val && paths.length) {
                  next = paths.shift();
                  val = val[next];
              }
              return val;
          };
          return function (sort) { return sort.map(getVal); };
      }
  };
  /**
   * generate SortFn from strings
   */
  function generateSortFnFromStr(ss) {
      var sort = new Sort();
      ss.split('-')
          .filter(notNull)
          .map(function (action) {
          var _a = action.match(/([^(]+)(\(([^)]*)\))?/), name = _a[1], argsWithQuote = _a[2], args = _a[3];
          var plugin = argsWithQuote
              ? plugins[name]
              : plugins.default(name);
          plugin(sort, args || undefined);
      });
      return sort.seal();
  }
  /**
   * main
   */
  function factory() {
      var cmd = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          cmd[_i] = arguments[_i];
      }
      // flatten
      cmd = cmd.reduce(function (h, c) { return (h.concat(c)); }, []);
      // sort by default if no arguments
      if (cmd.length < 1)
          return undefined;
      var sortFns = cmd.map(function (x, i) {
          try {
              return isFn(x) ? x : generateSortFnFromStr(x);
          }
          catch (error) {
              throw new Error("[ERR] Error on generate sort function, Index " + (i + 1) + "th: " + x + ".");
          }
      });
      var flat = (function (fns) { return function (a, b) { return fns.reduce(function (sortResult, fn) { return sortResult || fn(a, b); }, 0); }; });
      return flat(sortFns);
  }
  /**
   * install plugins for SortCMD strings
   */
  var extendPlugins = (function (exts) { return Object.entries(exts).map(function (_a) {
      var k = _a[0], v = _a[1];
      return plugins[k] = v;
  }); });
  factory.extends = extendPlugins;
  /* Module Exports */
  module.exports = factory;

}));
//# sourceMappingURL=index.js.map
