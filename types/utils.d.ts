import type { SortableTypeEnum, SortableValue } from './type';
export declare const isDev: () => boolean;
export declare const warn: (msg: String) => false | void;
export declare const strObj: (obj: Object) => string;
export declare const isVoid: (x: SortableValue) => boolean;
export declare const isVoidType: (x: SortableTypeEnum) => boolean;
export declare const getType: (x: SortableValue) => SortableTypeEnum | string;
export declare const isFn: (x: SortableValue) => boolean;
export declare const notNull: (x: any) => boolean;
/**
 * @example
 *    1. walk('a.b')({a:{b:3}}) returns 3
 *    2. walk(['a','b'])({a:{b:3}}) returns 3
 */
export declare const walk: (pathsStore: String | String[]) => (x: any) => any;
