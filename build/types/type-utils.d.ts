import type { SortPlugin, PluginNamesWithArg, PluginNamesWithoutArg, PluginNamesWithArgMaybe } from './type';
export declare type DontCare<T extends unknown = unknown> = any;
declare type And<X, Y> = X extends true ? Y extends true ? true : false : false;
export declare type IsAny<T> = (() => any extends 1 ? 1 : 2) extends (() => T extends 1 ? 1 : 2) ? true : false;
declare type IsNever<T> = [T] extends [never] ? true : false;
export declare type Equal<X, Y> = And<IsNever<X>, IsNever<Y>> extends false ? (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false : true;
declare type isStringLiteral<S> = S extends string ? string extends S ? never : S : never;
declare type Split<S, Delim extends string = '-', Res extends string[] = []> = S extends `${infer L}${Delim}${infer R}` ? Split<R, Delim, [...Res, L]> : S extends isStringLiteral<S> ? [...Res, S] : Res;
export declare type ObjectEntries<T, U extends keyof T = keyof T> = U extends U ? [U, T[U] extends infer R | undefined ? R : never] : never;
export declare type ObjectKeys<T> = Union1th<ObjectEntries<T>>;
export declare type ObjectVals<T> = Union2th<ObjectEntries<T>>;
export declare type GetPath<T extends object, K extends keyof T = keyof T> = K extends string | number ? T[K] extends any[] ? `${K}` | `${K}.${GetPath<T[K]>}` | `${K}[${GetPath<T[K]>}]` : T[K] extends object ? `${K}` | `${K}.${GetPath<T[K]>}` : `${K}` : '';
export declare type ObjectKeyPaths<T extends unknown[], Res = never> = T extends [infer Head, ...infer Tail] ? ObjectKeyPaths<Tail, Res | GetPath<Head & object>> : Res;
declare type UnionToIntersection<U> = (U extends U ? ((k: (x: U) => void) => void) : never) extends ((k: infer I) => void) ? I : never;
declare type UnionLast<U> = UnionToIntersection<U> extends ((x: infer R) => void) ? R : never;
export declare type UnionToTupleSafe<T> = [
    T
] extends [never] ? [] : [T] extends [unknown[]] ? [T] extends [(infer R)[]] ? [...UnionToTupleSafe<Exclude<R, UnionLast<R>>>, UnionLast<R>] : T : [...UnionToTupleSafe<Exclude<T, UnionLast<T>>>, UnionLast<T>];
export declare type Union1th<U> = U extends any ? U extends [infer First] ? First : never : never;
export declare type Union2th<U> = U extends any ? U extends [infer First, infer Second] ? Second : never : never;
export declare type Nths<Num extends number, ARR extends unknown[] = [], One extends unknown[] = never, Idx extends 1[] = [], Res extends unknown[] = []> = [
    One
] extends [never] ? ARR extends [infer ARRHead, ...infer ARRTail] ? ARRHead extends unknown[] ? Nths<Num, ARRTail, ARRHead, [], Res> : never : Res : Idx['length'] extends Num ? One extends [infer OneHead, ...infer OneTail] ? Nths<Num, ARR, never, [], [...Res, OneHead]> : never : One extends [infer OneHead, ...infer OneTail] ? Nths<Num, ARR, OneTail, [...Idx, 1], [...Res]> : never;
export declare type RequiredArguments<Fn> = Fn extends ((...xs: infer Args) => infer Return) ? ((...xs: Required<Args>) => Return) : never;
export declare type isPathAvailable<ARR extends unknown[], Path extends string, ARRSafe extends unknown[] = UnionToTupleSafe<ARR>, PosiblePath = ObjectKeyPaths<ARRSafe>> = Path extends PosiblePath ? true : false;
declare type isEveryCMDValid<Plugins, ARR extends unknown[], CMD extends unknown[], PS2 = PluginNamesWithArg<Plugins>, PS3 = PluginNamesWithoutArg<Plugins>, PS4 = PluginNamesWithArgMaybe<Plugins>> = CMD extends [infer P, ...infer R] ? P extends '' ? false : P extends `${infer Name}()` ? Name extends (PS3 | PS4) ? isEveryCMDValid<Plugins, ARR, R> : false : P extends `${infer Name}(${infer Arg})` ? Name extends (PS2 | PS4) ? isEveryCMDValid<Plugins, ARR, R> : false : isPathAvailable<ARR, P & string> extends true ? isEveryCMDValid<Plugins, ARR, R> : false : true;
export declare type isValidStringCMD<Plugins, ARR extends unknown[], S, SS extends string[] = Split<S>> = S extends isStringLiteral<S> ? S extends '' ? never : isEveryCMDValid<Plugins, ARR, SS> extends true ? S : never : never;
declare type isEverySortPlugin<Fns extends unknown[]> = Fns extends [infer First, ...infer Rest] ? First extends SortPlugin ? isEverySortPlugin<Rest> : false : true;
export declare type isValidSortPlugin<OBJ, UFns extends ObjectVals<OBJ> = ObjectVals<OBJ>, Fns = UnionToTupleSafe<UFns>> = Fns extends unknown[] ? isEverySortPlugin<Fns> extends true ? OBJ : never : never;
export {};
