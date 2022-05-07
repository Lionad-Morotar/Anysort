/* eslint-disable */

import type { PluginNames, PluginNamesWithArgMaybe, PluginNamesWithoutArg } from './build-in-plugins'

/* Logic */

type Is<T extends true> = T
type Not<T extends false> = T
type And<X, Y> = X extends true ? Y extends true ? true : false : false
type IsNever<T> = [T] extends [never] ? true : false
type Equal<X, Y> =
  And<IsNever<X>, IsNever<Y>> extends false
  ? (<T>() => T extends X ? 1 : 2) extends
    (<T>() => T extends Y ? 1 : 2) ? true : false
  : true

/* String */

type isStringLiteral<S> = S extends string ? string extends S ? never : S : never

type Split<S, Delim extends string = '-', Res extends string[] = []> =
  S extends `${infer L}${Delim}${infer R}`
  ? Split<R, Delim, [...Res, L]>
  : S extends isStringLiteral<S>
    ? [...Res, S]
    : Res
type Split_test = [
  Split<'date.a.b.c-1-2()-4-5()'>,
  Split<'a.b.c-1--2()'>,
]

/* objects */

export type GetPath<
  T extends object,
  K extends keyof T = keyof T
> =
  K extends string | number
  ? T[K] extends any[]
  ? `${K}` | `${K}.${GetPath<T[K]>}` | `${K}[${GetPath<T[K]>}]`
  : T[K] extends object
  ? `${K}` | `${K}.${GetPath<T[K]>}`
  : `${K}`
  : ''

export type ObjectKeyPaths<T extends unknown[], Res = never> =
  T extends [infer Head, ...infer Tail]
  ? ObjectKeyPaths<Tail, Res | GetPath<Head & object>>
  : Res
// TODO remove useless property,
// kile "a.toString" | "a.toLocaleString" | "a.pop" | "a.push" | ...
// type test_ObjectKeyPaths = ObjectKeyPaths<[{a:unknown[]},{b:{c:{d:2}}}]>

/* union */

type UnionToIntersection<U> =
  (U extends U ? ((k: (x: U) => void) => void) : never) extends
  ((k: infer I) => void) ? I : never

type UnionLast<U> = UnionToIntersection<U> extends ((x: infer R) => void) ? R : never

export type UnionToTupleSafe<T> =
  [T] extends [never]
  ? []
  : [T] extends [unknown[]]
  ? [T] extends [(infer R)[]]
  ? [...UnionToTupleSafe<Exclude<R, UnionLast<R>>>, UnionLast<R>]
  : T
  : [...UnionToTupleSafe<Exclude<T, UnionLast<T>>>, UnionLast<T>]

/* AnySort */

export type isPathAvailable<
  ARR extends unknown[],
  Path extends string,
  ARRSafe extends unknown[] = UnionToTupleSafe<ARR>,
  PosiblePath = ObjectKeyPaths<ARRSafe>
> =
  Path extends PosiblePath
  ? true
  : false

type isEveryCMDValid<
  PS1 extends PluginNames,
  PS2 extends PluginNamesWithArgMaybe,
  PS3 extends PluginNamesWithoutArg,
  ARR extends unknown[],
  CMD extends unknown[]
> =
  CMD extends [infer P, ...infer R]
    ? P extends ''
      ? false
      : P extends `${infer Name}()`
        ? Name extends PS3
          ? isEveryCMDValid<PS1, PS2, PS3, ARR, R>
          : false
        : P extends `${infer Name}(${infer Arg})`
          ? Name extends PS2
            ? isEveryCMDValid<PS1, PS2, PS3, ARR, R>
            : false
          // not a build-in-plugin,
          // it's properties such as "a.b.c",
          // so check if every item in arr has "a.b.c"
          : isPathAvailable<ARR, P & string> extends true
            ? isEveryCMDValid<PS1, PS2, PS3, ARR, R>
            : false
    : true

export type validOut<
  PS1 extends PluginNames,
  PS2 extends PluginNamesWithArgMaybe,
  PS3 extends PluginNamesWithoutArg,
  ARR extends unknown[],
  S,
  SS extends string[] = Split<S>
> =
  S extends isStringLiteral<S>
  ? S extends ''
    ? never
    : isEveryCMDValid<PS1, PS2, PS3, ARR, SS> extends true ? S : never
  : never

// * for test
// type posts = ({
//   tag: string[];
//   status: string;
//   created: {
//       date: Date;
//       hour: number;
//   };
// } | {
//   tag?: undefined;
//   status?: undefined;
//   created?: undefined;
// })[]
// type test1 = validOut<posts, 'tag-reverse()'>
// type test2 = validOut<posts, 'tag-b()'>
