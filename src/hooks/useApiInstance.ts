import { FetchOptions, ofetch } from "ofetch";
import { useConfig } from "../hooks";
import useAuth from "./useAuth";

export const useApiInstance = () => {
  const config = useConfig();
  const { getToken } = useAuth();
  const fetch = ofetch.create({
    baseURL: config.API_BASE_URL,
    async onRequest({ options }) {
      const token = await getToken();
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `bearer ${token}`,
        };
      }
    },
    async onResponseError({ request, options, response }) {
      // Log error
      console.error("[fetch response error]", request, response.status, response.body);
      //
      // add here your toaster or other error notification system
      //
    },
  });
  // simple api wrapper for easy access of the http methods
  return {
    get<TData>(url: string, options: Omit<FetchOptions<"json">, "method" | "body"> = {}) {
      return fetch<TData>(url, options);
    },
    put<TData = unknown>(
      url: string,
      body: Record<string, any>,
      options: Omit<FetchOptions<"json">, "method" | "body"> = {},
    ) {
      // console.log("put", url, body, options);
      return fetch<TData>(url, { ...options, method: "PUT", body });
    },
    post<TData = unknown>(
      url: string,
      body: Record<string, any>,
      options: Omit<FetchOptions<"json">, "method" | "body"> = {},
    ) {
      // console.log("post", url, body, options);
      return fetch<TData>(url, { ...options, method: "POST", body });
    },
    delete<TData = unknown>(url: string, options: Omit<FetchOptions<"json">, "method" | "body"> = {}) {
      return fetch<TData>(url, { ...options, method: "DELETE" });
    },
    // for all other methods
    fetch<TData>(request: RequestInfo, options?: FetchOptions<"json">) {
      return fetch<TData>(request, options);
    },
  };
};

export type ApiInstance = ReturnType<typeof useApiInstance>;
