"use client";

import { AnimatePresence, motion } from "framer-motion";
import { DRAWER_SPRING } from "@/components/DetailDrawer";
import { GridIcon, WhatsAppIcon } from "@/components/icons";
import ProductArt from "@/components/ProductArt";
import { brand, mailtoLink, whatsappLink } from "@/data/brand";
import { formatPrice, getProduct } from "@/data/products";
import { selectCartCount, useShopStore } from "@/store/useShopStore";

export default function CartDrawer() {
  const open = useShopStore((s) => s.cartOpen);
  const close = useShopStore((s) => s.closeCart);
  const cart = useShopStore((s) => s.cart);
  const setQuantity = useShopStore((s) => s.setQuantity);
  const count = useShopStore(selectCartCount);

  const lines = cart.flatMap((item) => {
    const product = getProduct(item.productId);
    const color = product?.colors.find((c) => c.id === item.colorId);
    return product && color ? [{ item, product, color }] : [];
  });
  const allPriced = lines.every((l) => l.product.price !== null);
  const subtotal = lines.reduce((sum, l) => sum + (l.product.price ?? 0) * l.item.quantity, 0);

  const message = [
    `Hi! I'd like to reserve these pieces from ${brand.name}:`,
    ...lines.map(
      ({ item, product, color }) => `• ${product.name} — ${color.name} — ${item.size} — Qty ${item.quantity}`,
    ),
    "",
    "Please let me know about pricing and delivery at launch. Thank you!",
  ].join("\n");

  return (
    <AnimatePresence>
      {open && (
        <div key="cart" className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label="Close cart"
            onClick={close}
            className="absolute inset-0 cursor-default bg-ink/25 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Cart"
            className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-roast text-paper"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%", transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }}
            transition={DRAWER_SPRING}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-8">
              <span className="font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase">
                Cart ({count}) — Reservations
              </span>
              <button
                type="button"
                onClick={close}
                autoFocus
                className="font-mono text-[10px] tracking-[0.2em] text-white/70 uppercase hover:text-white focus-visible:outline-none"
              >
                Close ✕
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-start justify-center px-8">
                <p className="text-[44px] leading-[0.9] font-black tracking-[-0.05em] uppercase">
                  Nothing
                  <br />
                  here yet.
                </p>
                <p className="mt-5 max-w-[34ch] text-[13px] leading-relaxed text-white/55">
                  {brand.status}. Reserve your favourite pieces and we&apos;ll reach out the moment the collection drops.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-8 flex h-11 items-center gap-2.5 rounded-full bg-paper px-6 text-[10px] font-bold tracking-[0.2em] text-ink uppercase transition-colors hover:bg-crema"
                >
                  <GridIcon className="h-3 w-3" />
                  {brand.hero.cta}
                </button>
              </div>
            ) : (
              <>
                <ul className="no-scrollbar flex-1 overflow-y-auto px-8">
                  <AnimatePresence initial={false}>
                    {lines.map(({ item, product, color }) => (
                      <motion.li
                        key={item.key}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30, height: 0, paddingTop: 0, paddingBottom: 0 }}
                        className="flex gap-5 overflow-hidden border-b border-white/10 py-6"
                      >
                        <div className="aspect-[3/4] w-20 shrink-0 rounded-sm bg-paper p-1.5">
                          <ProductArt product={product} color={color} side="front" className="h-full w-full" />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between gap-3">
                            <p className="text-sm font-extrabold tracking-tight uppercase">{product.name}</p>
                            <p className="shrink-0 text-right font-mono text-[10px] text-white/60">
                              {formatPrice(product.price === null ? null : product.price * item.quantity)}
                            </p>
                          </div>
                          <p className="mt-1 font-mono text-[10px] tracking-[0.18em] text-white/50">
                            {color.name} / {item.size}
                          </p>
                          <div className="mt-auto flex items-center justify-between pt-3">
                            <div className="flex h-8 items-center border border-white/20">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                onClick={() => setQuantity(item.key, item.quantity - 1)}
                                className="h-full w-8 hover:opacity-60"
                              >
                                −
                              </button>
                              <span className="w-6 text-center text-xs font-bold tabular-nums">{item.quantity}</span>
                              <button
                                type="button"
                                aria-label="Increase quantity"
                                disabled={item.quantity >= 10}
                                onClick={() => setQuantity(item.key, item.quantity + 1)}
                                className="h-full w-8 hover:opacity-60 disabled:opacity-20"
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => setQuantity(item.key, 0)}
                              className="font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase hover:text-white"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <div className="shrink-0 border-t border-white/10 px-8 pt-6 pb-14">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase">Subtotal</span>
                    <span className="text-base font-semibold">
                      {allPriced ? formatPrice(subtotal) : "Announced at launch"}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] tracking-[0.14em] text-white/35 uppercase">
                    {brand.status} — reserve now, pay at launch
                  </p>
                  <a
                    href={whatsappLink(message)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 flex h-14 w-full items-center justify-center gap-2.5 bg-crema text-xs font-black tracking-[0.24em] text-ink uppercase transition-colors hover:bg-paper"
                  >
                    <WhatsAppIcon className="h-4 w-4" /> Reserve via WhatsApp
                  </a>
                  <a
                    href={mailtoLink(`${brand.name} reservation`, message)}
                    className="mt-2 flex h-11 w-full items-center justify-center border border-white/20 text-[10px] font-bold tracking-[0.22em] uppercase transition-colors hover:border-white"
                  >
                    Or send by email
                  </a>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
