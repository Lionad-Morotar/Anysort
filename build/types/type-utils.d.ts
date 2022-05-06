import type { BuildInPluginNames, BuildInPluginNamesWithArgMaybe } from './build-in-plugins';
declare type BuildInPluginNamesWithoutArg = Exclude<BuildInPluginNames, BuildInPluginNamesWithArgMaybe>;
declare type isStringLiteral<S> = S extends string ? string extends S ? never : S : never;
declare type Split<S, Delim extends string = '-', Res extends string[] = []> = S extends `${infer L}${Delim}${infer R}` ? Split<R, Delim, [...Res, L]> : S extends isStringLiteral<S> ? [...Res, S] : Res;
declare type isEveryCMDValid<T extends unknown[]> = T extends [infer P, ...infer R] ? P extends '' ? false : P extends `${infer Name}()` ? Name extends BuildInPluginNamesWithoutArg ? isEveryCMDValid<R> : false : P extends `${infer Name}(${infer Arg})` ? Name extends BuildInPluginNamesWithArgMaybe ? isEveryCMDValid<R> : false : isEveryCMDValid<R> : true;
export declare type isValidCMD<S, SS extends string[] = Split<S>> = S extends isStringLiteral<S> ? S extends '' ? never : isEveryCMDValid<SS> extends true ? S : never : never;
export {};
