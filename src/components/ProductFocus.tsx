"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import GarmentArt from "@/components/GarmentArt";
import { GARMENT_LAYOUT_TRANSITION } from "@/components/RackView";
import { formatPrice, getProduct, products } from "@/data/products";
import { useShopStore } from "@/store/useShopStore";
import type { ColorVariant, Product, Side } from "@/types/product";

const FOCUS_H = "min(56vh, calc(100dvh - 300px), 640px, 106vw)";
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

export default function ProductFocus() {
  const focusedId = useShopStore((s) => s.focusedId);
  const side = useShopStore((s) => s.side);
  const colorByProduct = useShopStore((s) => s.colorByProduct);
  const direction = useShopStore((s) => s.direction);

  const product = focusedId ? getProduct(focusedId) : undefined;
  const color = product
    ? (product.colors.find((c) => c.id === colorByProduct[product.id]) ?? product.colors[0])
    : undefined;

  return (
    <section
      aria-label={product ? `${product.name} — focused view` : undefined}
      aria-hidden={!product}
      className={`fixed inset-0 z-20 ${product ? "" : "pointer-events-none"}`}
    >
      <AnimatePresence>
        {product && color && <Backdrop key="backdrop" product={product} direction={direction} />}
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col items-center justify-center pt-16 pb-9">
        <div className="relative" style={{ height: FOCUS_H, aspectRatio: "3 / 4" }}>
          {product && color && (
            <motion.div
              key={product.id}
              layoutId={`garment-${product.id}`}
              transition={GARMENT_LAYOUT_TRANSITION}
              className="absolute inset-0 z-10"
            >
              <FlipGarment product={product} color={color} side={side} />
            </motion.div>
          )}

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

        <div className="mt-5 h-[160px] md:h-[118px]">
          <AnimatePresence>
            {product && color && (
              <motion.div
                key="controls"
                initial="hidden"
                animate="shown"
                exit="exit"
                className="flex flex-col items-center gap-3.5"
              >
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
          <GarmentArt
            product={product}
            color={color}
            side={side}
            className="h-full w-full drop-shadow-[0_30px_30px_rgba(0,0,0,0.14)]"
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
            className="absolute -mt-[8vh] text-[15vw] leading-none font-black tracking-[-0.07em] whitespace-nowrap text-ink/[0.045] uppercase"
            aria-hidden
          >
            {product.name}
          </motion.span>
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={unfocus}
        className="group absolute top-20 left-6 flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-ink/60 uppercase transition-colors hover:text-ink md:left-10"
      >
        <span className="transition-transform group-hover:-translate-x-1">←</span> Back to rack
      </button>

      <div className="absolute bottom-14 left-6 md:left-10">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <p className="font-mono text-[10px] tracking-[0.18em] text-ink/50">
              {String(index + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
            </p>
            <p className="mt-1 text-sm font-extrabold tracking-tight uppercase">{product.name}</p>
            <p className="font-mono text-xs text-ink/60">{formatPrice(product.price)}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
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
                    ? "border-ink shadow-[0_6px_14px_-4px_rgba(0,0,0,0.35)]"
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
      className="relative flex rounded-full border border-ink/15 bg-white/70 p-1 backdrop-blur-sm"
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
      className="group relative flex h-12 items-center gap-3 overflow-hidden rounded-full bg-ink px-8 text-[11px] font-bold tracking-[0.22em] text-paper uppercase shadow-[0_14px_30px_-10px_rgba(0,0,0,0.45)]"
    >
      <span className="absolute inset-0 translate-y-full bg-volt transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0" />
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
      className={`group absolute top-1/2 flex h-16 w-16 -translate-y-1/2 items-center justify-center text-ink/50 transition-colors hover:text-ink focus-visible:text-ink focus-visible:outline-none ${
        dir === "prev" ? "left-2 md:left-6" : "right-2 md:right-6"
      }`}
    >
      <svg
        viewBox="0 0 40 16"
        className={`h-4 w-10 transition-transform duration-300 ${
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
