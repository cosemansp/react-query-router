import { ApiInstance } from "../../hooks";
import { createRouter, procedure } from "../../lib/router";
import { ProductDto, Product, ProductCreateDto, ProductUpdateDto } from "../types";

type ProductsPayload = {
  items: ProductDto[];
  total: number;
  pageSize: number;
  page: number;
};

const path = "/api/v1/products";

const mapProduct = (source: ProductDto): Product => {
  return {
    ...source,
    createdAt: new Date(source.createdAt),
    updatedAt: new Date(source.updatedAt),
  };
};

export const createProductRouter = (api: ApiInstance) => {
  return createRouter({
    getAll: procedure.query(
      async ({ page = 0, pageSize = 20, sortBy }: { page: number; pageSize: number; sortBy: string }) => {
        const data = await api.get<ProductsPayload>(path, {
          query: { page, pageSize, sortBy },
        });
        return {
          ...data,
          items: data.items.map(mapProduct),
        };
      },
    ),

    getById: procedure.query(async (id: string) => {
      const data = await api.get<ProductDto>(`${path}/${id}`);
      return mapProduct(data);
    }),

    addOrUpdate: procedure.mutation(async (product: ProductCreateDto | ProductUpdateDto) => {
      if ("id" in product && product.id) {
        const data = await api.put<ProductDto>(`${path}/${product.id}`, product);
        return mapProduct(data);
      }
      const data = await api.post<ProductDto>(`${path}`, product);
      return mapProduct(data);
    }),

    remove: procedure.mutation(async (id: string) => {
      const data = await api.delete<ProductDto>(`${path}/${id}`);
      return mapProduct(data);
    }),
  });
};
