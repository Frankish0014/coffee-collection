"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { SIZES, formatPrice, getProduct } from "@/data/products";
import { useShopStore } from "@/store/useShopStore";
import type { Product, Size } from "@/types/product";

export const DRAWER_SPRING = { type: "spring", stiffness: 260, damping: 34, mass: 0.9 } as const;
const EASE = [0.22, 1, 0.36, 1] as const;

export default function DetailDrawer() {
  const open = useShopStore((s) => s.drawerOpen);
  const focusedId = useShopStore((s) => s.focusedId);
  const closeDrawer = useShopStore((s) => s.closeDrawer);
  const product = focusedId ? getProduct(focusedId) : undefined;

  return (
    <AnimatePresence>
      {open && product && (
        <div key="drawer" className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label="Close availability"
            onClick={closeDrawer}
            className="absolute inset-0 cursor-default bg-ink/25 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`${product.name} availability`}
            className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-[#0b0b0b] text-paper shadow-[-30px_0_60px_-20px_rgba(0,0,0,0.5)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%", transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }}
            transition={DRAWER_SPRING}
          >
            {/* Remount the form per product so selections reset when navigating. */}
            <DrawerContent key={product.id} product={product} onClose={closeDrawer} />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function DrawerContent({ product, onClose }: { product: Product; onClose: () => void }) {
  const colorId = useShopStore((s) => s.colorByProduct[product.id] ?? product.colors[0].id);
  const setColor = useShopStore((s) => s.setColor);
  const addToCart = useShopStore((s) => s.addToCart);
  const openCart = useShopStore((s) => s.openCart);
  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0];

  const [size, setSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "error" | "added">("idle");
  const sizeControls = useAnimationControls();
  const closeRef = useRef<HTMLButtonElement>(null);

  const maxQty = size ? product.stock[size] : 10;

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (status !== "added") return;
    const t = setTimeout(() => setStatus("idle"), 2200);
    return () => clearTimeout(t);
  }, [status]);

  const selectSize = (s: Size) => {
    setSize(s);
    setQuantity((q) => Math.min(q, product.stock[s]));
    setStatus("idle");
  };

  const buy = () => {
    if (!size) {
      setStatus("error");
      sizeControls.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.45 } });
      return;
    }
    addToCart({ productId: product.id, colorId: color.id, size, quantity });
    setStatus("added");
  };

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { delay: 0.12 + i * 0.05, duration: 0.6, ease: EASE } },
  });

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-8">
        <span className="font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase">Availability</span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="group flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-white/70 uppercase hover:text-white focus-visible:outline-none focus-visible:text-white"
        >
          Close
          <span className="relative block h-3 w-3">
            <span className="absolute top-1/2 left-0 h-px w-3 rotate-45 bg-current transition-transform group-hover:rotate-[135deg]" />
            <span className="absolute top-1/2 left-0 h-px w-3 -rotate-45 bg-current transition-transform group-hover:rotate-45" />
          </span>
        </button>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-8 pt-10 pb-16">
        <motion.h2
          {...stagger(0)}
          className="text-[44px] leading-[0.9] font-black tracking-[-0.05em] uppercase"
        >
          {product.name}
        </motion.h2>

        <motion.div {...stagger(1)} className="mt-4 flex items-baseline justify-between">
          <span className="text-xl font-semibold tabular-nums">{formatPrice(product.price)}</span>
          <span className="font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">
            Incl. VAT
          </span>
        </motion.div>

        <motion.div {...stagger(2)} className="mt-10">
          <Label>Color</Label>
          <div className="mt-3 flex items-center justify-between">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={color.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-sm font-bold tracking-[0.16em]"
              >
                {color.name}
              </motion.span>
            </AnimatePresence>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(product.id, c.id)}
                  aria-label={c.name}
                  aria-pressed={c.id === color.id}
                  className={`h-5 w-5 rounded-full border transition-transform hover:scale-110 ${
                    c.id === color.id ? "border-white ring-1 ring-white ring-offset-2 ring-offset-[#0b0b0b]" : "border-white/20"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div {...stagger(3)} className="mt-9">
          <div className="flex items-baseline justify-between">
            <Label>Size</Label>
            <AnimatePresence>
              {status === "error" && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-mono text-[10px] tracking-[0.2em] text-volt uppercase"
                >
                  Select a size
                </motion.span>
              )}
              {size && product.stock[size] <= 3 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-mono text-[10px] tracking-[0.2em] text-white/60 uppercase"
                >
                  Only {product.stock[size]} left
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <motion.div animate={sizeControls} className="mt-3 grid grid-cols-4 gap-2" role="radiogroup" aria-label="Size">
            {SIZES.map((s) => {
              const soldOut = product.stock[s] === 0;
              const selected = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={soldOut}
                  onClick={() => selectSize(s)}
                  className={`relative aspect-square text-sm font-bold tracking-wider transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                    soldOut
                      ? "cursor-not-allowed border border-white/10 text-white/25"
                      : selected
                        ? "border border-white bg-white text-ink"
                        : "border border-white/20 text-white hover:border-white"
                  }`}
                >
                  {s}
                  {soldOut && (
                    <span className="absolute inset-0 m-auto h-px w-[70%] -rotate-45 bg-white/25" aria-hidden />
                  )}
                  {soldOut && <span className="sr-only"> — sold out</span>}
                </button>
              );
            })}
          </motion.div>
        </motion.div>

        <motion.div {...stagger(4)} className="mt-9">
          <Label>Quantity</Label>
          <div className="mt-3 flex h-12 w-36 items-center justify-between border border-white/20">
            <QtyButton label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((q) => q - 1)}>
              −
            </QtyButton>
            <span className="relative h-5 w-8 overflow-hidden text-center text-sm font-bold tabular-nums">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={quantity}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  {quantity}
                </motion.span>
              </AnimatePresence>
            </span>
            <QtyButton
              label="Increase quantity"
              disabled={quantity >= maxQty}
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </QtyButton>
          </div>
        </motion.div>

        <motion.div {...stagger(5)} className="mt-10">
          <motion.button
            type="button"
            onClick={buy}
            whileTap={{ scale: 0.985 }}
            className={`relative flex h-14 w-full items-center justify-center overflow-hidden text-xs font-black tracking-[0.28em] uppercase transition-colors duration-300 ${
              status === "added" ? "bg-volt text-ink" : "bg-white text-ink hover:bg-volt"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={status === "added" ? "added" : "buy"}
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                {status === "added" ? "Added to cart ✓" : `Buy item — ${formatPrice(product.price * quantity)}`}
              </motion.span>
            </AnimatePresence>
          </motion.button>
          <AnimatePresence>
            {status === "added" && (
              <motion.button
                type="button"
                onClick={openCart}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 block w-full overflow-hidden text-center font-mono text-[10px] tracking-[0.2em] text-white/60 uppercase underline-offset-4 hover:text-white hover:underline"
              >
                View cart →
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div {...stagger(6)} className="mt-12 border-t border-white/10">
          <Accordion title="Description">
            <p>{product.description}</p>
          </Accordion>
          <Accordion title="Details">
            <ul className="space-y-1.5">
              {product.details.map((d) => (
                <li key={d} className="flex gap-3">
                  <span className="text-white/30">—</span>
                  {d}
                </li>
              ))}
            </ul>
          </Accordion>
          <Accordion title="Shipping Info">
            <p>{product.shipping}</p>
          </Accordion>
        </motion.div>
      </div>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">{children}</span>;
}

function QtyButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-full w-12 items-center justify-center text-lg text-white transition-opacity hover:opacity-60 disabled:opacity-20"
    >
      {children}
    </button>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-5 text-left text-[11px] font-bold tracking-[0.22em] uppercase focus-visible:outline-none focus-visible:text-volt"
      >
        {title}
        <span className="relative block h-3 w-3" aria-hidden>
          <span className="absolute top-1/2 left-0 h-px w-3 bg-current" />
          <motion.span
            className="absolute top-1/2 left-0 h-px w-3 bg-current"
            animate={{ rotate: open ? 0 : 90 }}
            transition={{ duration: 0.3, ease: EASE }}
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-[13px] leading-relaxed text-white/65">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
