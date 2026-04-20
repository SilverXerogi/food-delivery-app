import { apiClient } from "./client";
import type { LoginRequest, LoginResponse, RegisterRequest, User } from "shared-types";

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiClient.post("/auth/login", data).then((r) => r.data),

  register: (data: RegisterRequest): Promise<LoginResponse> =>
    apiClient.post("/auth/register", data).then((r) => r.data),

  logout: () =>
    apiClient.post("/auth/logout").then((r) => r.data),

  me: (): Promise<User> =>
    apiClient.get("/auth/me").then((r) => r.data),
};