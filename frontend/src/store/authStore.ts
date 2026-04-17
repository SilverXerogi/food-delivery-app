// src/stores/authStore.ts
import { makeAutoObservable, runInAction } from 'mobx';
import { LoginRequest, LoginResponse, RegisterRequest, UpdateProfileRequest, User } from 'shared-types'; // Убедитесь, что типы импортированы
import { authApi } from '../api/auth'; // Для login, register
import { cabinetApi } from '../api/cabinet'; // Для loadProfile, updateProfile
import { RootStore } from './index';

export class AuthStore {
  user: User | null = null; // Используем конкретный тип User, а не any
  accessToken: string | null = null;
  refreshToken: string | null = null;
  loading = false;
  error: string | null = null;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }

  get isAuthenticated() {
    return !!this.user;
  }

  // Метод для входа
  async login(credentials: LoginRequest) {
    this.loading = true;
    this.error = null;
    try {
      const response: LoginResponse = await authApi.login(credentials);
      runInAction(() => {
        this.user = response.user;
        this.accessToken = response.accessToken;
        this.refreshToken = response.refreshToken;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Ошибка входа';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  // Метод для регистрации
  async register(userData: RegisterRequest) {
    this.loading = true;
    this.error = null;
    try {
      const response: LoginResponse = await authApi.register(userData);
      runInAction(() => {
        this.user = response.user;
        this.accessToken = response.accessToken;
        this.refreshToken = response.refreshToken;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Ошибка регистрации';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  // Метод для выхода
  logout() {
    runInAction(() => {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
    });
  }

  // Метод для загрузки профиля
  async loadProfile() {
    if (!this.accessToken) {
      this.error = 'Нет токена для загрузки профиля';
      return;
    }

    this.loading = true;
    this.error = null;
    try {
      const profile = await cabinetApi.getProfile(); // Предполагаем, что в cabinetApi есть такой метод
      runInAction(() => {
        // Обновляем только те поля, которые приходят с сервера
        // Не перезаписываем весь объект, а обновляем поля
        if (this.user) {
          Object.assign(this.user, profile);
        } else {
          this.user = profile;
        }
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Ошибка загрузки профиля';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  // Метод для обновления профиля
  async updateProfile(data: Partial<UpdateProfileRequest>) { // Используем Partial, если не все поля обязательны
    if (!this.user) {
      this.error = 'Пользователь не авторизован';
      return;
    }

    this.loading = true;
    this.error = null;
    try {
      const updatedProfile = await cabinetApi.updateProfile(data); // Предполагаем, что в cabinetApi есть такой метод
      runInAction(() => {
        // Обновляем только те поля, которые изменились
        Object.assign(this.user!, updatedProfile);
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.response?.data?.message || 'Ошибка обновления профиля';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}