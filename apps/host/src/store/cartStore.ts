import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem as CartItemType, Product } from 'shared-types';

interface CartState {
  items: CartItemType[];
  addItem: (product: Product, quantity?: number) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.productId === product.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                id: crypto.randomUUID(),
                productId: product.id,
                productName: product.name,
                productImageUrl: product.imageUrl,
                price: product.price,
                quantity,
                weight: product.weight,
              },
            ],
          };
        }),
      updateItemQuantity: (id, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((item) => item.id !== id)
            : state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getTotalAmount: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);
