import Sort from './sort';
import type { PluginNames, PluginNamesWithArgMaybe, PluginNamesWithoutArg } from './build-in-plugins';
import type { RequiredArguments, validOut } from './type-utils';
declare type PS1 = PluginNames;
declare type PS2 = PluginNamesWithArgMaybe;
declare type PS3 = PluginNamesWithoutArg;
export declare type SortableValue = unknown;
export declare type SortVal = number;
export declare type ComparableValue = string | number | boolean | null;
export declare type SortableTypeEnum = 'string' | 'number' | 'boolean' | 'symbol' | 'function' | 'void' | 'date';
declare type MappingPlugin = (sort: Sort, arg?: string) => Sort;
declare type ResultPlugin = (sort: Sort) => Sort;
export declare type SortPlugin = MappingPlugin | ResultPlugin;
export declare type SortStringCMD<PS1, PS2, PS3, ARR extends unknown[], CMD> = CMD extends validOut<PS1, PS2, PS3, ARR, CMD> ? CMD : never;
export declare type SortFn<ARR extends SortableValue[] = unknown[]> = [
    ARR
] extends [(infer Item)[]] ? (a: Item, b: Item) => SortVal | undefined : never;
export declare type SortCMD<PS1, PS2, PS3, ARR extends unknown[], CMD> = SortStringCMD<PS1, PS2, PS3, ARR, CMD> | SortFn<ARR>;
export declare type AnysortConfiguration = {
    delim: string;
    readonly patched: string;
    autoWrap: boolean;
    autoSort: boolean;
    orders: Partial<Record<SortableTypeEnum, number> & {
        rest: number;
        object: number;
    }>;
};
export declare type ExtsPluginsLiteralTypes<T> = {
    [K in keyof T]: T[K];
};
export declare type ExtsPluginsCallMaybeWithArg<T> = {
    [K in keyof ExtsPluginsLiteralTypes<T> as RequiredArguments<ExtsPluginsLiteralTypes<T>[K]> extends (_: any) => any ? never : K]: any;
};
export declare type ExtsPluginNames<T> = Exclude<keyof T, never>;
export declare type ExtsPluginNamesWithArgMaybe<T> = Exclude<keyof ExtsPluginsCallMaybeWithArg<T>, never>;
export declare type ExtsPluginNamesWithoutArg<T> = Exclude<ExtsPluginNames<T>, ExtsPluginNamesWithArgMaybe<T>>;
export declare type AnySortWrapper<ARR> = ARR;
export declare type Anysort<PS1, PS2, PS3> = {
    <ARR extends unknown[], CMD>(arr: ARR, ...args: SortCMD<PS1, PS2, PS3, ARR, CMD>[]): AnySortWrapper<ARR>;
    extends: <U extends Record<string, SortPlugin>>(exts: U) => Anysort<PS1 | ExtsPluginNames<U>, PS2 | ExtsPluginNamesWithArgMaybe<U>, PS3 | ExtsPluginNamesWithoutArg<U>>;
    /** internal fns */
    wrap: <ARR extends any[]>(arr: ARR) => ARR;
    config: AnysortConfiguration;
};
export declare type BuildInAnysort = Anysort<PS1, PS2, PS3>;
export {};
