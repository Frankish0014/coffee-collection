import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProduct, products } from "@/data/products";
import type { CartItem, Side } from "@/types/product";

type InfoPanel = "about" | "contact" | null;

/**
 * `fly`: garments travel between the rack and the stage (opening/closing).
 * `slide`: the stage is open and products slide past each other.
 */
export type TransitionMode = "fly" | "slide";

interface ShopState {
  focusedId: string | null;
  /** Most recently focused product; anchors the rack's stagger animations. */
  lastFocusedId: string;
  /** 1 = moving forward through the collection, -1 = backward. */
  direction: 1 | -1;
  mode: TransitionMode;
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
  goTo: (id: string) => void;
  setMode: (mode: TransitionMode) => void;
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
  /** Closes the top-most overlay. Returns false if nothing was open. */
  dismissTop: () => boolean;
}

const indexOf = (id: string | null) => products.findIndex((p) => p.id === id);

const step = (id: string | null, delta: number) => {
  const nextIndex = (indexOf(id) + delta + products.length) % products.length;
  return products[nextIndex].id;
};

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      focusedId: null,
      lastFocusedId: products[0].id,
      direction: 1,
      mode: "fly",
      side: "front",
      colorByProduct: {},
      drawerOpen: false,
      cartOpen: false,
      info: null,
      cart: [],

      focus: (id) =>
        set({ focusedId: id, lastFocusedId: id, side: "front", direction: 1, mode: "fly" }),
      unfocus: () => set({ focusedId: null, drawerOpen: false, mode: "fly" }),
      next: () => get().goTo(step(get().focusedId, 1)),
      prev: () => get().goTo(step(get().focusedId, -1)),
      goTo: (id) =>
        set((s) => {
          if (id === s.focusedId) return {};
          const from = indexOf(s.focusedId);
          const to = indexOf(id);
          const forward = (to - from + products.length) % products.length;
          return {
            focusedId: id,
            lastFocusedId: id,
            direction: forward <= products.length / 2 ? 1 : -1,
          };
        }),
      setMode: (mode) => set({ mode }),
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
                c.key === key ? { ...c, quantity: Math.min(10, c.quantity + item.quantity) } : c,
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

      dismissTop: () => {
        const s = get();
        if (s.drawerOpen) set({ drawerOpen: false });
        else if (s.cartOpen) set({ cartOpen: false });
        else if (s.info) set({ info: null });
        else if (s.focusedId) s.unfocus();
        else return false;
        return true;
      },
    }),
    {
      name: "coffee-collection-cart",
      partialize: (s) => ({ cart: s.cart }),
      skipHydration: true,
    },
  ),
);

export const selectCartCount = (s: ShopState) =>
  s.cart.reduce((sum, item) => (getProduct(item.productId) ? sum + item.quantity : sum), 0);
