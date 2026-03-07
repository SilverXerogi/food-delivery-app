import type { GetProductsParams, GetProductsResponse, Product } from 'shared-types';
import apiClient from './client';

export const catalogApi = {
  getProducts: (params?: GetProductsParams): Promise<GetProductsResponse> =>
    apiClient.get<GetProductsResponse>('/products', { params }).then((res) => res.data),

  getProductById: (id: string): Promise<Product> =>
    apiClient.get<Product>(`/products/${id}`).then((res) => res.data),
};
