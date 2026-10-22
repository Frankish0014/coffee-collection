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
import { GridIcon } from "@/components/icons";
import ProductArt, { ART_WIDTH, HOOK_Y } from "@/components/ProductArt";
import { brand, launchListMessage, whatsappLink } from "@/data/brand";
import { categories, products } from "@/data/products";
import { useShopStore, type TransitionMode } from "@/store/useShopStore";
import type { Product } from "@/types/product";

export const RACK_Y = "var(--rack-y)";
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

type Slot =
  | { type: "hero" }
  | { type: "section"; group: "apparel" | "accessories"; index: number }
  | { type: "product"; product: Product; index: number };

const SLOTS: Slot[] = (() => {
  const slots: Slot[] = [{ type: "hero" }];
  let lastGroup: string | null = null;
  let section = 0;
  products.forEach((product, index) => {
    const group = categories[product.category].group;
    if (group !== lastGroup) {
      slots.push({ type: "section", group, index: ++section });
      lastGroup = group;
    }
    slots.push({ type: "product", product, index });
  });
  return slots;
})();

export default function RackView() {
  const focusedId = useShopStore((s) => s.focusedId);
  const lastFocusedId = useShopStore((s) => s.lastFocusedId);
  const mode = useShopStore((s) => s.mode);
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
  const anchorSlot = Math.max(
    0,
    SLOTS.findIndex((s) => s.type === "product" && s.product.id === lastFocusedId),
  );
  // Matching dependencies tell Framer Motion to skip the rack→stage flight while sliding
  // between products; a changing value forces fresh snapshots when opening/closing.
  const layoutDependency = mode === "slide" ? "slide" : `rack-${focusedId ?? "none"}`;

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

  const centerOn = (id: string, instant: boolean) => {
    const el = scrollerRef.current;
    const item = el?.querySelector<HTMLElement>(`[data-product="${id}"]`);
    if (!el || !item) return;
    const max = el.scrollWidth - el.clientWidth;
    const centered = clamp(item.offsetLeft + item.offsetWidth / 2 - el.clientWidth / 2, 0, max);
    target.current = centered;
    if (instant) {
      current.current = centered;
      el.scrollLeft = centered;
    }
  };

  // Keep the (hidden) rack centered on the focused product so it hangs back in view on close.
  useEffect(() => {
    if (focusedId) centerOn(focusedId, true);
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
    <section aria-label="The collection" className="fixed inset-0 z-10">
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
          className="relative flex w-max items-start gap-[2.5vw] px-[6vw]"
          style={{ paddingTop: `calc(${RACK_Y} - ${ITEM_W} * ${HOOK_Y / ART_WIDTH})` }}
        >
          {SLOTS.map((slot, i) => {
            const delay = Math.abs(i - anchorSlot) * 0.05;
            const hidden = isFocused && !(slot.type === "product" && slot.product.id === focusedId);
            const common = {
              variants: itemVariants,
              custom: delay,
              initial: "enter",
              animate: hidden ? "hidden" : "shown",
            } as const;

            if (slot.type === "hero") {
              return (
                <motion.li key="hero" {...common} className="relative shrink-0">
                  <HeroSign
                    onExplore={() => {
                      if (!dragged.current) centerOn(products[0].id, false);
                    }}
                    swing={swing}
                    hidden={hidden}
                  />
                </motion.li>
              );
            }
            if (slot.type === "section") {
              return (
                <motion.li key={`section-${slot.group}`} {...common} className="relative shrink-0">
                  <SectionTag group={slot.group} index={slot.index} swing={swing} />
                </motion.li>
              );
            }
            const { product } = slot;
            return (
              <RackItem
                key={product.id}
                {...common}
                index={slot.index}
                product={product}
                colorId={colorByProduct[product.id] ?? product.colors[0].id}
                isFocused={product.id === focusedId}
                hidden={hidden}
                mode={mode}
                layoutDependency={layoutDependency}
                swing={swing}
                onSelect={() => {
                  if (!dragged.current) focus(product.id);
                }}
              />
            );
          })}
        </ul>
      </motion.div>

      <motion.div
        animate={{ opacity: isFocused ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="pointer-events-none absolute inset-x-6 bottom-14 flex items-end justify-between font-mono text-[10px] tracking-[0.18em] text-ink/50 uppercase md:inset-x-10"
      >
        <span className="hidden sm:inline">
          {brand.collectionHeading} — {String(products.length).padStart(2, "0")} pieces
        </span>
        <div className="hidden h-px w-[24vw] bg-ink/10 md:block">
          <motion.div className="h-px origin-left bg-ink" style={{ scaleX: progress }} />
        </div>
        <span className="ml-auto">Drag or scroll to browse</span>
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
            background: "linear-gradient(90deg, #b9b2aa, #f2eee8 40%, #857d75)",
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
            "linear-gradient(180deg, #f8f6f2 0%, #c8c1b8 30%, #8b837a 55%, #6a635b 70%, #d4cdc4 100%)",
          boxShadow: "0 8px 18px -6px rgba(40,25,15,0.3)",
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
      />
    </motion.div>
  );
}

/** Two cords from the rack, like a sign hanging in a shop window. */
function Cords({ height }: { height: number }) {
  return (
    <>
      {["left-[14%]", "right-[14%]"].map((pos) => (
        <span key={pos} aria-hidden className={`absolute top-0 ${pos} flex flex-col items-center`}>
          <span className="block h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-[#2c2622]" />
          <span className="block w-px bg-[#2c2622]/60" style={{ height }} />
        </span>
      ))}
    </>
  );
}

function HeroSign({
  onExplore,
  swing,
  hidden,
}: {
  onExplore: () => void;
  swing: MotionValue<number>;
  hidden: boolean;
}) {
  const rotate = useTransform(swing, (v) => v * 0.25);
  return (
    <motion.div
      className="relative w-[min(520px,82vw)] pt-9"
      style={{ rotate, transformOrigin: "50% 0%" }}
    >
      <Cords height={36} />
      <div className="relative rounded-[3px] bg-roast p-6 text-paper shadow-[0_30px_60px_-30px_rgba(26,20,17,0.7)] md:p-9">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-crema px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.18em] text-ink uppercase">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ink" />
            </span>
            {brand.status}
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] text-paper/50 uppercase">
            {brand.hero.eyebrow}
          </span>
        </div>

        <h1 className="mt-5 text-[clamp(32px,4.1vw,62px)] leading-[0.92] font-black tracking-[-0.05em] md:mt-6">
          {brand.hero.title.map((line, i) => (
            <span key={line} className={`block ${i === 1 ? "text-crema" : ""}`}>
              {line}
            </span>
          ))}
        </h1>

        <p className="mt-4 max-w-[42ch] text-[12px] leading-relaxed text-paper/70 md:mt-5 md:text-[13px]">
          {brand.hero.body}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2.5 md:mt-7 md:gap-3">
          <button
            type="button"
            onClick={onExplore}
            tabIndex={hidden ? -1 : 0}
            className="flex h-11 items-center gap-2.5 rounded-full bg-paper px-6 text-[10px] font-bold tracking-[0.2em] text-ink uppercase transition-colors hover:bg-crema"
          >
            <GridIcon className="h-3 w-3" />
            {brand.hero.cta}
          </button>
          <a
            href={whatsappLink(launchListMessage)}
            target="_blank"
            rel="noreferrer"
            tabIndex={hidden ? -1 : 0}
            onClick={(e) => e.stopPropagation()}
            className="flex h-11 items-center rounded-full border border-paper/25 px-6 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors hover:border-paper"
          >
            Join the launch list
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function SectionTag({
  group,
  index,
  swing,
}: {
  group: "apparel" | "accessories";
  index: number;
  swing: MotionValue<number>;
}) {
  const rotate = useTransform(swing, (v) => v * 0.9);
  const section = brand.sections[group];
  return (
    <motion.div className="relative w-[150px] pt-12 md:w-[180px]" style={{ rotate, transformOrigin: "50% 0%" }}>
      <span aria-hidden className="absolute top-0 left-1/2 flex -translate-x-1/2 flex-col items-center">
        <span className="block h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-[#2c2622]" />
        <span className="block h-[46px] w-px bg-[#2c2622]/60" />
      </span>
      <div className="relative border border-ink/15 bg-paper px-4 pt-6 pb-5 shadow-[0_18px_30px_-22px_rgba(26,20,17,0.5)]">
        <span aria-hidden className="absolute top-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border border-ink/25" />
        <p className="font-mono text-[9px] tracking-[0.2em] text-ink/45 uppercase">
          {String(index).padStart(2, "0")} — {section.eyebrow}
        </p>
        <h2 className="mt-2 text-[19px] leading-[1] font-black tracking-[-0.04em] md:text-[22px]">{section.title}</h2>
      </div>
    </motion.div>
  );
}

interface RackItemProps {
  index: number;
  product: Product;
  colorId: string;
  isFocused: boolean;
  hidden: boolean;
  mode: TransitionMode;
  layoutDependency: string;
  swing: MotionValue<number>;
  onSelect: () => void;
  variants: Variants;
  custom: number;
  initial: string;
  animate: string;
}

function RackItem({
  index,
  product,
  colorId,
  isFocused,
  hidden,
  mode,
  layoutDependency,
  swing,
  onSelect,
  ...motionProps
}: RackItemProps) {
  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0];
  // Slight per-item variation so the rack doesn't swing in lockstep.
  const rotate = useTransform(swing, (v) => v * (0.75 + ((index * 37) % 50) / 100));

  return (
    <motion.li data-product={product.id} className="relative shrink-0" style={{ width: ITEM_W }} {...motionProps}>
      <button
        type="button"
        onClick={onSelect}
        className="group block w-full cursor-[inherit] text-left focus-visible:outline-none"
        aria-label={`View ${product.name}`}
        tabIndex={hidden ? -1 : 0}
      >
        <motion.div style={{ rotate, transformOrigin: `50% ${(HOOK_Y / 400) * 100}%` }}>
          <div className="transition-transform duration-500 ease-out group-hover:translate-y-1.5 group-focus-visible:translate-y-1.5">
            {isFocused ? (
              <div className="aspect-[3/4] w-full" />
            ) : (
              <motion.div
                layoutId={`garment-${product.id}`}
                layoutDependency={layoutDependency}
                layoutCrossfade={mode === "slide" ? undefined : false}
                transition={GARMENT_LAYOUT_TRANSITION}
                className="relative z-10 aspect-[3/4] w-full"
              >
                <ProductArt
                  product={product}
                  color={color}
                  side="front"
                  className="h-full w-full drop-shadow-[0_18px_16px_rgba(40,25,15,0.12)]"
                />
              </motion.div>
            )}
          </div>
        </motion.div>

        <div
          className={`mt-2 flex items-baseline justify-between gap-2 px-[10%] font-mono text-[10px] tracking-[0.12em] uppercase transition-opacity duration-300 ${
            isFocused ? "opacity-0" : "text-ink/40 group-hover:text-ink group-focus-visible:text-ink"
          }`}
        >
          <span className="truncate">
            {String(index + 1).padStart(2, "0")} {product.name}
          </span>
          <span className="shrink-0">{categories[product.category].label}</span>
        </div>
      </button>
    </motion.li>
  );
}