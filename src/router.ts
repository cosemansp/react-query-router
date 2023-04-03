import {
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

type BaseFn = (...args: any[]) => unknown;
type FirstParameter<TFn extends BaseFn> = Parameters<TFn>[0] extends undefined ? void : Parameters<TFn>[0];

type Procedure<TFn = BaseFn> = {
  /**
   * @deprecated - internal use only
   */
  _queryFn: TFn;
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
  getQueryKeys: (input: TParams) => any[];
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
        const keys = this.getQueryKeys(input);
        return useQuery(keys, () => fn(input), options);
      },
      invalidate(input: unknown) {
        const queryClient = useQueryClient();
        if (queryClient) {
          const keys = this.getQueryKeys(input);
          queryClient.invalidateQueries(keys);
        }
      },
      getQueryKeys(input: unknown) {
        return [input];
      },
      _queryFn: fn,
    } as any;
  },
  mutation<TFn extends BaseFn>(fn: TFn): MakeMutationProcedure<TFn> {
    return {
      useMutation(options: any) {
        const mutationFn = fn as any;
        return useMutation((variables) => mutationFn(variables), options);
      },
      _queryFn: fn,
    } as any;
  },
};

type Config<T> = {
  [K in keyof T]: T[K];
};

type Router<T> = Config<T> & {
  createCaller(): RouteCallers<T>;
  getQueryKeys(): any[];
  invalidate(): void;
};

type RouteCallers<T> = {
  [K in keyof T]: T[K] extends Procedure<any> ? T[K]["_queryFn"] : RouteCallers<T[K]>;
};

export const createRouter = <T>(config: Config<T>): Router<T> => {
  const router = config as Router<T>;
  const keys = Object.keys(router);
  keys.forEach((key) => {
    const procOrRouter = router[key as keyof T] as Router<any> | QueryProcedure | MutationProcedure;
    if ("useQuery" in procOrRouter) {
      // query procedure
      procOrRouter.getQueryKeys = function getQueryKeys(input: unknown) {
        if (router.getQueryKeys) {
          const parentKey = router.getQueryKeys();
          return [...parentKey, key, input].filter(Boolean);
        }
        return [key, input].filter(Boolean);
      };
    } else if ("useMutation" in procOrRouter) {
      // mutation procedure
    } else if (typeof procOrRouter === "object" && procOrRouter !== null) {
      // router
      procOrRouter.getQueryKeys = function getQueryKeys() {
        return [key];
      };
    }
  });
  router.invalidate = function () {
    const queryClient = useQueryClient();
    if (queryClient) {
      const keys = this.getQueryKeys();
      queryClient.invalidateQueries(keys);
    }
  };
  router.createCaller = function () {
    const routerKeys = Object.keys(config);
    return routerKeys.reduce((acc, routerKey) => {
      const routerOrProcedure: any = config[routerKey as keyof typeof config];
      if ("_queryFn" in routerOrProcedure) {
        // procedure
        acc[routerKey] = routerOrProcedure._queryFn;
      } else if (typeof routerOrProcedure === "object" && routerOrProcedure !== null) {
        // router
        acc[routerKey] = routerOrProcedure.createCaller();
      } else {
        // helper function
      }
      return acc;
    }, {} as Record<string, any>) as T;
  };
  return router;
};
