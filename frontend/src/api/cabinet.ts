import type { CreateOrderRequest, CreateOrderResponse, GetOrdersResponse, Order, UpdateProfileRequest, User } from 'shared-types';
import apiClient from './client';

export const cabinetApi = {
  getProfile: (): Promise<User> =>
    apiClient.get<User>('/cabinet/profile').then((res) => res.data),

  updateProfile: (payload: UpdateProfileRequest): Promise<User> =>
    apiClient.patch<User>('/cabinet/profile', payload).then((res) => res.data),

  getOrders: (): Promise<GetOrdersResponse> =>
    apiClient.get<GetOrdersResponse>('/cabinet/orders').then((res) => res.data),

  getOrderById: (id: string): Promise<Order> =>
    apiClient.get<Order>(`/cabinet/orders/${id}`).then((res) => res.data),

  createOrder: (payload: CreateOrderRequest): Promise<CreateOrderResponse> =>
    apiClient.post<CreateOrderResponse>('/cabinet/orders', payload).then((res) => res.data),
};
