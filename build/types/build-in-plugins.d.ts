import Sort from './sort';
import type { SortVal, ComparableValue } from './type';
declare const plugins: {
    i: (sort: Sort) => Sort;
    is: (sort: Sort, arg: string) => Sort;
    nth: (sort: Sort, arg: string) => Sort;
    all: (sort: Sort, arg: string) => Sort;
    has: (sort: Sort, arg: string) => Sort;
    not: (sort: Sort, arg: string) => Sort;
    len: (sort: Sort, arg: string) => Sort;
    get: (sort: Sort, arg: string) => Sort;
    reverse: (sort: Sort) => Sort;
    rand: (sort: Sort) => Sort;
    result: (sort: Sort) => Sort;
};
declare type PluginsLiteralTypes = {
    [K in keyof typeof plugins]: typeof plugins[K];
};
declare type PluginsCallMaybeWithArg = {
    [K in keyof PluginsLiteralTypes as PluginsLiteralTypes[K] extends (_: any) => any ? never : K]: any;
};
export declare type BuildInPluginNames = keyof typeof plugins;
export declare type BuildInPluginNamesWithArgMaybe = keyof PluginsCallMaybeWithArg;
export declare type MappingFn = (x: unknown) => ComparableValue;
export declare type ResultFn = (x: SortVal) => SortVal;
declare const _default: Readonly<Record<"i" | "is" | "nth" | "all" | "has" | "not" | "len" | "get" | "reverse" | "rand" | "result", import("./type").SortPlugin>>;
export default _default;
