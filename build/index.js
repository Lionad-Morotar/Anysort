(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  var __DEBUG = false;
  var warn = function (msg) { return __DEBUG ; };
  var strObj = function (obj) { return JSON.stringify(obj); };
  var isVoid = function (x) { return x == undefined; };
  var isVoidType = function (x) { return x === 'void'; };
  var getType = function (x) { return isVoid(x) ? 'void' : Object.prototype.toString.call(x).slice(8, -1).toLowerCase(); };
  var isFn = function (x) { return getType(x) === 'function'; };
  var notNull = function (x) { return !!x; };
  var getValueFromPath = function (pathsStore) { return function (x) {
      var paths = [].concat(pathsStore);
      var val = x, nextPath = null;
      while (val && paths.length) {
          nextPath = paths.shift();
          if (!val.hasOwnProperty(nextPath)) {
              warn("cant find path \"".concat(pathsStore.join('.'), "\" in ").concat(strObj(x), ", skip by default"));
          }
          val = val[nextPath];
      }
      return val;
  }; };

  /**
   * get sorting function based on the type of the value
   * @todo refactor x => comparableValue
   */
  var getCompareValue = {
      string: String,
      number: Number,
      date: function (x) { return +x; },
      symbol: function (x) { return x.toString(); },
      // The priority of true is greater than false
      boolean: function (x) { return !x; },
  };
  var sortBySameType = function (type) { return function (a, b) {
      var getValFn = getCompareValue[type];
      if (!getValFn) {
          return undefined;
      }
      var va = getValFn(a), vb = getValFn(b);
      return va === vb ? 0 : (va < vb ? -1 : 1);
  }; };
  var sortByDefault = function (a, b) {
      var typeA = getType(a);
      var typeB = getType(b);
      // ignore null or undefined
      if (isVoidType(typeA) || isVoidType(typeB)) {
          if (typeA === typeB)
              return 0;
          return a ? -1 : 1;
      }
      var canSort = getCompareValue[typeA] && typeA === typeB;
      if (!canSort) {
          if (typeA === 'number' && typeB === 'string')
              return -1;
          if (typeA === 'string' && typeB === 'number')
              return 1;
          return undefined;
      }
      return sortBySameType(typeA)(a, b);
  };
  var maping = function (map) { return function (fn) { return function (a, b) { return fn(map(a), map(b)); }; }; };
  var result = function (change) { return function (fn) { return function (a, b) { return change(fn(a, b)); }; }; };
  var Sort = /** @class */ (function () {
      function Sort() {
          this.pipeline = [];
      }
      Sort.prototype.map = function (_value) {
          this.pipeline.push({ _value: _value, _type: 'maping' });
          return this;
      };
      Sort.prototype.result = function (_value) {
          this.pipeline.push({ _value: _value, _type: 'result' });
          return this;
      };
      Sort.prototype.seal = function () {
          var targetSortFn = sortByDefault;
          this.pipeline.reverse().map(function (current) {
              var _type = current._type, _value = current._value;
              if (_type === 'maping')
                  targetSortFn = maping(_value)(targetSortFn);
              if (_type === 'result')
                  targetSortFn = result(_value)(targetSortFn);
          });
          return targetSortFn;
      };
      return Sort;
  }());

  /**
   * default plugins
   */
  var plugins = {
      i: function (sort) { return sort.map(function (x) { return (x || '').toLowerCase(); }); },
      dec: function (sort) { return sort.result(function (res) { return -res; }); },
      reverse: function (sort) { return sort.result(function (res) { return -res; }); },
      rand: function (sort) { return sort.result(function (_) { return Math.random() < .5 ? -1 : 1; }); },
      is: function (sort, arg) { return sort.map(function (x) { return x === arg; }); },
      all: function (sort, arg) { return sort.map(function (x) { return x.every
          ? x.every(function (y) { return String(y) === arg; })
          : x === arg; }); },
      has: function (sort, arg) { return sort.map(function (x) { return x instanceof Array
          ? x.some(function (y) { return String(y) === arg; })
          : x.includes(arg); }); },
      not: function (sort, arg) { return sort.map(function (x) { return arg
          ? (x !== arg)
          : !x; }); },
      len: function (sort, arg) { return !arg.length
          ? sort.map(function (x) { return x.length; })
          : sort.map(function (x) { return x.length === +arg; }); },
      getValue: function (paths) { return function (sort) { return sort.map(getValueFromPath(paths.split('.'))); }; }
  };
  /**
   * generate SortFn from string
   */
  function generateSortFnFromStr(ss) {
      var sort = new Sort();
      ss.split('-')
          .filter(notNull)
          .map(function (action) {
          // TODO args
          var _a = action.match(/([^(]+)(\(([^)]*)\))?/), fnName = _a[1], argsWithParen = _a[2], arg = _a[3];
          var plugin = argsWithParen
              ? plugins[fnName]
              : plugins.getValue(fnName);
          // the default value of arg is empty string because the value cames from regex matching
          plugin(sort, arg);
      });
      return sort.seal();
  }
  /**
   * main
   * @todo anysort(Array)
   */
  function factory() {
      var cmd = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          cmd[_i] = arguments[_i];
      }
      // flatten
      // TODO perf count
      cmd = cmd.reduce(function (h, c) { return (h.concat(c)); }, []);
      var sortFns = cmd.length === 0
          ? [new Sort().seal()]
          : cmd.map(function (x, i) {
              try {
                  return isFn(x) ? x : generateSortFnFromStr(x);
              }
              catch (err) {
                  throw new Error("[ERR] Error on generate sort function, Index ".concat(i + 1, "th: ").concat(x, ", error: ").concat(err));
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
