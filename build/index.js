(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  var isDev = function () { return process.env.NODE_ENV === 'development'; };
  var warn = function (msg) { return isDev() && console.log("[WARN] ".concat(msg)); };
  var strObj = function (obj) { return JSON.stringify(obj); };
  var isVoid = function (x) { return x == undefined; };
  var getType = function (x) { return isVoid(x) ? 'void' : Object.prototype.toString.call(x).slice(8, -1).toLowerCase(); };
  var isFn = function (x) { return getType(x) === 'function'; };
  var notNull = function (x) { return !!x; };
  var getValueFromPath = function (pathsStore) { return function (x) {
      var paths = [].concat(pathsStore);
      var val = x;
      var nextPath = null;
      while (val && paths.length) {
          nextPath = paths.shift();
          if (!Object.prototype.hasOwnProperty.call(val, nextPath)) {
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
      void: function (_) { return null; },
      string: String,
      number: Number,
      date: function (x) { return +x; },
      symbol: function (x) { return x.toString(); },
      // The priority of true is greater than false
      boolean: function (x) { return !x; }
  };
  var sortBySameType = function (type) { return function (a, b) {
      var getValFn = getCompareValue[type];
      if (!getValFn) {
          warn("cant sort ".concat(a, " and ").concat(b, "\uFF0Cskip by default"));
          return undefined;
      }
      var va = getValFn(a);
      var vb = getValFn(b);
      return va === vb ? 0 : (va < vb ? -1 : 1);
  }; };
  var sortByDiffType = function (typeA, typeB) { return function (a, b) {
      var idx = {
          number: 1,
          string: 2,
          object: 3,
          void: 4
      };
      if (idx[typeA] && idx[typeB]) {
          var minus = idx[typeA] - idx[typeB];
          return minus > 0 ? 1 : -1;
      }
      else {
          warn("cant sort ".concat(a, " and ").concat(b, "\uFF0Cskip by default"));
          return 0;
      }
  }; };
  var sortByDefault = function (a, b) {
      var typeA = getType(a);
      var typeB = getType(b);
      var isSameType = typeA === typeB;
      var isComparable = getCompareValue[typeA] && getCompareValue[typeB];
      if (isSameType && isComparable) {
          return sortBySameType(typeA)(a, b);
      }
      else if (isComparable) {
          return sortByDiffType(typeA, typeB)(a, b);
      }
      else {
          warn("cant sort ".concat(a, " and ").concat(b, "\uFF0Cskip by default"));
      }
  };
  var maping = function (map) { return function (fn) { return function (a, b) { return fn(map(a), map(b)); }; }; };
  var result = function (change) { return function (fn) { return function (a, b) { return change(fn(a, b)); }; }; };
  var Sort = /** @class */ (function () {
      function Sort() {
          this.pipeline = [];
      }
      // TODO multi-arguments
      Sort.prototype.register = function (plugin, arg) {
          plugin(this, arg);
      };
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
              // ! It is wrong to apply the maping plugin after applying the result plugin
              if (_type === 'result')
                  targetSortFn = result(_value)(targetSortFn);
          });
          return targetSortFn;
      };
      return Sort;
  }());

  // build-in plugins
  var plugins = {
      /* Plugins that change sort argument */
      i: function (sort) { return sort.map(function (x) { return (x || '').toLowerCase(); }); },
      is: function (sort, arg) { return sort.map(function (x) { return x === arg; }); },
      all: function (sort, arg) {
          return sort.map(function (x) { return x.every ? x.every(function (y) { return String(y) === arg; }) : x === arg; });
      },
      has: function (sort, arg) {
          return sort.map(function (x) { return x instanceof Array
              ? x.some(function (y) { return String(y) === arg; })
              : x.includes(arg); });
      },
      not: function (sort, arg) { return sort.map(function (x) { return arg ? (x !== arg) : !x; }); },
      len: function (sort, arg) {
          return !arg.length ? sort.map(function (x) { return x.length; }) : sort.map(function (x) { return x.length === +arg; });
      },
      get: function (sort, arg) { return sort.map(getValueFromPath(arg.split('.'))); },
      /* Plugins that change sort order directly */
      reverse: function (sort) { return sort.result(function (res) { return -res; }); },
      rand: function (sort) { return sort.result(function (_) { return Math.random() < 0.5 ? -1 : 1; }); }
  };
  /**
   * generate SortFn from string command
   * @exam 'date-reverse()' would be a valid command,
   *        then would be split into 'date' and 'reverse()' plugin
   */
  var genSortFnFromStrGen = function (delim) {
      if (delim === void 0) { delim = '-'; }
      return function (ss) {
          var sort = new Sort();
          ss.split(delim)
              .filter(notNull)
              .map(function (action) {
              // if match with parens, it's a plugin, such as is(a)),
              // else it's a object path such as 'a.b'
              var _a = action.match(/([^(]+)(\(([^)]*)\))?/), name = _a[1], callable = _a[2], fnArg = _a[3];
              callable
                  ? sort.register(plugins[name], fnArg)
                  : sort.register(plugins.get, name);
          });
          return sort.seal();
      };
  };
  var genSortFnFromStr = genSortFnFromStrGen();
  /**
   * main
   * @exam Array.sort(anysort(...args))
   * @exam anysort(Array, ...args)
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
                  return isFn(x) ? x : genSortFnFromStr(x);
              }
              catch (err) {
                  throw new Error("[ERR] Error on generate sort function, Index ".concat(i + 1, "th: ").concat(x, ", error: ").concat(err));
              }
          });
      var flat = function (fns) { return function (a, b) { return fns.reduce(function (sortResult, fn) { return sortResult || fn(a, b); }, 0); }; };
      return flat(sortFns);
  }
  // install plugins for Sort
  var extendPlugins = function (exts) { return Object.entries(exts).map(function (_a) {
      var k = _a[0], v = _a[1];
      return plugins[k] = v;
  }); };
  /**
   * Module Exports
   */
  factory.extends = extendPlugins;
  factory.genSortFnFromStrGen = genSortFnFromStrGen;
  module.exports = factory;

}));
//# sourceMappingURL=index.js.map
