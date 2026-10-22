"use client";

import { AnimatePresence, motion } from "framer-motion";
import { brand } from "@/data/brand";
import { selectCartCount, useShopStore } from "@/store/useShopStore";

const link =
  "relative whitespace-nowrap py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink transition-opacity hover:opacity-50 focus-visible:outline-none focus-visible:underline underline-offset-4 md:text-[11px] md:tracking-[0.2em]";

export default function Header() {
  const openInfo = useShopStore((s) => s.openInfo);
  const openCart = useShopStore((s) => s.openCart);
  const unfocus = useShopStore((s) => s.unfocus);
  const closeInfo = useShopStore((s) => s.closeInfo);
  const count = useShopStore(selectCartCount);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <nav className="pointer-events-auto grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 md:px-10">
        <div className="justify-self-start">
          <button type="button" className={link} onClick={() => openInfo("about")}>
            About
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            unfocus();
            closeInfo();
          }}
          className="flex flex-col items-center justify-self-center leading-none text-ink focus-visible:outline-none"
          aria-label={`${brand.name} — back to the collection`}
        >
          <span className="text-[19px] font-black tracking-[-0.06em] md:text-[22px]">{brand.logo.primary}</span>
          <span className="mt-[3px] font-mono text-[7px] font-medium tracking-[0.42em] md:text-[8px]">
            {brand.logo.secondary}
          </span>
        </button>

        <div className="flex items-center gap-1.5 justify-self-end md:gap-2">
          <button type="button" className={link} onClick={openCart}>
            Cart
            <span className="ml-1 inline-flex min-w-[1.5ch] justify-center tabular-nums">
              (
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={count}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block"
                >
                  {count}
                </motion.span>
              </AnimatePresence>
              )
            </span>
          </button>
          <span className="text-[11px] font-semibold text-ink/40">/</span>
          <button type="button" className={link} onClick={() => openInfo("contact")}>
            Contact
          </button>
        </div>
      </nav>
    </header>
  );
}
