"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { brand, mailtoLink, whatsappLink } from "@/data/brand";
import { categories, formatPrice, getProduct } from "@/data/products";
import { useShopStore } from "@/store/useShopStore";
import type { Product } from "@/types/product";

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
            className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-roast text-paper shadow-[-30px_0_60px_-20px_rgba(0,0,0,0.5)]"
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
  const category = categories[product.category];
  const singleSize = product.sizes.length === 1;

  const [size, setSize] = useState<string | null>(singleSize ? product.sizes[0] : null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "error" | "added">("idle");
  const sizeControls = useAnimationControls();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (status !== "added") return;
    const t = setTimeout(() => setStatus("idle"), 2400);
    return () => clearTimeout(t);
  }, [status]);

  const summary = `${product.name} — ${color.name}${size ? ` — Size ${size}` : ""} — Qty ${quantity}`;

  const reserve = () => {
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
          className="group flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-white/70 uppercase hover:text-white focus-visible:text-white focus-visible:outline-none"
        >
          Close
          <span className="relative block h-3 w-3">
            <span className="absolute top-1/2 left-0 h-px w-3 rotate-45 bg-current transition-transform group-hover:rotate-[135deg]" />
            <span className="absolute top-1/2 left-0 h-px w-3 -rotate-45 bg-current transition-transform group-hover:rotate-45" />
          </span>
        </button>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-8 pt-9 pb-16">
        <motion.div {...stagger(0)} className="flex items-center gap-3">
          <span className="rounded-full bg-crema px-3 py-1 font-mono text-[9px] font-semibold tracking-[0.2em] text-ink uppercase">
            {brand.status}
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] text-white/45 uppercase">{category.label}</span>
        </motion.div>

        <motion.h2
          {...stagger(1)}
          className="mt-5 text-[42px] leading-[0.9] font-black tracking-[-0.05em] uppercase"
        >
          {product.name}
        </motion.h2>

        <motion.div {...stagger(2)} className="mt-4 flex items-baseline justify-between gap-4">
          <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
          <span className="text-right font-mono text-[10px] tracking-[0.16em] text-white/40 uppercase">
            Reserve now · pay at launch
          </span>
        </motion.div>

        <motion.div {...stagger(3)} className="mt-10">
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
                    c.id === color.id
                      ? "border-white ring-1 ring-white ring-offset-2 ring-offset-roast"
                      : "border-white/20"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div {...stagger(4)} className="mt-9">
          <div className="flex items-baseline justify-between">
            <Label>Size</Label>
            <AnimatePresence>
              {status === "error" && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-mono text-[10px] tracking-[0.2em] text-crema uppercase"
                >
                  Select a size
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <motion.div
            animate={sizeControls}
            className={`mt-3 grid gap-2 ${singleSize ? "grid-cols-1" : "grid-cols-4"}`}
            role="radiogroup"
            aria-label="Size"
          >
            {product.sizes.map((s) => {
              const selected = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setSize(s);
                    setStatus("idle");
                  }}
                  className={`${singleSize ? "h-14" : "aspect-square"} border text-sm font-bold tracking-wider transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none ${
                    selected ? "border-white bg-white text-ink" : "border-white/20 text-white hover:border-white"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </motion.div>
        </motion.div>

        <motion.div {...stagger(5)} className="mt-9">
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
            <QtyButton label="Increase quantity" disabled={quantity >= 10} onClick={() => setQuantity((q) => q + 1)}>
              +
            </QtyButton>
          </div>
        </motion.div>

        <motion.div {...stagger(6)} className="mt-10">
          <motion.button
            type="button"
            onClick={reserve}
            whileTap={{ scale: 0.985 }}
            className={`relative flex h-14 w-full items-center justify-center overflow-hidden text-xs font-black tracking-[0.28em] uppercase transition-colors duration-300 ${
              status === "added" ? "bg-crema text-ink" : "bg-paper text-ink hover:bg-crema"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={status === "added" ? "added" : "reserve"}
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                {status === "added" ? "Added to your cart ✓" : "Reserve item"}
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
                View cart & send reservation →
              </motion.button>
            )}
          </AnimatePresence>

          <a
            href={whatsappLink(`Hi! I'm interested in this piece from ${brand.name}: ${summary}. Could you share more details?`)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 border border-white/20 text-[10px] font-bold tracking-[0.22em] uppercase transition-colors hover:border-white"
          >
            <WhatsAppIcon /> Ask on WhatsApp
          </a>
        </motion.div>

        <motion.div {...stagger(7)} className="mt-12 border-t border-white/10">
          <Accordion title="Description">
            <p>{category.description}</p>
          </Accordion>
          <Accordion title={brand.materials.heading}>
            <p className="text-white/85">{brand.materials.title}</p>
            <ul className="mt-3 space-y-1.5">
              {brand.materials.criteria.map((c) => (
                <li key={c.title} className="flex gap-3">
                  <span className="text-white/30">—</span>
                  <span>
                    <strong className="font-semibold text-white/85">{c.title}:</strong> {c.body}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-white/45">{brand.materials.note}</p>
          </Accordion>
          <Accordion title="Launch & Delivery">
            <p>{brand.launch}</p>
            <p className="mt-3">
              <a href={mailtoLink(`${brand.name}: ${product.name}`)} className="underline underline-offset-4 hover:text-white">
                {brand.contact.email}
              </a>
              <span className="mx-2 text-white/30">·</span>
              <span>{brand.contact.phoneDisplay}</span>
            </p>
          </Accordion>
        </motion.div>
      </div>
    </>
  );
}

export function WhatsAppIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm5.8 14.02c-.24.68-1.42 1.3-1.95 1.35-.5.05-1.13.07-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.18-4.94-4.37-.14-.2-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.26-.29.58-.36.77-.36h.55c.18 0 .42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.2-.14.31-.29.48-.14.17-.3.38-.43.5-.14.15-.29.3-.12.59.17.29.75 1.24 1.61 2 1.11.99 2.04 1.3 2.33 1.44.29.15.46.12.63-.07.17-.2.72-.84.92-1.13.19-.29.38-.24.65-.14.26.1 1.68.79 1.97.94.29.14.48.21.55.33.07.12.07.7-.17 1.38Z" />
    </svg>
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
        className="flex w-full items-center justify-between py-5 text-left text-[11px] font-bold tracking-[0.22em] uppercase focus-visible:text-crema focus-visible:outline-none"
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
