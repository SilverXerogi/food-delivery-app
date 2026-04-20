import { apiClient } from "./client";
import type {
  User,
  GetOrdersResponse,
  Order,
  UpdateProfileRequest,
  CreateOrderRequest,
  CreateOrderResponse,
} from "shared-types";

export const cabinetApi = {
  getProfile: (): Promise<User> =>
    apiClient.get("/cabinet/profile").then((r) => r.data),

  updateProfile: (data: UpdateProfileRequest): Promise<User> =>
    apiClient.patch("/cabinet/profile", data).then((r) => r.data),

  getOrders: (): Promise<GetOrdersResponse> =>
    apiClient.get("/cabinet/orders").then((r) => r.data),

  getOrderById: (id: string): Promise<Order> =>
    apiClient.get(`/cabinet/orders/${id}`).then((r) => r.data),

  createOrder: (data: CreateOrderRequest): Promise<CreateOrderResponse> =>
    apiClient.post("/cabinet/orders", data).then((r) => r.data),
};