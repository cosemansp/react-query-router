import { createRouter } from "../router";
import articles from "./articles";

/**
 * Usages
 *
 * import api from "./api";
 *
 * const { data } = api.articles.getAll();
 * const { data, isLoading, error } = api.articles.getById(1);
 * const { mutate, data } = api.articles.update({ name: "foo" });
 *
 * api.articles.getall.invalidate();
 * api.articles.invalidate();
 * const keys = api.articles.getAll.getQueryKeys();
 *
 * // for unit testing procedures
 * // the caller is a proxy object that calls the procedure directly
 * // without using react-query
 * const caller = api.createCaller();
 * caller.articles.getAll();
 * caller.articles.getById(1);
 */
const api = createRouter({
  articles,
});

export default api;
