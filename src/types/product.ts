export type Side = "front" | "back";

export type ProductKind =
  | "tee"
  | "hoodie"
  | "sweatshirt"
  | "cap"
  | "mug"
  | "bottle"
  | "tote"
  | "keychain";

export type CategoryId =
  | "tshirts"
  | "hoodies"
  | "sweatshirts"
  | "caps"
  | "mugs"
  | "bottles"
  | "totes"
  | "accessories";

export interface Category {
  id: CategoryId;
  label: string;
  group: "apparel" | "accessories";
  description: string;
}

export interface PrintStyle {
  front: "none" | "chest" | "big" | "bean";
  back: "none" | "tag" | "statement" | "bean";
}

export interface ColorVariant {
  id: string;
  /** Uppercase label shown in the UI, e.g. "ESPRESSO". */
  name: string;
  /** Product base color. */
  hex: string;
  /** Color used for prints/graphics on this variant. */
  ink: string;
  /**
   * Optional photography. When present, these replace the illustrated
   * product for this variant.
   */
  images?: Record<Side, string>;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  kind: ProductKind;
  /** Price in RWF. `null` until confirmed — shown as "Price at launch". */
  price: number | null;
  print: PrintStyle;
  colors: ColorVariant[];
  sizes: string[];
}

export interface CartItem {
  key: string;
  productId: string;
  colorId: string;
  size: string;
  quantity: number;
}
