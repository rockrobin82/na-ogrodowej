"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/database";

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (seedPackageId: string) => void;
  updateQuantity: (seedPackageId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.seedPackageId === item.seedPackageId
          );
          if (existing) {
            const newQty = Math.min(
              existing.quantity + quantity,
              item.maxAvailable
            );
            return {
              items: state.items.map((i) =>
                i.seedPackageId === item.seedPackageId
                  ? { ...i, quantity: newQty }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity: Math.min(quantity, item.maxAvailable),
              },
            ],
          };
        });
      },
      removeItem: (seedPackageId) =>
        set((state) => ({
          items: state.items.filter((i) => i.seedPackageId !== seedPackageId),
        })),
      updateQuantity: (seedPackageId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.seedPackageId === seedPackageId
              ? { ...i, quantity: Math.min(Math.max(1, quantity), i.maxAvailable) }
              : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: "na-ogrodowej-cart" }
  )
);
