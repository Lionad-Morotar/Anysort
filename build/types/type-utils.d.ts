import type { SortPlugin } from './type';
declare type isStringLiteral<S> = S extends string ? string extends S ? never : S : never;
declare type Split<S, Delim extends string = '-', Res extends string[] = []> = S extends `${infer L}${Delim}${infer R}` ? Split<R, Delim, [...Res, L]> : S extends isStringLiteral<S> ? [...Res, S] : Res;
export declare type ObjectEntries<T, U extends keyof T = keyof T> = U extends U ? [U, T[U] extends infer R | undefined ? R : never] : never;
export declare type GetPath<T extends object, K extends keyof T = keyof T> = K extends string | number ? T[K] extends any[] ? `${K}` | `${K}.${GetPath<T[K]>}` | `${K}[${GetPath<T[K]>}]` : T[K] extends object ? `${K}` | `${K}.${GetPath<T[K]>}` : `${K}` : '';
export declare type ObjectKeyPaths<T extends unknown[], Res = never> = T extends [infer Head, ...infer Tail] ? ObjectKeyPaths<Tail, Res | GetPath<Head & object>> : Res;
declare type UnionToIntersection<U> = (U extends U ? ((k: (x: U) => void) => void) : never) extends ((k: infer I) => void) ? I : never;
declare type UnionLast<U> = UnionToIntersection<U> extends ((x: infer R) => void) ? R : never;
export declare type UnionToTupleSafe<T> = [
    T
] extends [never] ? [] : [T] extends [unknown[]] ? [T] extends [(infer R)[]] ? [...UnionToTupleSafe<Exclude<R, UnionLast<R>>>, UnionLast<R>] : T : [...UnionToTupleSafe<Exclude<T, UnionLast<T>>>, UnionLast<T>];
export declare type Union2th<U> = U extends any ? U extends [infer First, infer Second] ? Second : never : never;
export declare type Nths<Num extends number, ARR extends unknown[] = [], One extends unknown[] = never, Idx extends 1[] = [], Res extends unknown[] = []> = [
    One
] extends [never] ? ARR extends [infer ARRHead, ...infer ARRTail] ? ARRHead extends unknown[] ? Nths<Num, ARRTail, ARRHead, [], Res> : never : Res : Idx['length'] extends Num ? One extends [infer OneHead, ...infer OneTail] ? Nths<Num, ARR, never, [], [...Res, OneHead]> : never : One extends [infer OneHead, ...infer OneTail] ? Nths<Num, ARR, OneTail, [...Idx, 1], [...Res]> : never;
export declare type RequiredArguments<Fn> = Fn extends ((...xs: infer Args) => any) ? ((...xs: Required<Args>) => any) : never;
export declare type isPathAvailable<ARR extends unknown[], Path extends string, ARRSafe extends unknown[] = UnionToTupleSafe<ARR>, PosiblePath = ObjectKeyPaths<ARRSafe>> = Path extends PosiblePath ? true : false;
declare type isEveryCMDValid<PS1, PS2, PS3, ARR extends unknown[], CMD extends unknown[]> = CMD extends [infer P, ...infer R] ? P extends '' ? false : P extends `${infer Name}()` ? Name extends (PS2 | PS3) ? isEveryCMDValid<PS1, PS2, PS3, ARR, R> : false : P extends `${infer Name}(${infer Arg})` ? Name extends PS2 ? isEveryCMDValid<PS1, PS2, PS3, ARR, R> : false : isPathAvailable<ARR, P & string> extends true ? isEveryCMDValid<PS1, PS2, PS3, ARR, R> : false : true;
export declare type isValidStringCMD<PS1, PS2, PS3, ARR extends unknown[], S, SS extends string[] = Split<S>> = S extends isStringLiteral<S> ? S extends '' ? never : isEveryCMDValid<PS1, PS2, PS3, ARR, SS> extends true ? S : never : never;
declare type isEverySortPlugin<Fns extends unknown[]> = Fns extends [infer First, ...infer Rest] ? First extends SortPlugin ? isEverySortPlugin<Rest> : false : true;
export declare type isValidSortPlugin<OBJ, UFns extends Union2th<ObjectEntries<OBJ>> = Union2th<ObjectEntries<OBJ>>, Fns = UnionToTupleSafe<UFns>> = Fns extends unknown[] ? isEverySortPlugin<Fns> extends true ? OBJ : never : never;
export {};
