/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, UseMutationResult, useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";

type BaseFn = (...args: any[]) => unknown;
type FirstParameter<TFn extends BaseFn> = Parameters<TFn>[0] extends undefined ? void : Parameters<TFn>[0];

type Procedure<TFn = BaseFn> = {
  /**
   * @deprecated - internal use only
   */
  _def: TFn;
};

type QueryProcedure<
  TParams extends Record<string, unknown> | void = void,
  TData = unknown,
  TError = Error,
  TFn = BaseFn,
> = Procedure<TFn> & {
  useQuery: (
    input: TParams,
    options?: Omit<UseQueryOptions<TData, TError, TData>, "queryKey" | "queryFn">,
  ) => UseQueryResult<TData, TError>;
  invalidate: (input: TParams) => void;
  getQueryKey: (input: TParams) => any[];
  /**
   * @deprecated - internal use only
   */
  _key?: string;
  /**
   * @deprecated - internal use only
   */
  _parent?: any;
};

type MutationProcedure<
  TParams extends Record<string, unknown> | void = void,
  TData = unknown,
  TError = Error,
  TFn = BaseFn,
> = Procedure<TFn> & {
  useMutation: (
    options?: Omit<UseQueryOptions<TData, TError, TData>, "queryKey" | "queryFn">,
  ) => UseMutationResult<TData, unknown, TParams, unknown>;
};

type MakeProcedure<
  TType extends "query" | "mutation",
  TParams extends Record<string, unknown> | void = void,
  TData = unknown,
  TFn extends BaseFn = BaseFn,
> = TType extends "query" ? QueryProcedure<TParams, TData, Error, TFn> : MutationProcedure<TParams, TData, Error, TFn>;

type MakeQueryProcedure<TFn extends BaseFn> = MakeProcedure<
  "query",
  FirstParameter<TFn>,
  Awaited<ReturnType<TFn>>,
  TFn
>;
type MakeMutationProcedure<TFn extends BaseFn> = MakeProcedure<
  "mutation",
  FirstParameter<TFn>,
  Awaited<ReturnType<TFn>>,
  TFn
>;

export const procedure = {
  query<TFn extends BaseFn>(fn: TFn): MakeQueryProcedure<TFn> {
    return {
      useQuery(input: FirstParameter<TFn>, options: any) {
        const keys = this.getQueryKey(input);
        return useQuery(keys, () => fn(input), options);
      },
      invalidate(input: unknown) {
        const keys = this.getQueryKey(input);
        console.log("invalidate query", keys);
      },
      getQueryKey(input: unknown) {
        return [input];
      },
      _def: fn,
    } as any;
  },
  mutation<TFn extends BaseFn>(fn: TFn): MakeMutationProcedure<TFn> {
    return {
      useMutation(options: any) {
        const rawFn = fn as any;
        return useMutation((variables) => rawFn(variables), options);
      },
      _def: fn,
    } as any;
  },
};

type Config<T> = {
  [K in keyof T]: T[K];
};

type Router = {
  getQueryKey: () => any[];
  invalidate: () => void;
  createCaller: () => any;
  _parent?: any;
};

type RouteCallers<T> = {
  [K in keyof T]: T[K] extends Procedure<any> ? T[K]["_def"] : RouteCallers<T[K]>;
};

export const createRouter = <T>(
  config: Config<T>,
): T & {
  createCaller(): RouteCallers<T>;
  getQueryKeys(): any[];
  invalidate(): void;
} => {
  const keys = Object.keys(config);
  keys.forEach((key) => {
    const proc = config[key as keyof T] as Router | QueryProcedure | MutationProcedure;
    if ("useQuery" in proc) {
      // query procedure
      proc.getQueryKey = function getQueryKey(input: unknown) {
        console.log(">>>", proc);
        if (proc._parent && proc._parent.getQueryKey) {
          const parentKey = proc._parent.getQueryKey();
          return [...parentKey, key, input];
        }
        return [key, input];
      };
      proc._parent = config;
    } else if ("useMutation" in proc) {
      // mutation procedure
    } else if (typeof proc === "object" && proc !== null) {
      // router
      const router = proc;
      router.getQueryKey = function getQueryKey() {
        // router of router
        if (router._parent && router._parent.getQueryKey) {
          const parentKey = router._parent.getQueryKey();
          return [...parentKey, key];
        }
        return [key];
      };
      router._parent = config;
    }
  });
  return {
    ...config,
    invalidate() {
      const routerKeys = this.getQueryKey();
      console.log("invalidate", routerKeys);
    },
    createCaller: function createCaller() {
      const routerKeys = Object.keys(config);
      return routerKeys.reduce((acc, routerKey) => {
        const routerOrProcedure: any = config[routerKey as keyof typeof config];
        if ("_def" in routerOrProcedure) {
          acc[routerKey] = routerOrProcedure._def;
        } else {
          acc[routerKey] = routerOrProcedure.createCaller();
        }
        return acc;
      }, {} as Record<string, any>) as T;
    } as any,
  } as any;
};
