export const isDev = () => process.env.NODE_ENV === 'development';
export const warn = (msg) => isDev() && console.log(`[WARN] ${msg}`);
export const strObj = (obj) => JSON.stringify(obj);
export const isVoid = (x) => x == undefined;
export const isVoidType = (x) => x === 'void';
export const getType = (x) => isVoid(x) ? 'void' : Object.prototype.toString.call(x).slice(8, -1).toLowerCase();
export const isFn = (x) => getType(x) === 'function';
export const notNull = (x) => !!x;
/**
 * @example
 *    1. walk('a.b')({a:{b:3}}) returns 3
 *    2. walk(['a','b'])({a:{b:3}}) returns 3
 */
export const walk = (pathsStore) => (x) => {
    const paths = pathsStore instanceof Array
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
