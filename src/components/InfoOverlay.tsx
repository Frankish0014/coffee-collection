"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WhatsAppIcon } from "@/components/DetailDrawer";
import { brand, launchListMessage, mailtoLink, telLink, whatsappLink } from "@/data/brand";
import { useShopStore } from "@/store/useShopStore";

const EASE = [0.76, 0, 0.24, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
});

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
          aria-label={info === "about" ? "Our story" : "Contact"}
          className="no-scrollbar fixed inset-0 z-30 overflow-y-auto bg-paper"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(100% 0 0% 0)" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className="mx-auto max-w-6xl px-5 pt-28 pb-28 md:px-10">
            {info === "about" ? <About /> : <Contact />}
          </div>
          <button
            type="button"
            onClick={close}
            className="fixed right-5 bottom-14 z-10 rounded-full bg-paper/90 px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] text-ink/60 uppercase backdrop-blur hover:text-ink md:right-10"
          >
            Close ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Headline({ lines }: { lines: readonly string[] }) {
  return (
    <h2 className="text-[clamp(48px,10vw,160px)] leading-[0.84] font-black tracking-[-0.07em] uppercase">
      {lines.map((line, i) => (
        <span key={line} className="block overflow-hidden pb-[0.04em]">
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
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[10px] tracking-[0.22em] text-ink/45 uppercase">{children}</p>;
}

function About() {
  return (
    <>
      <motion.div {...fadeUp(0.15)}>
        <Eyebrow>Our Story — {brand.status}</Eyebrow>
      </motion.div>
      <div className="mt-6">
        <Headline lines={["Coffee culture,", "beyond the cup."]} />
      </div>

      <div className="mt-14 grid gap-10 md:grid-cols-[1fr_1.3fr] md:gap-16">
        <motion.p {...fadeUp(0.5)} className="text-xl leading-snug font-bold tracking-tight md:text-2xl">
          {brand.statement}
        </motion.p>
        <motion.div {...fadeUp(0.6)} className="space-y-4 text-[15px] leading-relaxed text-ink/70">
          {brand.story.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p className="pt-2 font-semibold text-ink">{brand.story.closing}</p>
        </motion.div>
      </div>

      <motion.section {...fadeUp(0.7)} className="mt-24 border-t border-ink/15 pt-10">
        <Eyebrow>{brand.materials.heading}</Eyebrow>
        <div className="mt-5 grid gap-10 md:grid-cols-[1fr_1.3fr] md:gap-16">
          <h3 className="text-3xl leading-[0.95] font-black tracking-[-0.04em] md:text-5xl">
            {brand.materials.title}
          </h3>
          <div className="space-y-4 text-[15px] leading-relaxed text-ink/70">
            {brand.materials.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>

        <ul className="mt-12 grid gap-px overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-5">
          {brand.materials.criteria.map((c, i) => (
            <li key={c.title} className="bg-paper p-6">
              <p className="font-mono text-[10px] tracking-[0.2em] text-ink/40">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-6 text-lg font-black tracking-tight">{c.title}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink/60">{c.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-2xl font-mono text-[11px] leading-relaxed tracking-[0.04em] text-ink/50">
          {brand.materials.note}
        </p>
      </motion.section>

      <Newsletter />
    </>
  );
}

function Contact() {
  const rows = [
    {
      label: "Email",
      value: brand.contact.email,
      href: mailtoLink(`Hello ${brand.name}`),
      external: false,
    },
    {
      label: "WhatsApp",
      value: brand.contact.phoneDisplay,
      href: whatsappLink(`Hi ${brand.name}!`),
      external: true,
    },
    {
      label: "Call",
      value: brand.contact.phoneDisplay,
      href: telLink,
      external: false,
    },
  ];

  return (
    <>
      <motion.div {...fadeUp(0.15)}>
        <Eyebrow>Contact — {brand.status}</Eyebrow>
      </motion.div>
      <div className="mt-6">
        <Headline lines={["Say", "hello."]} />
      </div>
      <motion.p {...fadeUp(0.45)} className="mt-8 max-w-xl text-[15px] leading-relaxed text-ink/70">
        Questions about the collection, reservations, or collaborations — reach us by email, WhatsApp, or a
        quick call.
      </motion.p>

      <ul className="mt-12 border-t border-ink/15">
        {rows.map((row, i) => (
          <motion.li key={row.label} {...fadeUp(0.5 + i * 0.08)} className="border-b border-ink/15">
            <a
              href={row.href}
              target={row.external ? "_blank" : undefined}
              rel={row.external ? "noreferrer" : undefined}
              className="group grid grid-cols-[88px_1fr_auto] items-center gap-4 py-6 md:grid-cols-[160px_1fr_auto] md:py-8"
            >
              <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-ink/45 uppercase">
                {row.label === "WhatsApp" && <WhatsAppIcon className="h-3 w-3" />}
                {row.label}
              </span>
              <span className="min-w-0 text-[clamp(17px,3.6vw,44px)] leading-none font-black tracking-[-0.04em] break-words transition-transform duration-500 group-hover:translate-x-2">
                {row.value}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
                ↗
              </span>
            </a>
          </motion.li>
        ))}
      </ul>

      <Newsletter />
    </>
  );
}

function Newsletter() {
  return (
    <motion.section
      {...fadeUp(0.8)}
      className="mt-24 grid gap-8 rounded-[4px] bg-roast p-8 text-paper md:grid-cols-[1.2fr_1fr] md:items-end md:p-12"
    >
      <div>
        <p className="font-mono text-[10px] tracking-[0.22em] text-crema uppercase">Launch list</p>
        <h3 className="mt-4 text-3xl leading-[0.95] font-black tracking-[-0.04em] md:text-5xl">
          {brand.newsletter.title}
        </h3>
        <p className="mt-4 max-w-md text-[14px] leading-relaxed text-paper/65">{brand.newsletter.body}</p>
      </div>
      <div className="flex flex-col gap-2">
        <a
          href={whatsappLink(launchListMessage)}
          target="_blank"
          rel="noreferrer"
          className="flex h-14 items-center justify-center gap-2.5 bg-crema text-[11px] font-black tracking-[0.22em] text-ink uppercase transition-colors hover:bg-paper"
        >
          <WhatsAppIcon className="h-4 w-4" /> Join on WhatsApp
        </a>
        <a
          href={mailtoLink(`Join the ${brand.name} launch list`, launchListMessage)}
          className="flex h-12 items-center justify-center border border-paper/25 text-[10px] font-bold tracking-[0.22em] uppercase transition-colors hover:border-paper"
        >
          Join by email
        </a>
        <p className="mt-3 text-center font-mono text-[10px] tracking-[0.14em] text-paper/40 uppercase">
          {brand.tagline}
        </p>
      </div>
    </motion.section>
  );
}
