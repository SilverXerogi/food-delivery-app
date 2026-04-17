// src/stores/productStore.ts
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import { Product, GetProductsParams } from 'shared-types';
import { catalogApi } from '../api/catalog';
import { RootStore } from './index';

export class ProductStore {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = false;
  error: string | null = null;
  search = '';
  category: string | null = null;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);

    reaction(
      () => [this.search, this.category],
      () => this.applyFilters()
    );
  }

  async loadProducts(params?: GetProductsParams) {
    this.loading = true;
    this.error = null;
    try {
      const res = await catalogApi.getProducts(params || {});
      runInAction(() => {
        this.products = res.items;
        this.applyFilters();
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Ошибка загрузки';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  setSearch(search: string) {
    this.search = search;
  }

  setCategory(category: string | null) {
    this.category = category;
  }

  private applyFilters() {
    this.filteredProducts = this.products.filter(p => {
      const matchesSearch = !this.search ||
        p.name.toLowerCase().includes(this.search.toLowerCase()) ||
        p.description.toLowerCase().includes(this.search.toLowerCase());
      const matchesCat = !this.category || p.categoryId === this.category;
      return matchesSearch && matchesCat;
    });
  }

  get categories() {
    const map = new Map<string, string>();
    this.products.forEach(p => map.set(p.categoryId, p.categoryName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }
}