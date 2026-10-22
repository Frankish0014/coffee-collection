import type { Product, Size } from "@/types/product";

export const SIZES: Size[] = ["S", "M", "L", "XL"];

const STANDARD_SHIPPING =
  "Ships within 2–3 business days from our Rotterdam studio. Free EU shipping on orders over €150. Free returns within 14 days — items must be unworn with tags attached.";

export const products: Product[] = [
  {
    id: "essential-tee",
    name: "Essential Tee",
    price: 45,
    kind: "tee",
    print: { front: "chest", back: "tag" },
    colors: [
      { id: "black", name: "BLACK", hex: "#151515", ink: "#f4f4f1" },
      { id: "white", name: "WHITE", hex: "#f6f6f3", ink: "#111111" },
      { id: "bone", name: "BONE", hex: "#e4dccb", ink: "#2a251d" },
    ],
    stock: { S: 12, M: 20, L: 8, XL: 0 },
    description:
      "The foundation. A boxy, dropped-shoulder tee cut from 240gsm combed cotton jersey with a dense, structured hand that holds its shape wash after wash.",
    details: [
      "100% organic combed cotton, 240gsm",
      "Boxy fit, dropped shoulder",
      "1×1 ribbed collar",
      "Tonal chest embroidery",
      "Garment dyed — slight variation is intentional",
    ],
    shipping: STANDARD_SHIPPING,
  },
  {
    id: "never-them-tee",
    name: "Never Them Tee",
    price: 55,
    kind: "tee",
    print: { front: "big", back: "statement" },
    colors: [
      { id: "white", name: "WHITE", hex: "#f6f6f3", ink: "#111111" },
      { id: "black", name: "BLACK", hex: "#151515", ink: "#c8ff1a" },
      { id: "ash", name: "ASH", hex: "#b9b9b6", ink: "#111111" },
    ],
    stock: { S: 3, M: 9, L: 14, XL: 6 },
    description:
      "Our manifesto, worn. Oversized heavyweight tee with a puff-printed front wordmark and the full statement screen printed across the back.",
    details: [
      "100% cotton, 280gsm heavyweight jersey",
      "Oversized fit — size down for regular",
      "Puff print front, water-based screen print back",
      "Double-needle hems",
    ],
    shipping: STANDARD_SHIPPING,
  },
  {
    id: "oxford-button-down",
    name: "Oxford Button-Down",
    price: 110,
    kind: "shirt",
    print: { front: "none", back: "none" },
    colors: [
      { id: "white", name: "WHITE", hex: "#f8f8f6", ink: "#111111" },
      { id: "sky", name: "SKY", hex: "#bcd3ea", ink: "#111111" },
      { id: "black", name: "BLACK", hex: "#1a1a1a", ink: "#f4f4f1" },
    ],
    stock: { S: 4, M: 0, L: 7, XL: 5 },
    description:
      "A relaxed Oxford with a soft-roll button-down collar and a box pleat at the back yoke. Washed for a broken-in feel from the first wear.",
    details: [
      "100% cotton Oxford weave",
      "Relaxed fit, curved shirttail hem",
      "Button-down collar, single chest pocket",
      "Corozo buttons",
    ],
    shipping: STANDARD_SHIPPING,
  },
  {
    id: "coach-jacket",
    name: "Coach Jacket",
    price: 185,
    kind: "jacket",
    print: { front: "chest", back: "statement" },
    colors: [
      { id: "black", name: "BLACK", hex: "#121212", ink: "#f4f4f1" },
      { id: "olive", name: "OLIVE", hex: "#4f5236", ink: "#e8e6d6" },
      { id: "volt", name: "VOLT", hex: "#c8ff1a", ink: "#111111" },
    ],
    stock: { S: 2, M: 6, L: 6, XL: 2 },
    description:
      "Water-repellent nylon coach jacket with a snap front, lightweight mesh lining, and the full statement printed oversized across the back panel.",
    details: [
      "Shell: 100% recycled nylon taslan, DWR finish",
      "Lining: polyester mesh",
      "Snap-button front, two welt hand pockets",
      "Adjustable drawcord hem",
    ],
    shipping: STANDARD_SHIPPING,
  },
  {
    id: "studio-longsleeve",
    name: "Studio Longsleeve",
    price: 65,
    kind: "longsleeve",
    print: { front: "chest", back: "statement" },
    colors: [
      { id: "white", name: "WHITE", hex: "#f6f6f3", ink: "#111111" },
      { id: "black", name: "BLACK", hex: "#151515", ink: "#f4f4f1" },
    ],
    stock: { S: 10, M: 10, L: 10, XL: 4 },
    description:
      "A heavyweight longsleeve with ribbed cuffs and a clean chest mark. The back carries the statement in a quiet, small-caps print.",
    details: [
      "100% cotton, 260gsm jersey",
      "Regular fit",
      "Ribbed cuffs and collar",
      "Screen printed front and back",
    ],
    shipping: STANDARD_SHIPPING,
  },
  {
    id: "work-jacket",
    name: "Work Jacket",
    price: 210,
    kind: "jacket",
    print: { front: "none", back: "tag" },
    colors: [
      { id: "tobacco", name: "TOBACCO", hex: "#8a5a32", ink: "#f1e9dc" },
      { id: "navy", name: "NAVY", hex: "#1d2538", ink: "#e9e9e4" },
      { id: "stone", name: "STONE", hex: "#cfc6b4", ink: "#2a251d" },
    ],
    stock: { S: 0, M: 3, L: 5, XL: 1 },
    description:
      "A boxy chore jacket in 12oz cotton canvas. Built for daily wear and made to age — expect it to soften and fade beautifully over time.",
    details: [
      "100% cotton canvas, 12oz",
      "Boxy fit, dropped shoulder",
      "Two front patch pockets",
      "Metal shank buttons",
      "Woven label at back neck",
    ],
    shipping: STANDARD_SHIPPING,
  },
  {
    id: "boxy-heavyweight-tee",
    name: "Boxy Heavyweight Tee",
    price: 50,
    kind: "tee",
    print: { front: "none", back: "statement" },
    colors: [
      { id: "volt", name: "VOLT", hex: "#c8ff1a", ink: "#111111" },
      { id: "ash", name: "ASH", hex: "#b9b9b6", ink: "#111111" },
      { id: "black", name: "BLACK", hex: "#151515", ink: "#c8ff1a" },
    ],
    stock: { S: 8, M: 1, L: 0, XL: 9 },
    description:
      "Clean on the front, loud on the back. Cropped and boxy in a dense heavyweight jersey that drapes rather than clings.",
    details: [
      "100% cotton, 300gsm",
      "Cropped boxy fit",
      "Wide ribbed collar",
      "Screen printed back",
    ],
    shipping: STANDARD_SHIPPING,
  },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function formatPrice(value: number) {
  return `€${value.toFixed(0)}`;
}
