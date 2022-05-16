'use strict';

const isDev = () => process.env.NODE_ENV === 'development';
// istanbul ignore next
const warn = (msg) => isDev() && console.log(`[WARN] ${msg}`);
const strObj = (obj) => JSON.stringify(obj);
const isVoid = (x) => x == undefined;
const getType = (x) => isVoid(x) ? 'void' : Object.prototype.toString.call(x).slice(8, -1).toLowerCase();
const isFn = (x) => getType(x) === 'function';
const notNull = (x) => !!x;
/**
 * @example
 *    1. walk('a.b')({a:{b:3}}) returns 3
 *    2. walk(['a','b'])({a:{b:3}}) returns 3
 */
const walk = (pathsStore) => (x) => {
    const paths = pathsStore instanceof Array
        // istanbul ignore next
        ? pathsStore.slice(0, pathsStore.length)
        : pathsStore.split('.');
    let val = x;
    let nextPath = null;
    while (val && paths.length) {
        nextPath = paths.shift();
        if (!Object.prototype.hasOwnProperty.call(val, nextPath)) {
            warn(`cant find path "${JSON.stringify(pathsStore)}" in ${strObj(x)}, skip by default`);
        }
        val = val[nextPath];
    }
    return val;
};

// global configuration
const config = {
    delim: '-',
    patched: '__ANYSORT_PATCHED__',
    autoWrap: true,
    autoSort: true,
    // TODO restrained type number bigger than zero
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
};

/**
 * get sorting function based on the type of the value
 * @todo refactor x => comparableValue
 * @todo extensible for custom types
 */
const getCompareValue = {
    void: _ => null,
    number: Number,
    string: String,
    symbol: (x) => x.toString(),
    date: (x) => +x,
    function: (x) => x.name,
    // The priority of true is greater than false
    boolean: (x) => !x
};
const sortBySameType = (type, a, b) => {
    const getValFn = getCompareValue[type];
    if (getValFn) {
        const va = getValFn(a);
        const vb = getValFn(b);
        // something interesting:
        // null < null === false
        // null > null === false
        return va === vb ? 0 : (va < vb ? -1 : 1);
    }
    else {
        warn(`cant sort ${a} and ${b}，skip by default`);
    }
};
const sortByDiffType = (oa, ob) => {
    const minus = oa - ob;
    return minus < 0 ? -1 : 1;
};
const sortByTypeOrder = (a, b) => {
    const typeA = getType(a);
    const typeB = getType(b);
    const orders = config.orders;
    const oa = orders[typeA] || orders.rest;
    const ob = orders[typeB] || orders.rest;
    const isSameType = oa === ob;
    const isComparable = oa && ob;
    // console.log('[ANYSORT DEBUG]', typeA, typeB, a, b, oa, ob)
    if (isComparable) {
        return isSameType
            ? sortBySameType(typeA, a, b)
            : sortByDiffType(oa, ob);
    }
    else {
        warn(`cant sort ${a} and ${b}，skip by default`);
    }
};
const maping = map => fn => (a, b) => fn(map(a), map(b));
const result = change => fn => (a, b) => change(fn(a, b));
class Sort {
    constructor() {
        this.pipeline = [];
    }
    // TODO multi-arguments
    register(plugin, arg) {
        plugin(this, arg);
    }
    /**
     * its not same as Array.prototype.map in js,
     * but more like map value a to value b,
     * array.sort((a, b) => a - b) then becames:
     * array.sort((a, b) => map(a) - map(b))
     */
    map(_value) {
        this.pipeline.push({ _value, _type: 'maping' });
        return this;
    }
    /**
     * becareful, the result plugin should be
     * the last one in this.pipeline
     */
    result(_value) {
        this.pipeline.push({ _value, _type: 'result' });
        return this;
    }
    seal() {
        let targetSortFn = sortByTypeOrder;
        this.pipeline.reverse().map(current => {
            const { _type, _value } = current;
            if (_type === 'maping')
                targetSortFn = maping(_value)(targetSortFn);
            if (_type === 'result')
                targetSortFn = result(_value)(targetSortFn);
        });
        return targetSortFn;
    }
}

