import { store } from "./store";
import { restoreAuth } from "./authSlice";

const STORAGE_KEY = "auth";

export const saveAuth = (auth: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
};

export const loadAuth = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const initAuth = () => {
  const data = loadAuth();
  if (data) {
    store.dispatch(restoreAuth(data));
  }
};