export type Size = "S" | "M" | "L" | "XL";

export type Side = "front" | "back";

export type GarmentKind = "tee" | "longsleeve" | "shirt" | "jacket";

export interface PrintStyle {
  front: "none" | "chest" | "big";
  back: "none" | "tag" | "statement";
}

export interface ColorVariant {
  id: string;
  /** Uppercase label shown in the UI, e.g. "BLACK". */
  name: string;
  /** Garment base color. */
  hex: string;
  /** Color used for prints/graphics on this variant. */
  ink: string;
  /**
   * Optional photography. When present, these replace the procedural
   * garment illustration for this variant.
   */
  images?: Record<Side, string>;
}

export interface Product {
  id: string;
  name: string;
  /** Price in whole euros. */
  price: number;
  kind: GarmentKind;
  print: PrintStyle;
  colors: ColorVariant[];
  /** Units in stock per size. 0 = sold out. */
  stock: Record<Size, number>;
  description: string;
  details: string[];
  shipping: string;
}

export interface CartItem {
  key: string;
  productId: string;
  colorId: string;
  size: Size;
  quantity: number;
}
