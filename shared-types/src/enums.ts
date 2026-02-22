// Статусы заказа
export type OrderStatus =
  | 'pending'      // В обработке
  | 'confirmed'    // Подтверждён
  | 'preparing'    // Готовится
  | 'delivering'   // В пути
  | 'delivered'    // Доставлен
  | 'cancelled';   // Отменён

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'В обработке',
  confirmed: 'Подтверждён',
  preparing: 'Готовится',
  delivering: 'В пути',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

// Роли пользователей
export type UserRole = 'customer' | 'admin';

// Категории продуктов
export type ProductCategory =
  | 'vegetables'
  | 'fruits'
  | 'dairy'
  | 'meat'
  | 'bakery'
  | 'beverages'
  | 'snacks'
  | 'other';