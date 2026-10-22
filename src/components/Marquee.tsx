import { brand } from "@/data/brand";

const PHRASES = [
  brand.status.toUpperCase(),
  brand.campaign.toUpperCase(),
  brand.collectionHeading.toUpperCase(),
  brand.statement.toUpperCase(),
];

function Run() {
  return (
    <div className="flex shrink-0 items-center" aria-hidden>
      {Array.from({ length: 3 }).flatMap((_, round) =>
        PHRASES.map((phrase, i) => (
          <span key={`${round}-${i}`} className="flex items-center">
            <span className="px-5">{phrase}</span>
            <svg viewBox="-8 -11 16 22" className="h-3 w-3 -rotate-[28deg]" aria-hidden>
              <ellipse rx="7" ry="10" fill="currentColor" />
              <path d="M0 -9.4 C-4.2 -4 4.2 3.5 0 9.4" fill="none" stroke="var(--color-crema)" strokeWidth="1.6" />
            </svg>
          </span>
        )),
      )}
    </div>
  );
}

export default function Marquee() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 h-9 overflow-hidden border-t border-ink bg-crema text-ink">
      <p className="sr-only">
        {brand.status} — {brand.campaign}
      </p>
      <div className="flex h-full w-max animate-marquee items-center text-[13px] font-black tracking-[-0.01em] whitespace-nowrap hover:[animation-play-state:paused]">
        <Run />
        <Run />
      </div>
    </footer>
  );
}