// TODO reduce compiled code size
// TODO plugin 'remap'
const plugins = {
    /* Plugins that change sort argument */
    i: (sort) => sort.map(x => {
        if (typeof x === 'string')
            return x.toLowerCase();
        else
            throw new Error('[ANYSORT] "i" plugin only works on string');
    }),
    is: (sort, arg) => {
        if (arg !== '') {
            return sort.map(x => x === arg);
        }
        else {
            throw new Error('[ANYSORT] "is" plugin needs an arg');
        }
    },
    nth: (sort, arg) => {
        if (arg !== '') {
            return sort.map(x => {
                if (x instanceof Array)
                    return x[+arg];
                if (typeof x === 'string')
                    return x[+arg];
                else
                    throw new Error('[ANYSORT] "nth" plugin only works on string or array');
            });
        }
        else {
            throw new Error('[ANYSORT] "nth" plugin need an arg');
        }
    },
    all: (sort, arg) => sort.map(x => {
        if (arg !== '') {
            if (x instanceof Array)
                return x.every(y => String(y) === arg);
            if (typeof x === 'string')
                return x === arg;
            else
                throw new Error('[ANYSORT] "all" plugin only works on string or array');
        }
        else {
            throw new Error('[ANYSORT] "all" plugin need an arg');
        }
    }),
    has: (sort, arg) => sort.map(x => {
        if (arg !== '') {
            if (x instanceof Array)
                return x.some(y => String(y) === arg);
            if (typeof x === 'string')
                return x.includes(arg);
            else
                throw new Error('[ANYSORT] "has" plugin only works on string or array');
        }
        else {
            throw new Error('[ANYSORT] "has" plugin need an arg');
        }
    }),
    not: (sort, arg = '') => {
        if (arg !== '') {
            return sort.map(x => x !== arg);
        }
        else {
            return sort.map(x => !x);
        }
    },
    len: (sort, arg) => {
        if (arg !== '') {
            return sort.map(x => {
                if (x instanceof Array)
                    return (x.length === +arg);
                if (typeof x === 'string')
                    return (x.length === +arg);
                else
                    throw new Error('[ANYSORT] "len" plugin only works on string or array');
            });
        }
        else {
            return sort.map(x => {
                if (x instanceof Array)
                    return x.length;
                if (typeof x === 'string')
                    return x.length;
                else
                    throw new Error('[ANYSORT] "len" plugin only works on string or array');
            });
        }
    },
    get: (sort, arg) => {
        if (arg !== '')
            return sort.map(walk(arg));
        else
            throw new Error('[ANYSORT] "get" plugin must have a string argument');
    },
    /* Plugins that change sort order directly */
    reverse: (sort) => sort.result(res => -res),
    rand: (sort) => sort.result(_ => Math.random() < 0.5 ? -1 : 1),
    /* Plugins for Proxy API */
    result: (sort) => sort.result(res => res)
};

/**
 * generate SortFn from string command
 * @exam 'date-reverse()' would be a valid command,
 *        it would be split into 'date', 'reverse()'  two plugins
 */
function genSortFnFromStr(ss) {
    const sort = new Sort();
    ss.split(config.delim)
        .filter(notNull)
        .map(action => {
        // if match with parens, it's a plugin, such as is(a)),
        // else it's a object path such as 'a.b'
        const matchRes = action.match(/^([^(]+)(\(([^)]*)\))?$/);
        if (matchRes) {
            const [, name, callable, fnArg] = matchRes;
            callable
                ? sort.register(plugins[name], fnArg)
                : sort.register(plugins.get, name);
        }
        else {
            throw new Error(`[ANYSORT] illegal command: ${ss}`);
        }
    });
    return sort.seal();
}
function wrapperProxy(arr) {
    if (arr[config.patched]) {
        throw new Error('[ANYSORT] patched arr cant be wrapped again');
    }
    let proxy = null;
    const pathStore = [];
    return (proxy = new Proxy(arr, {
        get(target, prop) {
            switch (prop) {
                case config.patched:
                    return true;
                case 'apply':
                    return (...args) => factory(target, ...args);
                default:
                    if (Object.prototype.hasOwnProperty.call(plugins, prop)) {
                        // TODO check typeof arg
                        return (arg = '') => {
                            const cmdName = [pathStore.splice(0, pathStore.length).join('.'), prop].join('-');
                            const cmd = `${cmdName}(${String(arg)})`;
                            return factory(target, cmd);
                        };
                    }
                    if (prop in target) {
                        return target[prop];
                    }
                    // being considered for deprecation
                    if (prop.includes('_')) {
                        return (arg = '') => {
                            const cmdName = [pathStore.splice(0, pathStore.length).join('.'), prop].join('-');
                            const cmd = `${cmdName.replace('_', '()-')}(${String(arg)})`;
                            return factory(target, cmd);
                        };
                    }
                    pathStore.push(prop);
                    return proxy;
            }
        }
    }));
}
/**
 * main
 */
function genFactory() {
    const factory = (arr, ...cmds) => {
        const filteredCMDs = cmds
            .reduce((h, c) => (h.concat(c)), [])
            .filter(Boolean);
        const isEmptyCMDs = filteredCMDs.length === 0;
        if (isEmptyCMDs && !config.autoSort) {
            if (config.autoWrap) {
                return wrapperProxy(arr);
            }
            else {
                // !FIXME fix type
                return arr;
            }
        }
        const sortFns = isEmptyCMDs
            ? [new Sort().seal()]
            : filteredCMDs.map((x, i) => {
                return isFn(x)
                    ? x
                    : genSortFnFromStr(x);
            });
        const flat = fns => ((a, b) => fns.reduce((sortResult, fn) => (sortResult || fn(a, b)), 0));
        const flattenCMDs = flat(sortFns);
        let result = arr.sort(flattenCMDs);
        if (config.autoWrap) {
            if (!result[config.patched]) {
                result = wrapperProxy(result);
            }
        }
        return result;
    };
    return factory;
}
const factory = genFactory();
// install plugins
const extendPlugs = (exts) => {
    Object.entries(exts).map(([k, v]) => plugins[k] = v);
    return factory;
};
factory.extends = extendPlugs;
factory.wrap = arr => wrapperProxy(arr);
factory.config = config;

module.exports = factory;
