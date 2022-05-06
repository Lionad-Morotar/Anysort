import { walk } from './utils';
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
            throw new Error('[ANYSORT] "is" plugin need a string as arg');
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
            throw new Error('[ANYSORT] "nth" plugin need a string as arg');
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
            throw new Error('[ANYSORT] "all" plugin need a string as arg');
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
            throw new Error('[ANYSORT] "has" plugin need a string as arg');
        }
    }),
    not: (sort, arg) => {
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
export default plugins;
