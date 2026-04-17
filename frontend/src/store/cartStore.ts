// src/stores/cartStore.ts
import { makeAutoObservable, runInAction } from 'mobx';
import { CartItem, Product } from 'shared-types';
import { cabinetApi } from '../api/cabinet';
import { RootStore } from './index';

export class CartStore {
  items: CartItem[] = [];
  loading = false;
  error: string | null = null;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  get totalItems() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get totalAmount() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get isEmpty() {
    return this.items.length === 0;
  }

  addItem(product: Product, quantity: number = 1) {
    const existing = this.items.find(item => item.productId === product.id);
    if (existing) {
      runInAction(() => {
        existing.quantity += quantity;
      });
    } else {
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        productImageUrl: product.imageUrl,
        price: product.price,
        quantity,
        weight: product.weight,
      };
      runInAction(() => {
        this.items.push(newItem);
      });
    }
    this.saveToStorage();
  }

  updateItemQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(id);
      return;
    }
    const item = this.items.find(i => i.id === id);
    if (item) {
      runInAction(() => {
        item.quantity = quantity;
      });
      this.saveToStorage();
    }
  }

  removeItem(id: string) {
    runInAction(() => {
      this.items = this.items.filter(item => item.id !== id);
    });
    this.saveToStorage();
  }

  clear() {
    runInAction(() => {
      this.items = [];
    });
    this.saveToStorage();
  }

  async createOrder(deliveryAddress: string, comment: string = '') {
    if (this.isEmpty) throw new Error('Корзина пуста');

    this.loading = true;
    this.error = null;
    try {
      await cabinetApi.createOrder({
        deliveryAddress,
        comment,
        items: this.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      runInAction(() => {
        this.clear();
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Ошибка создания заказа';
      });
      throw error;
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  private saveToStorage() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  private loadFromStorage() {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        const items: CartItem[] = JSON.parse(saved);
        runInAction(() => {
          this.items = items;
        });
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    }
  }
}