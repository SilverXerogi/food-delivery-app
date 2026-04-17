// src/stores/index.ts
import { createContext, useContext } from 'react';
import { AuthStore } from './authStore';
import { CartStore } from './cartStore';
import { ProductStore } from './productStore';
import { OrderStore } from './orderStore'; // Импортируем новый store

export class RootStore {
  authStore: AuthStore;
  cartStore: CartStore;
  productStore: ProductStore;
  orderStore: OrderStore; // Добавляем в RootStore

  constructor() {
    this.authStore = new AuthStore(this);
    this.cartStore = new CartStore(this);
    this.productStore = new ProductStore(this);
    this.orderStore = new OrderStore(this); // Создаем экземпляр
  }
}

export const rootStore = new RootStore();
export const StoreContext = createContext<RootStore>(rootStore);
export const useStore = () => useContext(StoreContext);