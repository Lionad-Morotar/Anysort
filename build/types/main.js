import Sort from './sort';
import plugins from './build-in-plugins';
import config from './config';
import { isFn, notNull } from './utils';
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
        const matchRes = action.match(/([^(]+)(\(([^)]*)\))?/);
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
            if (prop === config.patched) {
                return true;
            }
            if (prop === 'apply') {
                return (...args) => factory(target, ...args);
            }
            if (prop === 'sort') {
                return (arg) => factory(target, arg);
            }
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
    }));
}
/**
 * main
 * @exam 3 ways to use anysort
 *       1. anysort(arr: any[], args: SortCMD[]) => any[];
 *       2. anysort(arr: any[], ...args: SortCMD[]) => any[];
 *       3. anysort(arr: any[]) => any[]
 */
function factory(arr, ...cmds) {
    const filteredCMDs = cmds
        .reduce((h, c) => (h.concat(c)), [])
        .filter(Boolean);
    const isEmptyCMDs = filteredCMDs.length === 0;
    if (isEmptyCMDs && !config.autoSort) {
        if (config.autoWrap) {
            return wrapperProxy(arr);
        }
        else {
            return arr;
        }
    }
    const sortFns = isEmptyCMDs
        ? [new Sort().seal()]
        : filteredCMDs.map((x, i) => {
            try {
                return isFn(x) ? x : genSortFnFromStr(x);
            }
            catch (err) {
                throw new Error(`[ERR] Error on generate sort function, Index ${i + 1}th: ${x}, error: ${err}`);
            }
        });
    const flat = fns => (a, b) => fns.reduce((sortResult, fn) => (sortResult || fn(a, b)), 0);
    const flattenCMDs = flat(sortFns);
    let result = arr.sort(flattenCMDs);
    if (config.autoWrap) {
        if (!result[config.patched]) {
            result = wrapperProxy(result);
        }
    }
    return result;
}
// install plugins for Sort
// TODO fix type
const extendPlugs = (exts) => {
    Object.entries(exts).map(([k, v]) => plugins[k] = v);
    return factory;
};
factory.extends = extendPlugs;
factory.wrap = arr => wrapperProxy(arr);
factory.config = config;
export default factory;
