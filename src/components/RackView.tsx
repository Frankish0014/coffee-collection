"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
  type Variants,
} from "framer-motion";
import GarmentArt, { ART_WIDTH, HOOK_Y } from "@/components/GarmentArt";
import { formatPrice, products } from "@/data/products";
import { useShopStore } from "@/store/useShopStore";
import type { Product } from "@/types/product";

export const RACK_Y = "31vh";
export const ITEM_W = "clamp(150px, min(18vw, 34vh), 250px)";
export const GARMENT_LAYOUT_TRANSITION = {
  type: "spring",
  stiffness: 110,
  damping: 20,
  mass: 1,
} as const;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const itemVariants: Variants = {
  enter: { opacity: 0, y: -28 },
  shown: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: 0.35 + delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
  hidden: (delay: number) => ({
    opacity: 0,
    y: 14,
    filter: "blur(6px)",
    transition: { delay: delay * 0.4, duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  }),
};

export default function RackView() {
  const focusedId = useShopStore((s) => s.focusedId);
  const lastFocusedId = useShopStore((s) => s.lastFocusedId);
  const colorByProduct = useShopStore((s) => s.colorByProduct);
  const focus = useShopStore((s) => s.focus);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const current = useRef(0);
  const dragged = useRef(false);

  const scrollX = useMotionValue(0);
  const progress = useMotionValue(0);
  const velocity = useVelocity(scrollX);
  const swingTarget = useTransform(velocity, (v) => clamp(-v / 70, -11, 11));
  const swing = useSpring(swingTarget, { stiffness: 140, damping: 7, mass: 0.7 });

  const isFocused = focusedId !== null;
  const anchorIndex = Math.max(0, products.findIndex((p) => p.id === lastFocusedId));

  // Eased scroll loop: wheel and drag move `target`, the loop glides `current` toward it.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;

    const tick = () => {
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      target.current = clamp(target.current, 0, max);
      const diff = target.current - current.current;
      if (diff !== 0) {
        current.current = Math.abs(diff) < 0.5 ? target.current : current.current + diff * 0.1;
        el.scrollLeft = current.current;
      }
      scrollX.set(current.current);
      progress.set(max ? current.current / max : 0);
      raf = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      if (useShopStore.getState().focusedId) return;
      const unit = e.deltaMode === 1 ? 16 : 1;
      target.current += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * unit;
      e.preventDefault();
    };

    // Keeps the loop in sync with native scrolling (touch, keyboard focus).
    const onScroll = () => {
      if (Math.abs(el.scrollLeft - current.current) > 1.5) {
        current.current = target.current = el.scrollLeft;
      }
    };

    raf = requestAnimationFrame(tick);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
    };
  }, [scrollX, progress]);

  // Re-center the (hidden) rack on the focused garment so it hangs back in view on close.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !focusedId) return;
    const item = el.querySelector<HTMLElement>(`[data-product="${focusedId}"]`);
    if (!item) return;
    const max = el.scrollWidth - el.clientWidth;
    const centered = clamp(item.offsetLeft + item.offsetWidth / 2 - el.clientWidth / 2, 0, max);
    target.current = current.current = centered;
    el.scrollLeft = centered;
  }, [focusedId]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragged.current = false;
    if (e.pointerType === "touch" || e.button !== 0) return;
    const el = e.currentTarget;
    const startX = e.clientX;
    const startTarget = target.current;
    let lastX = e.clientX;
    let lastT = performance.now();
    let vx = 0;

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (!dragged.current && Math.abs(dx) > 6) {
        dragged.current = true;
        el.setPointerCapture(ev.pointerId);
      }
      if (!dragged.current) return;
      const now = performance.now();
      vx = (ev.clientX - lastX) / Math.max(1, now - lastT);
      lastX = ev.clientX;
      lastT = now;
      target.current = startTarget - dx * 1.15;
    };
    const up = () => {
      if (dragged.current) target.current -= vx * 380;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  return (
    <section aria-label="The rack" className="fixed inset-0 z-10">
      <RackBar hidden={isFocused} />

      <motion.div
        ref={scrollerRef}
        layoutScroll
        onPointerDown={onPointerDown}
        className={`no-scrollbar absolute inset-0 overflow-x-auto overflow-y-hidden select-none ${
          isFocused ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"
        }`}
        style={{ touchAction: "pan-x" }}
      >
        <ul
          className="relative flex w-max items-start gap-[2.5vw] px-[8vw]"
          style={{ paddingTop: `calc(${RACK_Y} - ${ITEM_W} * ${HOOK_Y / ART_WIDTH})` }}
        >
          {products.map((product, i) => (
            <RackItem
              key={product.id}
              index={i}
              product={product}
              colorId={colorByProduct[product.id] ?? product.colors[0].id}
              isFocused={product.id === focusedId}
              hidden={isFocused && product.id !== focusedId}
              delay={Math.abs(i - anchorIndex) * 0.05}
              swing={swing}
              onSelect={() => {
                if (!dragged.current) focus(product.id);
              }}
            />
          ))}
        </ul>
      </motion.div>

      <motion.div
        animate={{ opacity: isFocused ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="pointer-events-none absolute inset-x-6 bottom-14 flex items-end justify-between font-mono text-[10px] tracking-[0.18em] text-ink/50 uppercase md:inset-x-10"
      >
        <span className="hidden sm:inline">
          SS26 Collection — {String(products.length).padStart(2, "0")} pieces
        </span>
        <div className="hidden h-px w-[28vw] bg-ink/10 md:block">
          <motion.div className="h-px origin-left bg-ink" style={{ scaleX: progress }} />
        </div>
        <span className="ml-auto">Drag / Scroll ⟷</span>
      </motion.div>
    </section>
  );
}

function RackBar({ hidden }: { hidden: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.5, delay: hidden ? 0.1 : 0.25 }}
    >
      {["left-[7vw]", "right-[7vw]"].map((pos) => (
        <motion.div
          key={pos}
          className={`absolute top-0 w-[3px] origin-top ${pos}`}
          style={{
            height: RACK_Y,
            background: "linear-gradient(90deg, #bdbdbd, #f4f4f4 40%, #8a8a8a)",
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        />
      ))}
      <motion.div
        className="absolute inset-x-[3vw] h-[7px] origin-left -translate-y-1/2 rounded-full"
        style={{
          top: RACK_Y,
          background:
            "linear-gradient(180deg, #fafafa 0%, #c9c9c9 30%, #8d8d8d 55%, #6b6b6b 70%, #d6d6d6 100%)",
          boxShadow: "0 8px 18px -6px rgba(0,0,0,0.25)",
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
      />
    </motion.div>
  );
}

interface RackItemProps {
  index: number;
  product: Product;
  colorId: string;
  isFocused: boolean;
  hidden: boolean;
  delay: number;
  swing: MotionValue<number>;
  onSelect: () => void;
}

function RackItem({ index, product, colorId, isFocused, hidden, delay, swing, onSelect }: RackItemProps) {
  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0];
  // Slight per-garment variation so the rack doesn't swing in lockstep.
  const rotate = useTransform(swing, (v) => v * (0.75 + ((index * 37) % 50) / 100));

  return (
    <motion.li
      data-product={product.id}
      className="relative shrink-0"
      style={{ width: ITEM_W }}
      variants={itemVariants}
      custom={delay}
      initial="enter"
      animate={hidden ? "hidden" : "shown"}
    >
      <button
        type="button"
        onClick={onSelect}
        className="group block w-full cursor-[inherit] text-left focus-visible:outline-none"
        aria-label={`View ${product.name}, ${formatPrice(product.price)}`}
        tabIndex={hidden ? -1 : 0}
      >
        <motion.div style={{ rotate, transformOrigin: `50% ${(HOOK_Y / 400) * 100}%` }}>
          <div className="transition-transform duration-500 ease-out group-hover:translate-y-1.5 group-focus-visible:translate-y-1.5">
            {isFocused ? (
              <div className="aspect-[3/4] w-full" />
            ) : (
              <motion.div
                layoutId={`garment-${product.id}`}
                transition={GARMENT_LAYOUT_TRANSITION}
                className="relative z-10 aspect-[3/4] w-full"
              >
                <GarmentArt
                  product={product}
                  color={color}
                  side="front"
                  className="h-full w-full drop-shadow-[0_18px_16px_rgba(0,0,0,0.10)]"
                />
              </motion.div>
            )}
          </div>
        </motion.div>

        <div
          className={`mt-2 flex items-baseline justify-between gap-2 px-[12%] font-mono text-[10px] tracking-[0.12em] uppercase transition-opacity duration-300 ${
            isFocused ? "opacity-0" : "text-ink/40 group-hover:text-ink group-focus-visible:text-ink"
          }`}
        >
          <span className="truncate">
            {String(index + 1).padStart(2, "0")} {product.name}
          </span>
          <span className="shrink-0">{formatPrice(product.price)}</span>
        </div>
      </button>
    </motion.li>
  );
}
