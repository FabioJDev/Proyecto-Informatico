import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { productId, name, price, sellerId, quantity }

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                name: product.name,
                price: parseFloat(product.price),
                sellerId: product.sellerId,
                images: product.images,
                quantity,
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return get().removeItem(productId);
        set((state) => ({
          items: state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getTotalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'marketplace-cart',
    }
  )
);
