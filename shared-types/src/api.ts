import { User, Product, Order, DeliveryAddress, CartItem, Category } from './models';
import { OrderStatus } from './enums';

// === Auth ===
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

// === Products ===
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

// === Cart ===
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

// === Orders ===
export interface CreateOrderRequest {
  deliveryAddress: string;
  comment?: string;
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

// === Profile ===
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface CreateAddressRequest {
  address: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  address?: string;
  isDefault?: boolean;
}