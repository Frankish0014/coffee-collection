"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useShopStore } from "@/store/useShopStore";

const EASE = [0.76, 0, 0.24, 1] as const;

const CONTENT = {
  about: {
    title: ["It's us.", "Never them."],
    body: [
      "ITS US® is a Rotterdam studio making heavyweight essentials and outerwear in small, considered runs.",
      "No seasons, no noise — just drops. Every piece is cut to be worn hard and kept for years.",
    ],
  },
  contact: {
    title: ["Say", "hello."],
    body: ["studio@itsus.example", "@itsus.studio", "Witte de Withstraat 00, Rotterdam NL"],
  },
} as const;

export default function InfoOverlay() {
  const info = useShopStore((s) => s.info);
  const close = useShopStore((s) => s.closeInfo);

  return (
    <AnimatePresence>
      {info && (
        <motion.div
          key={info}
          role="dialog"
          aria-modal="true"
          aria-label={info}
          className="fixed inset-0 z-30 flex flex-col justify-center bg-paper px-6 md:px-10"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(100% 0 0% 0)" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <h2 className="text-[clamp(56px,13vw,220px)] leading-[0.82] font-black tracking-[-0.07em] uppercase">
            {CONTENT[info].title.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.25 + i * 0.08 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h2>
          <motion.div
            className="mt-10 grid max-w-3xl gap-2 font-mono text-xs tracking-[0.12em] text-ink/70 uppercase md:ml-[40%]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            {CONTENT[info].body.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </motion.div>
          <button
            type="button"
            onClick={close}
            className="absolute right-6 bottom-14 font-mono text-[10px] tracking-[0.2em] text-ink/60 uppercase hover:text-ink md:right-10"
          >
            Close ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
