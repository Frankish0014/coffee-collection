"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import ProductArt from "@/components/ProductArt";
import { GARMENT_LAYOUT_TRANSITION } from "@/components/RackView";
import { categories, formatPrice, getProduct, products } from "@/data/products";
import { useShopStore, type TransitionMode } from "@/store/useShopStore";
import type { ColorVariant, Product, Side } from "@/types/product";

const EASE = [0.22, 1, 0.36, 1] as const;

const chrome: Variants = {
  hidden: { opacity: 0, y: 12 },
  shown: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE, delay: 0.25 + delay },
  }),
  exit: { opacity: 0, y: 8, transition: { duration: 0.2 } },
};

type StageCustom = { direction: 1 | -1; mode: TransitionMode };

/** Once the product has landed on the stage, switch to sliding navigation. */
const settle = () => {
  const s = useShopStore.getState();
  if (s.focusedId && s.mode === "fly") s.setMode("slide");
};

/** Products swing in from the side of the stage when navigating, so one is always on display. */
const stage: Variants = {
  enter: ({ direction, mode }: StageCustom) =>
    mode === "slide"
      ? { x: `${direction * 85}%`, rotate: direction * 6, opacity: 0, scale: 0.9 }
      : { x: 0, rotate: 0, opacity: 1, scale: 1 },
  center: {
    x: 0,
    rotate: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 18, mass: 0.9 },
  },
  exit: ({ direction, mode }: StageCustom) =>
    mode === "slide"
      ? {
          x: `${direction * -85}%`,
          rotate: direction * -6,
          opacity: 0,
          scale: 0.9,
          transition: { duration: 0.5, ease: EASE },
        }
      : { opacity: 0, transition: { duration: 0 } },
};

