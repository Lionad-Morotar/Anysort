(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('tslib')) :
    typeof define === 'function' && define.amd ? define(['tslib'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.tslib));
})(this, (function (tslib) { 'use strict';

    var isDev = function () { return process.env.NODE_ENV === 'development'; };
    var warn = function (msg) { return isDev() && console.log("[WARN] ".concat(msg)); };
    var strObj = function (obj) { return JSON.stringify(obj); };
    var isVoid = function (x) { return x == undefined; };
    var getType = function (x) { return isVoid(x) ? 'void' : Object.prototype.toString.call(x).slice(8, -1).toLowerCase(); };
    var isFn = function (x) { return getType(x) === 'function'; };
    var notNull = function (x) { return !!x; };
    /**
     * @example
     *    1. walk('a.b')({a:{b:3}}) returns 3
     *    2. walk(['a','b'])({a:{b:3}}) returns 3
     */
    var walk = function (pathsStore) { return function (x) {
        var paths = pathsStore instanceof Array
            ? [].concat(pathsStore)
            : pathsStore.split('.');
        var val = x;
        var nextPath = null;
        while (val && paths.length) {
            nextPath = paths.shift();
            if (!Object.prototype.hasOwnProperty.call(val, nextPath)) {
                warn("cant find path \"".concat(JSON.stringify(pathsStore), "\" in ").concat(strObj(x), ", skip by default"));
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
        "void": function (_) { return null; },
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
            "void": 4
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
        /**
         * its not same as Array.prototype.map in js,
         * but more like map value a to value b,
         * array.sort((a, b) => a - b) then becames:
         * array.sort((a, b) => map(a) - map(b))
         */
        Sort.prototype.map = function (_value) {
            this.pipeline.push({ _value: _value, _type: 'maping' });
            return this;
        };
        /**
         * becareful, the result plugin should be
         * the last one in this.pipeline
         */
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

    // global configuration
    var config = {
        patched: '__ANYSORT_PATCHED__',
        autoWrap: true,
        autoSort: true
    };
    // build-in plugins
    // TODO plugin 'remap'
    var plugins = {
        /* Plugins that change sort argument */
        i: function (sort) { return sort.map(function (x) { return (x || '').toLowerCase(); }); },
        is: function (sort, arg) { return sort.map(function (x) { return x === arg; }); },
        nth: function (sort, arg) { return sort.map(function (x) { return x[+arg]; }); },
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
            return arg.length
                ? sort.map(function (x) { return x.length === +arg; })
                : sort.map(function (x) { return x.length; });
        },
        get: function (sort, arg) { return sort.map(walk(arg)); },
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
    var wrapperProxy = function (arr) {
        if (arr[config.patched]) {
            throw new Error('[ANYSORT] patched arr cant be wrapped again');
        }
        return new Proxy(arr, {
            get: function (target, prop) {
                if (prop === config.patched) {
                    return true;
                }
                if (prop === 'apply') {
                    return function () {
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        // console.log(target, prop, args)
                        return factory.apply(void 0, tslib.__spreadArray([target], args, false));
                    };
                }
                return target[prop];
            }
        });
    };
    /**
     * main
     * @exam 4 ways to use anysort
     *       1. anysort(arr: any[], args: SortCMD[]) => any[];
     *       2. anysort(arr: any[], ...args: SortCMD[]) => any[];
     *       3. anysort(...args: SortCMD[]) => SortFn;
     *       4. anysort(arr: any[]) => any[]
     * @todo fix types
     */
    // @ts-ignore
    var factory = function (arr) {
        var cmds = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            cmds[_i - 1] = arguments[_i];
        }
        var isFirstArr = arr instanceof Array;
        var filteredCMDs = (isFirstArr ? cmds : [].concat(arr).concat(cmds))
            .reduce(function (h, c) { return (h.concat(c)); }, [])
            .filter(Boolean);
        var isEmptyCMDs = filteredCMDs.length === 0;
        if (isEmptyCMDs && !config.autoSort) {
            return arr;
        }
        var sortFns = isEmptyCMDs
            ? [new Sort().seal()]
            : filteredCMDs.map(function (x, i) {
                try {
                    return isFn(x) ? x : genSortFnFromStr(x);
                }
                catch (err) {
                    throw new Error("[ERR] Error on generate sort function, Index ".concat(i + 1, "th: ").concat(x, ", error: ").concat(err));
                }
            });
        var flat = function (fns) { return function (a, b) { return fns.reduce(function (sortResult, fn) { return sortResult || fn(a, b); }, 0); }; };
        var flattenCMDs = flat(sortFns);
        var result = isFirstArr
            ? arr.sort(flattenCMDs)
            : flattenCMDs;
        if (config.autoWrap) {
            if (isFirstArr) {
                if (!result[config.patched]) {
                    result = wrapperProxy(result);
                }
            }
        }
        return result;
    };
    // install plugins for Sort
    var extendPlugs = function (exts) {
        return Object.entries(exts).map(function (_a) {
            var k = _a[0], v = _a[1];
            return plugins[k] = v;
        });
    };
    factory["extends"] = extendPlugs;
    factory.genSortFnFromStrGen = genSortFnFromStrGen;
    factory.wrap = function (arr) { return wrapperProxy(arr); };
    factory.config = config;
    module.exports = factory;

}));
//# sourceMappingURL=index.js.map
