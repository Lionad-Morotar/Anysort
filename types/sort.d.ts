import type { SortFn, SortPlugin } from './type';
import type { MappingFn, ResultFn } from './build-in-plugins';
export default class Sort {
    pipeline: ({
        _type: 'maping';
        _value: MappingFn;
    } | {
        _type: 'result';
        _value: ResultFn;
    })[];
    constructor();
    register(plugin: SortPlugin, arg: string): void;
    /**
     * its not same as Array.prototype.map in js,
     * but more like map value a to value b,
     * array.sort((a, b) => a - b) then becames:
     * array.sort((a, b) => map(a) - map(b))
     */
    map(_value: MappingFn): Sort;
    /**
     * becareful, the result plugin should be
     * the last one in this.pipeline
     */
    result(_value: ResultFn): Sort;
    seal(): SortFn;
}