export default function ProductFocus() {
  const focusedId = useShopStore((s) => s.focusedId);
  const side = useShopStore((s) => s.side);
  const colorByProduct = useShopStore((s) => s.colorByProduct);
  const direction = useShopStore((s) => s.direction);
  const mode = useShopStore((s) => s.mode);

  const product = focusedId ? getProduct(focusedId) : undefined;
  const colorOf = (p: Product) => p.colors.find((c) => c.id === colorByProduct[p.id]) ?? p.colors[0];
  const color = product ? colorOf(product) : undefined;
  const custom: StageCustom = { direction, mode };

  useEffect(() => {
    if (!focusedId || mode !== "fly") return;
    const t = setTimeout(settle, 1600);
    return () => clearTimeout(t);
  }, [focusedId, mode]);

  return (
    <section
      aria-label={product ? `${product.name} — focused view` : undefined}
      aria-hidden={!product}
      className={`fixed inset-0 z-20 ${product ? "" : "pointer-events-none"}`}
    >
      <AnimatePresence>
        {product && <Backdrop key="backdrop" product={product} direction={direction} />}
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col items-center justify-center pt-16 pb-12">
        <div className="relative aspect-[3/4] h-[min(54vh,calc(100dvh_-_400px),100vw)] md:h-[min(56vh,calc(100dvh_-_330px),640px)]">
          <AnimatePresence initial={false} custom={custom}>
            {product && color && (
              <motion.div
                key={product.id}
                custom={custom}
                variants={stage}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 z-10"
                style={{ transformOrigin: "50% 2%" }}
              >
                <motion.div
                  layoutId={`garment-${product.id}`}
                  layoutDependency={mode === "slide" ? "slide" : "focus"}
                  transition={GARMENT_LAYOUT_TRANSITION}
                  onLayoutAnimationComplete={settle}
                  className="h-full w-full"
                >
                  <FlipGarment product={product} color={color} side={side} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {product && color && (
              <motion.div
                key="tags"
                variants={chrome}
                custom={0.15}
                initial="hidden"
                animate="shown"
                exit="exit"
                className="absolute top-[17%] left-full ml-6 hidden md:block lg:ml-12"
              >
                <ColorTags product={product} active={color} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-5 h-[180px] md:h-[106px]">
          <AnimatePresence>
            {product && color && (
              <motion.div
                key="controls"
                initial="hidden"
                animate="shown"
                exit="exit"
                className="flex flex-col items-center gap-3"
              >
                <motion.p
                  variants={chrome}
                  custom={0}
                  className="text-center text-[13px] font-extrabold tracking-tight uppercase md:hidden"
                >
                  {product.name}
                  <span className="ml-2 font-mono text-[10px] font-normal tracking-[0.14em] text-ink/50">
                    {formatPrice(product.price)}
                  </span>
                </motion.p>
                <motion.div variants={chrome} custom={0.05} className="md:hidden">
                  <ColorTags product={product} active={color} compact />
                </motion.div>
                <motion.div variants={chrome} custom={0.1}>
                  <SideToggle side={side} />
                </motion.div>
                <motion.div variants={chrome} custom={0.2}>
                  <AvailabilityButton />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-[66px]">
          <AnimatePresence>
            {product && (
              <motion.div key="strip" variants={chrome} custom={0.3} initial="hidden" animate="shown" exit="exit">
                <ThumbnailStrip activeId={product.id} colorOf={colorOf} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>{product && <EdgeNav key="nav" />}</AnimatePresence>
    </section>
  );
}

function FlipGarment({ product, color, side }: { product: Product; color: ColorVariant; side: Side }) {
  return (
    <div className="h-full w-full" style={{ perspective: 1400 }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={side}
          className="h-full w-full"
          style={{ transformOrigin: "50% 50%" }}
          initial={{ rotateY: -90, opacity: 0.4 }}
          animate={{ rotateY: 0, opacity: 1, transition: { duration: 0.22, ease: [0, 0, 0.2, 1] } }}
          exit={{ rotateY: 90, opacity: 0.4, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } }}
        >
          <ProductArt
            product={product}
            color={color}
            side={side}
            className="h-full w-full drop-shadow-[0_30px_30px_rgba(40,25,15,0.16)]"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Backdrop({ product, direction }: { product: Product; direction: 1 | -1 }) {
  const unfocus = useShopStore((s) => s.unfocus);
  const index = products.findIndex((p) => p.id === product.id);

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.15 } }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.span
            key={product.id}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: `${d * 12}%`, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              leave: (d: number) => ({ x: `${d * -12}%`, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="leave"
            transition={{ duration: 0.7, ease: EASE }}
            className="absolute -mt-[10vh] text-[14vw] leading-none font-black tracking-[-0.07em] whitespace-nowrap text-ink/[0.05] uppercase"
            aria-hidden
          >
            {product.name}
          </motion.span>
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={unfocus}
        className="group absolute top-20 left-5 flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-ink/60 uppercase transition-colors hover:text-ink md:left-10"
      >
        <span className="transition-transform group-hover:-translate-x-1">←</span> Back
        <span className="-ml-1 hidden sm:inline">to collection</span>
      </button>

      <div className="absolute bottom-14 left-6 hidden md:left-10 md:block">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <p className="font-mono text-[10px] tracking-[0.18em] text-ink/50 uppercase">
              {String(index + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")} —{" "}
              {categories[product.category].label}
            </p>
            <p className="mt-1 text-sm font-extrabold tracking-tight uppercase">{product.name}</p>
            <p className="font-mono text-[11px] text-ink/60">{formatPrice(product.price)}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ThumbnailStrip({ activeId, colorOf }: { activeId: string; colorOf: (p: Product) => ColorVariant }) {
  const goTo = useShopStore((s) => s.goTo);

  return (
    <nav
      aria-label="All products"
      className="no-scrollbar flex max-w-[calc(100vw-40px)] gap-1.5 overflow-x-auto px-1 pt-1 pb-2"
    >
      {products.map((p) => {
        const active = p.id === activeId;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => goTo(p.id)}
            aria-label={p.name}
            aria-current={active}
            className={`relative h-14 w-[42px] shrink-0 rounded-[3px] transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink ${
              active ? "bg-white/80 shadow-[0_6px_14px_-8px_rgba(26,20,17,0.6)]" : "opacity-45 hover:bg-white/50 hover:opacity-100"
            }`}
          >
            <ProductArt product={p} color={colorOf(p)} side="front" className="h-full w-full p-0.5" />
            {active && (
              <motion.span
                layoutId="thumb-indicator"
                className="absolute -bottom-1.5 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-ink"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

function ColorTags({ product, active, compact }: { product: Product; active: ColorVariant; compact?: boolean }) {
  const setColor = useShopStore((s) => s.setColor);

  return (
    <div className={compact ? "flex items-center gap-3" : "flex flex-col items-start"}>
      {!compact && (
        <span className="mb-1 font-mono text-[10px] tracking-[0.18em] text-ink/40 uppercase">Color</span>
      )}
      <div role="radiogroup" aria-label="Color" className="flex items-start gap-3">
        {product.colors.map((c, i) => {
          const selected = c.id === active.id;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={c.name}
              title={c.name}
              onClick={() => setColor(product.id, c.id)}
              className="group flex flex-col items-center focus-visible:outline-none"
            >
              <motion.span
                className="block w-px bg-ink/35"
                animate={{ height: (compact ? 6 : 14 + i * 9) + (selected ? 6 : 0) }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
              <motion.span
                className={`relative block rounded-[3px] border transition-shadow ${
                  compact ? "h-7 w-5" : "h-11 w-7"
                } ${
                  selected
                    ? "border-ink shadow-[0_6px_14px_-4px_rgba(26,20,17,0.4)]"
                    : "border-ink/15 group-hover:border-ink/50 group-focus-visible:border-ink"
                }`}
                style={{ backgroundColor: c.hex, transformOrigin: "50% 0%" }}
                animate={selected ? { rotate: [0, -9, 6, -3, 0] } : { rotate: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              >
                <span className="absolute top-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full border border-ink/20 bg-paper" />
              </motion.span>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={active.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className={`font-mono text-[10px] font-medium tracking-[0.18em] text-ink ${compact ? "" : "mt-3"}`}
        >
          {active.name}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function SideToggle({ side }: { side: Side }) {
  const setSide = useShopStore((s) => s.setSide);

  return (
    <div
      role="radiogroup"
      aria-label="View side"
      className="relative flex rounded-full border border-ink/15 bg-white/60 p-1 backdrop-blur-sm"
    >
      {(["front", "back"] as const).map((s) => {
        const selected = side === s;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setSide(s)}
            className={`relative h-8 w-24 rounded-full text-[10px] font-bold tracking-[0.22em] uppercase transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/40 ${
              selected ? "text-paper" : "text-ink/50 hover:text-ink"
            }`}
          >
            {selected && (
              <motion.span
                layoutId="side-indicator"
                className="absolute inset-0 rounded-full bg-ink"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative">{s}</span>
          </button>
        );
      })}
    </div>
  );
}

function AvailabilityButton() {
  const openDrawer = useShopStore((s) => s.openDrawer);

  return (
    <motion.button
      type="button"
      onClick={openDrawer}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="group relative flex h-12 items-center gap-3 overflow-hidden rounded-full bg-ink px-8 text-[11px] font-bold tracking-[0.22em] text-paper uppercase shadow-[0_14px_30px_-10px_rgba(26,20,17,0.5)]"
    >
      <span className="absolute inset-0 translate-y-full bg-crema transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
      <span className="relative transition-colors duration-300 group-hover:text-ink">See availability</span>
      <span className="relative transition-all duration-300 group-hover:translate-x-1 group-hover:text-ink">→</span>
    </motion.button>
  );
}

function EdgeNav() {
  const next = useShopStore((s) => s.next);
  const prev = useShopStore((s) => s.prev);

  const arrow = (dir: "prev" | "next") => (
    <button
      type="button"
      onClick={dir === "prev" ? prev : next}
      aria-label={dir === "prev" ? "Previous product" : "Next product"}
      className={`group absolute top-1/2 flex h-16 w-14 -translate-y-1/2 items-center justify-center text-ink/50 transition-colors hover:text-ink focus-visible:text-ink focus-visible:outline-none md:w-16 ${
        dir === "prev" ? "left-1 md:left-6" : "right-1 md:right-6"
      }`}
    >
      <svg
        viewBox="0 0 40 16"
        className={`h-4 w-9 transition-transform duration-300 md:w-10 ${
          dir === "prev" ? "rotate-180 group-hover:-translate-x-1.5" : "group-hover:translate-x-1.5"
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      >
        <path d="M0 8 H38 M31 1 L38 8 L31 15" />
      </svg>
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.4, duration: 0.4 } }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
    >
      {arrow("prev")}
      {arrow("next")}
    </motion.div>
  );
}
