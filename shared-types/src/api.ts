import type { User, Product, Order, CartItem } from './models';
import type { OrderStatus } from './enums';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface GetProductsParams {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetProductsResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartResponse {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  deliveryAddress: string;
  comment?: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderResponse {
  order: Order;
}

export interface GetOrdersParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export interface GetOrdersResponse {
  items: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}
