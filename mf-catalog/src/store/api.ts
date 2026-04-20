import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';
import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  CartItem,
  Product,
  Order,
  GetProductsParams,
  GetProductsResponse,
  GetOrdersParams,
  GetOrdersResponse,
  CreateOrderRequest,
  CreateOrderResponse,
} from 'shared-types';

const baseUrl ='http://localhost:3001/api';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Cart', 'Products', 'Orders', 'Categories'],

  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    getCart: builder.query<CartItem[], void>({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),

    addToCart: builder.mutation<CartItem, Omit<CartItem, 'id'>>({
      query: (item) => ({
        url: '/cart',
        method: 'POST',
        body: item,
      }),
      invalidatesTags: ['Cart'],
    }),

    updateCartItem: builder.mutation<
      CartItem,
      { id: string; quantity: number }
    >({
      query: ({ id, ...patch }) => ({
        url: `/cart/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Cart'],
    }),

    removeFromCart: builder.mutation<void, string>({
      query: (id) => ({
        url: `/cart/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    getProducts: builder.query<GetProductsResponse, GetProductsParams>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.categoryId)
          queryParams.append('categoryId', params.categoryId);
        if (params.search) queryParams.append('search', params.search);
        if (params.page)
          queryParams.append('page', params.page.toString());
        if (params.limit)
          queryParams.append('limit', params.limit.toString());

        const queryString = queryParams.toString();

        return {
          url: queryString ? `/products?${queryString}` : '/products',
        };
      },
      providesTags: ['Products'],
    }),

    getOrders: builder.query<GetOrdersResponse, GetOrdersParams>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        if (params.status)
          queryParams.append('status', params.status);
        if (params.page)
          queryParams.append('page', params.page.toString());
        if (params.limit)
          queryParams.append('limit', params.limit.toString());

        const queryString = queryParams.toString();

        return {
          url: queryString ? `/orders?${queryString}` : '/orders',
        };
      },
      providesTags: ['Orders'],
    }),

    getProductById: builder.query<Product, string>({
      query: (productId) => `/products/${productId}`,
      providesTags: (result, error, productId) => [
        { type: 'Products', id: productId },
      ],
    }),

    getOrderById: builder.query<Order, string>({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: (result, error, orderId) => [
        { type: 'Orders', id: orderId },
      ],
    }),

    createOrder: builder.mutation<
      CreateOrderResponse,
      CreateOrderRequest
    >({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Orders', 'Cart'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
} = api;