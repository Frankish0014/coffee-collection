import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products } from "@/data/products";
import type { CartItem, Side } from "@/types/product";

type InfoPanel = "about" | "contact" | null;

interface ShopState {
  focusedId: string | null;
  /** Most recently focused product; anchors the rack's stagger animations. */
  lastFocusedId: string;
  /** 1 = moving forward through the collection, -1 = backward. */
  direction: 1 | -1;
  side: Side;
  colorByProduct: Record<string, string>;
  drawerOpen: boolean;
  cartOpen: boolean;
  info: InfoPanel;
  cart: CartItem[];

  focus: (id: string) => void;
  unfocus: () => void;
  next: () => void;
  prev: () => void;
  setSide: (side: Side) => void;
  setColor: (productId: string, colorId: string) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  openCart: () => void;
  closeCart: () => void;
  openInfo: (panel: Exclude<InfoPanel, null>) => void;
  closeInfo: () => void;
  addToCart: (item: Omit<CartItem, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeFromCart: (key: string) => void;
  /** Closes the top-most overlay. Returns false if nothing was open. */
  dismissTop: () => boolean;
}

const step = (id: string | null, delta: number) => {
  const index = products.findIndex((p) => p.id === id);
  const nextIndex = (index + delta + products.length) % products.length;
  return products[nextIndex].id;
};

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      focusedId: null,
      lastFocusedId: products[0].id,
      direction: 1,
      side: "front",
      colorByProduct: {},
      drawerOpen: false,
      cartOpen: false,
      info: null,
      cart: [],

      focus: (id) => set({ focusedId: id, lastFocusedId: id, side: "front", direction: 1 }),
      unfocus: () => set({ focusedId: null, drawerOpen: false }),
      next: () =>
        set((s) => {
          const id = step(s.focusedId, 1);
          return { focusedId: id, lastFocusedId: id, direction: 1 };
        }),
      prev: () =>
        set((s) => {
          const id = step(s.focusedId, -1);
          return { focusedId: id, lastFocusedId: id, direction: -1 };
        }),
      setSide: (side) => set({ side }),
      setColor: (productId, colorId) =>
        set((s) => ({ colorByProduct: { ...s.colorByProduct, [productId]: colorId } })),

      openDrawer: () => set({ drawerOpen: true, cartOpen: false }),
      closeDrawer: () => set({ drawerOpen: false }),
      openCart: () => set({ cartOpen: true, drawerOpen: false, info: null }),
      closeCart: () => set({ cartOpen: false }),
      openInfo: (info) => set({ info, cartOpen: false, drawerOpen: false }),
      closeInfo: () => set({ info: null }),

      addToCart: (item) =>
        set((s) => {
          const key = `${item.productId}:${item.colorId}:${item.size}`;
          const existing = s.cart.find((c) => c.key === key);
          if (existing) {
            return {
              cart: s.cart.map((c) =>
                c.key === key ? { ...c, quantity: c.quantity + item.quantity } : c,
              ),
            };
          }
          return { cart: [...s.cart, { ...item, key }] };
        }),
      setQuantity: (key, quantity) =>
        set((s) => ({
          cart:
            quantity <= 0
              ? s.cart.filter((c) => c.key !== key)
              : s.cart.map((c) => (c.key === key ? { ...c, quantity } : c)),
        })),
      removeFromCart: (key) => set((s) => ({ cart: s.cart.filter((c) => c.key !== key) })),

      dismissTop: () => {
        const s = get();
        if (s.drawerOpen) set({ drawerOpen: false });
        else if (s.cartOpen) set({ cartOpen: false });
        else if (s.info) set({ info: null });
        else if (s.focusedId) set({ focusedId: null });
        else return false;
        return true;
      },
    }),
    {
      name: "itsus-cart",
      partialize: (s) => ({ cart: s.cart }),
      skipHydration: true,
    },
  ),
);

export const selectCartCount = (s: ShopState) =>
  s.cart.reduce((sum, item) => sum + item.quantity, 0);

export const getColorId = (s: ShopState, productId: string) => {
  const product = products.find((p) => p.id === productId);
  return s.colorByProduct[productId] ?? product?.colors[0].id ?? "";
};
