import Sort from './sort';
import type { BuildInPluginNames } from './build-in-plugins';
import type { validOut } from './type-utils';
export declare type SortableValue = unknown;
export declare type SortVal = 1 | 0 | -1;
export declare type SortFn = (a: SortableValue, b: SortableValue) => SortVal | undefined;
export declare type ComparableValue = string | number | boolean | null;
export declare type SortableTypeEnum = 'string' | 'number' | 'boolean' | 'symbol' | 'function' | 'void' | 'date';
declare type MappingPlugin = (sort: Sort, arg?: string) => Sort;
declare type ResultPlugin = (sort: Sort) => Sort;
export declare type SortPlugin = MappingPlugin | ResultPlugin;
export declare type Plugins = Readonly<Record<BuildInPluginNames, SortPlugin>>;
export declare type SortStringCMD<ARR extends unknown[], CMD> = CMD extends validOut<ARR, CMD> ? CMD : never;
export declare type SortCMD<ARR extends unknown[], CMD> = CMD extends validOut<ARR, CMD> ? (SortStringCMD<ARR, CMD> | SortFn) : never;
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
declare type AnysortFactory = {
    <ARR extends unknown[], CMD>(arr: ARR, args: SortCMD<ARR, CMD>[]): ARR;
    <ARR extends unknown[], CMD>(arr: ARR, ...args: SortCMD<ARR, CMD>[]): ARR;
};
export declare type Anysort = AnysortFactory & {
    extends: (exts: Plugins) => void;
    /** internal fns */
    wrap: <ARR extends any[]>(arr: ARR) => ARR;
    config: AnysortConfiguration;
};
export {};
