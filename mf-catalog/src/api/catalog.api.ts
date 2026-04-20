import { apiClient } from "./client";
import type { GetProductsParams, GetProductsResponse, Product } from "shared-types";

export const catalogApi = {
  getProducts: (params?: GetProductsParams): Promise<GetProductsResponse> =>
    apiClient.get("/products", { params }).then((r) => r.data),

  getProductById: (id: string): Promise<Product> =>
    apiClient.get(`/products/${id}`).then((r) => r.data),
};