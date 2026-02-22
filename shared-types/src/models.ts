import { OrderStatus, UserRole, ProductCategory } from './enums';

// Пользователь
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

// Продукт
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  categoryName: string;
  categoryKey: ProductCategory;
  inStock: boolean;
  weight?: string; // "500г", "1кг"
}

// Категория
export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  key: ProductCategory;
}

// Элемент корзины (клиентская сущность)
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  price: number;
  quantity: number;
  weight?: string;
}

// Заказ
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress: string;
  status: OrderStatus;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

// Элемент заказа
export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  weight?: string;
}

// Адрес доставки
export interface DeliveryAddress {
  id: string;
  userId: string;
  address: string;
  isDefault: boolean;
}