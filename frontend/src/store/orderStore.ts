import { makeAutoObservable, runInAction } from 'mobx';
import { Order, GetOrdersParams, GetOrdersResponse } from 'shared-types';
import { cabinetApi } from '../api/cabinet'; // Предполагается, что API для заказов находится там
import { RootStore } from './index'; // Ссылка на RootStore, если нужно

export class OrderStore {
  orders: Order[] = [];
  loading = false;
  error: string | null = null;

  constructor(private rootStore: RootStore | null = null) {
    makeAutoObservable(this);
  }

  // Вычисляемое значение: количество заказов
  get orderCount() {
    return this.orders.length;
  }

  // Асинхронный метод для загрузки заказов
  async loadOrders(params?: GetOrdersParams) {
    this.loading = true;
    this.error = null;

    try {
      const response: GetOrdersResponse = await cabinetApi.getOrders();
      runInAction(() => {
        this.orders = response.items;
        this.loading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Ошибка загрузки заказов';
        this.loading = false;
      });
    }
  }

  // Метод для получения конкретного заказа по ID (опционально)
  async getOrderById(id: string) {
    this.loading = true;
    this.error = null;

    try {
      const response = await cabinetApi.getOrderById(id);
      runInAction(() => {
        // Найти и обновить конкретный заказ в списке или добавить его
        const index = this.orders.findIndex(order => order.id === id);
        if (index !== -1) {
          this.orders[index] = response;
        } else {
          this.orders.push(response);
        }
        this.loading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Ошибка загрузки заказа';
        this.loading = false;
      });
    }
  }

  // Метод для добавления нового заказа в список (например, после создания)
  addOrder(order: Order) {
    runInAction(() => {
      this.orders.unshift(order); // Добавляем в начало списка
    });
  }

  // Метод для очистки ошибки
  clearError() {
    runInAction(() => {
      this.error = null;
    });
  }

  // Метод для очистки списка заказов
  clearOrders() {
    runInAction(() => {
      this.orders = [];
    });
  }
}