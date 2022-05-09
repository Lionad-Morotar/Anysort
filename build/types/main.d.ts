import Sort from './sort';
import type { Anysort } from './type';
declare const _default: Anysort<{
    i: (sort: Sort) => Sort;
    is: (sort: Sort, arg: string) => Sort;
    nth: (sort: Sort, arg: string) => Sort;
    all: (sort: Sort, arg: string) => Sort;
    has: (sort: Sort, arg: string) => Sort;
    not: (sort: Sort, arg?: string) => Sort;
    len: (sort: Sort, arg: string) => Sort;
    get: (sort: Sort, arg: string) => Sort;
    reverse: (sort: Sort) => Sort;
    rand: (sort: Sort) => Sort;
    result: (sort: Sort) => Sort;
}>;
export default _default;
