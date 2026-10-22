const PHRASES = ["NEW DROPS", "IT'S US. NEVER THEM.", "NEW DROPS", "FREE EU SHIPPING OVER €150"];

function Run() {
  return (
    <div className="flex shrink-0 items-center" aria-hidden>
      {Array.from({ length: 3 }).flatMap((_, round) =>
        PHRASES.map((phrase, i) => (
          <span key={`${round}-${i}`} className="flex items-center">
            <span className="px-5">{phrase}</span>
            <span className="text-[10px]">✦</span>
          </span>
        )),
      )}
    </div>
  );
}

export default function Marquee() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 h-9 overflow-hidden border-t border-ink bg-volt text-ink">
      <p className="sr-only">New drops — It&apos;s us. Never them.</p>
      <div className="flex h-full w-max animate-marquee items-center text-[13px] font-black tracking-[-0.01em] whitespace-nowrap hover:[animation-play-state:paused]">
        <Run />
        <Run />
      </div>
    </footer>
  );
}
