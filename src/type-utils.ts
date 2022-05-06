/* eslint-disable */

import type { BuildInPluginNames, BuildInPluginNamesWithArgMaybe } from './build-in-plugins'

type BuildInPluginNamesWithoutArg = Exclude<BuildInPluginNames, BuildInPluginNamesWithArgMaybe>

/* Logic */

type Is<T extends true> = T
type Not<T extends false> = T

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

/* AnySort */

type AddParen<U> = U extends any ? `${U & string}()` : never
type AddParen_test = AddParen<'1'|'2'>

type isEveryCMDValid<T extends unknown[]> =
  T extends [infer P, ...infer R]
    ? P extends ''
      ? false
      : P extends `${infer Name}()`
        ? Name extends BuildInPluginNamesWithoutArg
          ? isEveryCMDValid<R>
          : false
        : P extends `${infer Name}(${infer Arg})`
          ? Name extends BuildInPluginNamesWithArgMaybe
            ? isEveryCMDValid<R>
            : false
          // not a build-in-plugin,
          // it's properties such as "a.b.c",
          // so return true as default
          : isEveryCMDValid<R>
    : true
type isEveryCMDValid_test = [
  Is<isEveryCMDValid<['reverse()']>>,
  Not<isEveryCMDValid<['reverse(arg)']>>,
  Is<isEveryCMDValid<Split<'reverse()-i()'>>>,
  Not<isEveryCMDValid<Split<'unknownPlugin()'>>>,
  Is<isEveryCMDValid<Split<'a'>>>,
  Is<isEveryCMDValid<Split<'a-reverse()-i()'>>>,
  Not<isEveryCMDValid<Split<'a-reverse(arg)'>>>,
  Is<isEveryCMDValid<Split<'a-is(arg)'>>>,
  Not<isEveryCMDValid<Split<'a--is(1)'>>>,
]

export type isValidCMD<S, SS extends string[] = Split<S>> =
  S extends isStringLiteral<S>
  ? S extends ''
    ? never
    : isEveryCMDValid<SS> extends true ? S : never
  : never
type isValidCMD_test1 = isValidCMD<'a.b'>                             // a.b
type isValidCMD_test2 = isValidCMD<'a.b-reverse()-reverse()'>         // a.b-reverse()-reverse()
type isValidCMD_test3 = isValidCMD<'a.b-unknownPlugin()-reverse()'>   // never
type isValidCMD_test4 = isValidCMD<'a.b-reverse(arg)'>                // never
type isValidCMD_test5 = isValidCMD<'a.b-is(3)'>                       // a.b-is(3)
type isValidCMD_test6 = isValidCMD<'a.b--is(3)'>                      // never
type isValidCMD_test7 = isValidCMD<'date--reverse()'>                 // never
