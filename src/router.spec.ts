import { describe, test, expect, vi, beforeEach } from "vitest";
import { createRouter, procedure } from "./router";
import * as reactQuery from "@tanstack/react-query";

vi.mock("@tanstack/react-query");

const mockedReactQuery = vi.mocked(reactQuery, true);

const sampleRouter = createRouter({
  getAll: procedure.query(() => {
    // console.log("> getAll");
    return Promise.resolve("1");
  }),
  getById: procedure.query((id: number) => {
    // console.log("> getById", id);
    return Promise.resolve(1 + id);
  }),
  update: procedure.mutation((variables: { name: string }) => {
    // console.log("> update", variables);
    return Promise.resolve({ ...variables, id: 1 });
  }),
});

const api = createRouter({
  sample: sampleRouter,
});

const qweryWrapper: any = async (keys: any[], fn: any) => {
  return {
    data: await fn(),
    keys,
  };
};

const mutationWrapper: any = async (fn: any) => {
  return {
    mutate(arg: unknown) {
      return fn(arg);
    },
  };
};

describe("router", () => {
  describe("useQuery", () => {
    let queryClient: any;
    beforeEach(() => {
      queryClient = {
        invalidateQueries: vi.fn(),
      };
      mockedReactQuery.useQuery.mockClear();
      mockedReactQuery.useQuery.mockImplementation(qweryWrapper);
      mockedReactQuery.useMutation.mockImplementation(mutationWrapper);
      mockedReactQuery.useQueryClient.mockReturnValue(queryClient as any);
    });

    test("useQuery - no arg", async () => {
      const result: any = await api.sample.getAll.useQuery();
      expect(reactQuery.useQuery).toHaveBeenCalled();
      expect(result.data).toEqual("1");
      expect(result.keys).toEqual(["sample", "getAll"]);
    });

    test("useQuery - with arg", async () => {
      const result: any = await api.sample.getById.useQuery(1);
      expect(reactQuery.useQuery).toHaveBeenCalled();
      expect(result.data).toEqual(2);
      expect(result.keys).toEqual(["sample", "getById", 1]);
    });

    test("useMutation - with arg", async () => {
      const { mutate } = await api.sample.update.useMutation();
      const result = await mutate({ name: "test" });
      expect(reactQuery.useMutation).toHaveBeenCalled();
      expect(result).toEqual({ name: "test", id: 1 });
    });

    test("invalidate - no arg", async () => {
      api.sample.getAll.invalidate();
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith(["sample", "getAll"]);
    });

    test("invalidate - with arg", async () => {
      api.sample.getById.invalidate(1);
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith(["sample", "getById", 1]);
    });

    test("invalidate root", async () => {
      api.sample.invalidate();
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith(["sample"]);
    });

    test("getQueryKeys", () => {
      expect(api.sample.getById.getQueryKeys(1)).toEqual(["sample", "getById", 1]);
      expect(api.sample.getAll.getQueryKeys()).toEqual(["sample", "getAll"]);
      expect(api.sample.getQueryKeys()).toEqual(["sample"]);
    });
  });

  describe("createCaller", () => {
    test("getAll", async () => {
      const caller = sampleRouter.createCaller();
      const result = await caller.getAll();
      expect(result).toBe("1");
    });

    test("getById", async () => {
      const caller = sampleRouter.createCaller();
      const result = await caller.getById(1);
      expect(result).toBe(2);
    });

    test("mutation", async () => {
      const caller = sampleRouter.createCaller();
      const result = await caller.update({ name: "test" });
      expect(result).toEqual({ name: "test", id: 1 });
    });
  });
});
