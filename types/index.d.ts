import anysort from './main';
export declare type Anysort = typeof anysort;
declare const _default: import("./type").Anysort<{
    i: (sort: import("./sort").default) => import("./sort").default;
    is: (sort: import("./sort").default, arg: string) => import("./sort").default;
    nth: (sort: import("./sort").default, arg: string) => import("./sort").default;
    all: (sort: import("./sort").default, arg: string) => import("./sort").default;
    has: (sort: import("./sort").default, arg: string) => import("./sort").default;
    not: (sort: import("./sort").default, arg?: string) => import("./sort").default;
    len: (sort: import("./sort").default, arg: string) => import("./sort").default;
    get: (sort: import("./sort").default, arg: string) => import("./sort").default;
    reverse: (sort: import("./sort").default) => import("./sort").default;
    rand: (sort: import("./sort").default) => import("./sort").default;
    result: (sort: import("./sort").default) => import("./sort").default;
}>;
export default _default;
