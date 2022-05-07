import Sort from './sort';
import type { PluginNames, PluginNamesWithArgMaybe, PluginNamesWithoutArg } from './build-in-plugins';
import type { validOut } from './type-utils';
declare type P1 = PluginNames;
declare type P2 = PluginNamesWithArgMaybe;
declare type P3 = PluginNamesWithoutArg;
export declare type SortableValue = unknown;
export declare type SortVal = 1 | 0 | -1;
export declare type SortFn = (a: SortableValue, b: SortableValue) => SortVal | undefined;
export declare type ComparableValue = string | number | boolean | null;
export declare type SortableTypeEnum = 'string' | 'number' | 'boolean' | 'symbol' | 'function' | 'void' | 'date';
declare type MappingPlugin = (sort: Sort, arg?: string) => Sort;
declare type ResultPlugin = (sort: Sort) => Sort;
export declare type SortPlugin = MappingPlugin | ResultPlugin;
export declare type SortStringCMD<P1 extends PluginNames, P2 extends PluginNamesWithArgMaybe, P3 extends PluginNamesWithoutArg, ARR extends unknown[], CMD> = CMD extends validOut<P1, P2, P3, ARR, CMD> ? CMD : never;
export declare type SortCMD<P1 extends PluginNames, P2 extends PluginNamesWithArgMaybe, P3 extends PluginNamesWithoutArg, ARR extends unknown[], CMD> = CMD extends validOut<P1, P2, P3, ARR, CMD> ? (SortStringCMD<P1, P2, P3, ARR, CMD> | SortFn) : never;
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
declare type AnysortFactory<P1 extends PluginNames, P2 extends PluginNamesWithArgMaybe, P3 extends PluginNamesWithoutArg> = {
    <ARR extends unknown[], CMD>(arr: ARR, args: SortCMD<P1, P2, P3, ARR, CMD>[]): ARR;
    <ARR extends unknown[], CMD>(arr: ARR, ...args: SortCMD<P1, P2, P3, ARR, CMD>[]): ARR;
};
export declare type Anysort<P1 extends PluginNames, P2 extends PluginNamesWithArgMaybe, P3 extends PluginNamesWithoutArg> = AnysortFactory<P1, P2, P3> & {
    extends: <PluginName extends string>(exts: Record<PluginName, SortPlugin>) => Anysort<P1, P2, P3>;
    /** internal fns */
    wrap: <ARR extends any[]>(arr: ARR) => ARR;
    config: AnysortConfiguration;
};
export declare type BuildInAnysort = Anysort<P1, P2, P3>;
export {};
