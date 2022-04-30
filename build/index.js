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
    var getValsFrom = function (x) {
        var ret = [];
        while (x.length > 0)
            ret.push(x.shift());
        return ret;
    };
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

    // global configuration
    var config = {
        patched: '__ANYSORT_PATCHED__',
        autoWrap: true,
        autoSort: true,
        orders: {
            number: 1,
            string: 2,
            symbol: 3,
            date: 4,
            object: 5,
            "function": 6,
            rest: 7,
            // if no 'void' provided,
            // undefined value will be ignored in sort,
            // null value will be treated as normal unrecognized value
            "void": 8
        }
    };

    /**
     * get sorting function based on the type of the value
     * @todo refactor x => comparableValue
     * @todo extensible for custom types
     */
    var getCompareValue = {
        "void": function (_) { return null; },
        number: Number,
        string: String,
        symbol: function (x) { return x.toString(); },
        date: function (x) { return +x; },
        "function": function (x) { return x.name; },
        // The priority of true is greater than false
        boolean: function (x) { return !x; }
    };
    var sortBySameType = function (type, a, b) {
        var getValFn = getCompareValue[type];
        if (getValFn) {
            var va = getValFn(a);
            var vb = getValFn(b);
            return va === vb ? 0 : (va < vb ? -1 : 1);
        }
        else {
            warn("cant sort ".concat(a, " and ").concat(b, "\uFF0Cskip by default"));
        }
    };
    var sortByDiffType = function (oa, ob) {
        var minus = oa - ob;
        return minus === 0 ? 0 : (minus > 0 ? 1 : -1);
    };
    var sortByTypeOrder = function (a, b) {
        var typeA = getType(a);
        var typeB = getType(b);
        var orders = config.orders;
        var oa = orders[typeA] || orders.rest;
        var ob = orders[typeB] || orders.rest;
        var isSameType = oa === ob;
        var isComparable = oa && ob;
        // console.log('[ANYSORT DEBUG]', typeA, typeB, a, b, oa, ob)
        if (isComparable) {
            return isSameType
                ? sortBySameType(typeA, a, b)
                : sortByDiffType(oa, ob);
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
            var targetSortFn = sortByTypeOrder;
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

    // TODO reduce compiled code size
    // TODO plugin 'remap'
    var plugins = {
        /* Plugins that change sort argument */
        i: function (sort) { return sort.map(function (x) {
            if (typeof x === 'string')
                return x.toLowerCase();
            else
                throw new Error('[ANYSORT] "i" plugin only works on string');
        }); },
        is: function (sort, arg) {
            if (arg !== '') {
                return sort.map(function (x) { return x === arg; });
            }
            else {
                throw new Error('[ANYSORT] "is" plugin need a string as arg');
            }
        },
        nth: function (sort, arg) {
            if (arg !== '') {
                return sort.map(function (x) {
                    if (x instanceof Array)
                        return x[+arg];
                    if (typeof x === 'string')
                        return x[+arg];
                    else
                        throw new Error('[ANYSORT] "nth" plugin only works on string or array');
                });
            }
            else {
                throw new Error('[ANYSORT] "nth" plugin need a string as arg');
            }
        },
        all: function (sort, arg) { return sort.map(function (x) {
            if (arg !== '') {
                if (x instanceof Array)
                    return x.every(function (y) { return String(y) === arg; });
                if (typeof x === 'string')
                    return x === arg;
                else
                    throw new Error('[ANYSORT] "all" plugin only works on string or array');
            }
            else {
                throw new Error('[ANYSORT] "all" plugin need a string as arg');
            }
        }); },
        has: function (sort, arg) { return sort.map(function (x) {
            if (arg !== '') {
                if (x instanceof Array)
                    return x.some(function (y) { return String(y) === arg; });
                if (typeof x === 'string')
                    return x.includes(arg);
                else
                    throw new Error('[ANYSORT] "has" plugin only works on string or array');
            }
            else {
                throw new Error('[ANYSORT] "has" plugin need a string as arg');
            }
        }); },
        not: function (sort, arg) {
            if (arg !== '') {
                return sort.map(function (x) { return x !== arg; });
            }
            else {
                return sort.map(function (x) { return !x; });
            }
        },
        len: function (sort, arg) {
            if (arg !== '') {
                return sort.map(function (x) {
                    if (x instanceof Array)
                        return (x.length === +arg);
                    if (typeof x === 'string')
                        return (x.length === +arg);
                    else
                        throw new Error('[ANYSORT] "len" plugin only works on string or array');
                });
            }
            else {
                return sort.map(function (x) {
                    if (x instanceof Array)
                        return x.length;
                    if (typeof x === 'string')
                        return x.length;
                    else
                        throw new Error('[ANYSORT] "len" plugin only works on string or array');
                });
            }
        },
        get: function (sort, arg) {
            if (arg !== '')
                return sort.map(walk(arg));
            else
                throw new Error('[ANYSORT] "get" plugin must have a string argument');
        },
        /* Plugins that change sort order directly */
        reverse: function (sort) { return sort.result(function (res) { return -res; }); },
        rand: function (sort) { return sort.result(function (_) { return Math.random() < 0.5 ? -1 : 1; }); },
        /* Plugins for Proxy API */
        result: function (sort) { return sort.result(function (res) { return res; }); }
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
        var proxy = null;
        var pathStore = [];
        return (proxy = new Proxy(arr, {
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
                        return factory.apply(void 0, tslib.__spreadArray([target], args, false));
                    };
                }
                if (prop === 'sort') {
                    return function (arg) { return factory(target, arg); };
                }
                if (Object.prototype.hasOwnProperty.call(plugins, prop)) {
                    // TODO check typeof arg
                    return function (arg) {
                        if (arg === void 0) { arg = ''; }
                        var cmdName = [getValsFrom(pathStore).join('.'), prop].join('-');
                        var cmd = "".concat(cmdName, "(").concat(String(arg), ")");
                        return factory(target, cmd);
                    };
                }
                if (prop in target) {
                    return target[prop];
                }
                if (prop.includes('_')) {
                    return function (arg) {
                        if (arg === void 0) { arg = ''; }
                        var cmdName = [getValsFrom(pathStore).join('.'), prop].join('-');
                        var cmd = "".concat(cmdName.replace('_', '()-'), "(").concat(String(arg), ")");
                        return factory(target, cmd);
                    };
                }
                pathStore.push(prop);
                return proxy;
            }
        }));
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
            if (config.autoWrap) {
                return wrapperProxy(arr);
            }
            else {
                return arr;
            }
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
        Object.entries(exts).map(function (_a) {
            var k = _a[0], v = _a[1];
            return plugins[k] = v;
        });
        return factory;
    };
    factory["extends"] = extendPlugs;
    factory.genSortFnFromStrGen = genSortFnFromStrGen;
    factory.wrap = function (arr) { return wrapperProxy(arr); };
    factory.config = config;
    module.exports = factory;

}));
//# sourceMappingURL=index.js.map
