import type { Category, CategoryId, ColorVariant, Product } from "@/types/product";

export const APPAREL_SIZES = ["S", "M", "L", "XL"];
export const ONE_SIZE = ["ONE SIZE"];

export const categories: Record<CategoryId, Category> = {
  tshirts: {
    id: "tshirts",
    label: "T-shirts",
    group: "apparel",
    description:
      "Everyday essentials with a clean, modern look. Designed to complement your personal style, our T-shirt collection brings coffee-inspired identity into a versatile wardrobe.",
  },
  hoodies: {
    id: "hoodies",
    label: "Hoodies",
    group: "apparel",
    description:
      "Relaxed style with a refined edge. Explore hoodies that bring together contemporary streetwear aesthetics and the character of coffee culture.",
  },
  sweatshirts: {
    id: "sweatshirts",
    label: "Sweatshirts",
    group: "apparel",
    description:
      "An effortless addition to your everyday wardrobe. Clean silhouettes and coffee-inspired design make these pieces easy to wear across different settings.",
  },
  caps: {
    id: "caps",
    label: "Caps",
    group: "accessories",
    description:
      "Simple, versatile, and easy to style. Our cap collection adds a subtle expression of coffee-inspired identity to everyday outfits.",
  },
  mugs: {
    id: "mugs",
    label: "Mugs",
    group: "accessories",
    description:
      "Make everyday coffee moments your own. Discover mugs that bring a considered aesthetic to your daily coffee ritual, whether at home or at work.",
  },
  bottles: {
    id: "bottles",
    label: "Bottles",
    group: "accessories",
    description:
      "Practical essentials for life on the move. Discover bottle designs that combine a clean aesthetic with everyday convenience.",
  },
  totes: {
    id: "totes",
    label: "Tote Bags",
    group: "accessories",
    description:
      "Everyday functionality meets understated style. Designed to complement your daily routine, tote bags offer a practical way to carry your essentials.",
  },
  accessories: {
    id: "accessories",
    label: "Accessories",
    group: "accessories",
    description:
      "Small details, personal expression. Discover accessories that complement the collection and bring a little more of your style into everyday life.",
  },
};

const INK_DARK = "#2a1d15";
const INK_LIGHT = "#f1e9dd";

const c = (id: string, name: string, hex: string, ink: string): ColorVariant => ({ id, name, hex, ink });

const ESPRESSO = (ink = INK_LIGHT) => c("espresso", "ESPRESSO", "#2b1e17", ink);
const CREAM = c("cream", "CREAM", "#efe8dc", INK_DARK);
const OAT = c("oat", "OAT", "#d8cbb6", INK_DARK);
const LATTE = c("latte", "LATTE", "#c7a37e", INK_DARK);
const MOCHA = c("mocha", "MOCHA", "#6a4b3a", INK_LIGHT);
const CHARCOAL = c("charcoal", "CHARCOAL", "#2e2c2b", INK_LIGHT);

export const products: Product[] = [
  {
    id: "everyday-tee",
    name: "Everyday Tee",
    category: "tshirts",
    kind: "tee",
    price: null,
    print: { front: "chest", back: "statement" },
    colors: [CREAM, ESPRESSO(), OAT],
    sizes: APPAREL_SIZES,
  },
  {
    id: "beyond-the-cup-tee",
    name: "Beyond the Cup Tee",
    category: "tshirts",
    kind: "tee",
    price: null,
    print: { front: "big", back: "tag" },
    colors: [ESPRESSO("#efa94a"), CREAM, LATTE],
    sizes: APPAREL_SIZES,
  },
  {
    id: "ritual-hoodie",
    name: "Ritual Hoodie",
    category: "hoodies",
    kind: "hoodie",
    price: null,
    print: { front: "chest", back: "statement" },
    colors: [MOCHA, CHARCOAL, OAT],
    sizes: APPAREL_SIZES,
  },
  {
    id: "crema-sweatshirt",
    name: "Crema Sweatshirt",
    category: "sweatshirts",
    kind: "sweatshirt",
    price: null,
    print: { front: "chest", back: "bean" },
    colors: [LATTE, ESPRESSO(), CREAM],
    sizes: APPAREL_SIZES,
  },
  {
    id: "daily-cap",
    name: "Daily Cap",
    category: "caps",
    kind: "cap",
    price: null,
    print: { front: "bean", back: "tag" },
    colors: [ESPRESSO(), CREAM, LATTE],
    sizes: ONE_SIZE,
  },
  {
    id: "morning-mug",
    name: "Morning Mug",
    category: "mugs",
    kind: "mug",
    price: null,
    print: { front: "big", back: "bean" },
    colors: [CREAM, ESPRESSO(), c("sage", "SAGE", "#a9b39a", INK_DARK)],
    sizes: ONE_SIZE,
  },
  {
    id: "everyday-bottle",
    name: "Everyday Bottle",
    category: "bottles",
    kind: "bottle",
    price: null,
    print: { front: "big", back: "bean" },
    colors: [CHARCOAL, OAT, CREAM],
    sizes: ONE_SIZE,
  },
  {
    id: "market-tote",
    name: "Market Tote",
    category: "totes",
    kind: "tote",
    price: null,
    print: { front: "bean", back: "statement" },
    colors: [c("natural", "NATURAL", "#e9dfcc", INK_DARK), ESPRESSO()],
    sizes: ONE_SIZE,
  },
  {
    id: "bean-keychain",
    name: "Bean Keychain",
    category: "accessories",
    kind: "keychain",
    price: null,
    print: { front: "none", back: "tag" },
    colors: [c("walnut", "WALNUT", "#6b4630", INK_LIGHT), c("maple", "MAPLE", "#c79a6b", INK_DARK)],
    sizes: ONE_SIZE,
  },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function formatPrice(value: number | null) {
  return value === null ? "Price at launch" : `RWF ${value.toLocaleString("en-US")}`;
}
