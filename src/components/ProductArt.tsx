"use client";

import { useId } from "react";
import { brand } from "@/data/brand";
import type { ColorVariant, Product, ProductKind, Side } from "@/types/product";

/** Vertical position of the hook's inner curve within the 300×400 viewBox. */
export const HOOK_Y = 8;
export const ART_WIDTH = 300;

function mix(hex: string, target: string, amount: number) {
  const parse = (h: string) => {
    const n = parseInt(h.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const a = parse(hex);
  const b = parse(target);
  const out = a.map((v, i) => Math.round(v + (b[i] - v) * amount));
  return `rgb(${out[0]} ${out[1]} ${out[2]})`;
}

const darken = (hex: string, amount: number) => mix(hex, "#000000", amount);
const fill = (color: string) => ({ fill: color, transition: "fill 500ms ease" });
const stroke = (color: string) => ({ stroke: color, transition: "stroke 500ms ease" });

const OUTLINE = "rgba(0,0,0,0.16)";
const SEAM = "rgba(0,0,0,0.13)";
const FOLD = "rgba(0,0,0,0.07)";
const METAL = "#2c2622";
const SANS = { fontFamily: "var(--font-geist-sans)" };
const MONO = { fontFamily: "var(--font-geist-mono)" };

const HOOK = "M150 44 V30 C150 24 157 21 157 13 C157 6 152 2 146 2 C140 2 136 6 136 11";

type Mount = "hanger" | "hook" | "shelf";
const MOUNT: Record<ProductKind, Mount> = {
  tee: "hanger",
  hoodie: "hanger",
  sweatshirt: "hanger",
  cap: "hook",
  tote: "hook",
  keychain: "hook",
  mug: "shelf",
  bottle: "shelf",
};

interface ArtProps {
  product: Product;
  color: ColorVariant;
  side: Side;
  className?: string;
}

export default function ProductArt({ product, color, side, className }: ArtProps) {
  if (color.images) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={color.images[side]}
        alt={`${product.name} in ${color.name.toLowerCase()}, ${side}`}
        className={`object-contain ${className ?? ""}`}
        draggable={false}
      />
    );
  }
  return <Illustration product={product} color={color} side={side} className={className} />;
}

function Illustration({ product, color, side, className }: ArtProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const shade = `shade-${uid}`;
  const p = { product, color, side, shade };

  return (
    <svg
      viewBox="0 0 300 400"
      className={className}
      role="img"
      aria-label={`${product.name} in ${color.name.toLowerCase()}, ${side} view`}
    >
      <defs>
        <linearGradient id={shade} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.16" />
          <stop offset="0.22" stopColor="#000" stopOpacity="0" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.07" />
          <stop offset="0.8" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.18" />
        </linearGradient>
      </defs>

      <MountShape mount={MOUNT[product.kind]} />

      {product.kind === "tee" && <Tee {...p} />}
      {product.kind === "sweatshirt" && <Sweatshirt {...p} />}
      {product.kind === "hoodie" && <Hoodie {...p} />}
      {product.kind === "cap" && <Cap {...p} />}
      {product.kind === "mug" && <Mug {...p} />}
      {product.kind === "bottle" && <Bottle {...p} />}
      {product.kind === "tote" && <Tote {...p} />}
      {product.kind === "keychain" && <Keychain {...p} />}
    </svg>
  );
}

function MountShape({ mount }: { mount: Mount }) {
  return (
    <g fill="none" stroke={METAL} strokeLinecap="round" strokeLinejoin="round">
      <path d={HOOK} strokeWidth="3.2" />
      {mount === "hanger" && <path d="M150 44 L64 80 M150 44 L236 80" strokeWidth="3.6" />}
      {mount === "shelf" && (
        <>
          <path d="M150 44 L64 64 H236 Z" strokeWidth="2.6" />
          <path d="M64 64 V340 M236 64 V340" strokeWidth="1.3" />
          <rect x="54" y="340" width="192" height="11" rx="2" fill="#c9a27c" stroke="#a37c58" strokeWidth="1" />
          <rect x="54" y="349" width="192" height="2" fill="#a37c58" stroke="none" />
        </>
      )}
      <circle cx="150" cy="44" r="3.6" fill={METAL} stroke="none" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Prints                                                              */
/* ------------------------------------------------------------------ */

function Bean({ x, y, s, color, groove }: { x: number; y: number; s: number; color: string; groove: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-28) scale(${s})`}>
      <ellipse rx="7" ry="10" style={fill(color)} />
      <path d="M0 -9.4 C-4.2 -4 4.2 3.5 0 9.4" fill="none" style={stroke(groove)} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

function ChestMark({ x, y, color }: { x: number; y: number; color: ColorVariant }) {
  return (
    <g>
      <Bean x={x} y={y - 3} s={0.62} color={color.ink} groove={color.hex} />
      <text x={x + 8} y={y} fontSize="8.5" fontWeight="900" letterSpacing="0.3" style={{ ...SANS, ...fill(color.ink) }}>
        {brand.mark}
      </text>
    </g>
  );
}

function Statement({ top, color, size = 26 }: { top: number; color: ColorVariant; size?: number }) {
  const lines = ["COFFEE", "CULTURE,", "BEYOND", "THE CUP."];
  return (
    <g style={{ ...SANS, ...fill(color.ink) }}>
      {lines.map((line, i) => (
        <text key={line} x="150" y={top + i * size * 0.98} fontSize={size} fontWeight="900" textAnchor="middle" letterSpacing={-size * 0.04}>
          {line}
        </text>
      ))}
      <text x="150" y={top + lines.length * size * 0.98 + 4} fontSize="6" fontWeight="600" textAnchor="middle" letterSpacing="1.6" style={MONO}>
        INSPIRED BY COFFEE · DESIGNED FOR EVERYDAY LIFE
      </text>
    </g>
  );
}

function NeckTag({ y, color }: { y: number; color: ColorVariant }) {
  return (
    <g>
      <rect x="134" y={y} width="32" height="11" rx="1" style={fill(color.ink)} />
      <text x="150" y={y + 7.6} fontSize="5.4" fontWeight="900" textAnchor="middle" style={{ ...SANS, ...fill(color.hex) }}>
        {brand.mark}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Apparel                                                             */
/* ------------------------------------------------------------------ */

interface PartProps {
  product: Product;
  color: ColorVariant;
  side: Side;
  shade: string;
}

function Body({ d, color, shade }: { d: string; color: ColorVariant; shade: string }) {
  return (
    <>
      <path d={d} style={fill(color.hex)} stroke={OUTLINE} strokeWidth="1" />
      <path d={d} fill={`url(#${shade})`} pointerEvents="none" />
    </>
  );
}

function Folds() {
  return (
    <g fill="none" stroke={FOLD} strokeWidth="1.6" strokeLinecap="round">
      <path d="M100 160 Q112 250 96 340" />
      <path d="M204 150 Q192 246 208 342" />
      <path d="M150 290 Q156 320 148 352" />
    </g>
  );
}

function CrewNeck({ front, color }: { front: boolean; color: ColorVariant }) {
  return front ? (
    <>
      <path d="M118 66 C130 73 170 73 182 66 Q150 104 118 66 Z" style={fill(darken(color.hex, 0.32))} />
      <rect x="144" y="70" width="12" height="6" rx="1" fill="#f4efe7" opacity="0.9" />
      <path d="M118 66 Q150 104 182 66" fill="none" style={stroke(darken(color.hex, 0.1))} strokeWidth="6" strokeLinecap="round" />
    </>
  ) : (
    <path d="M118 66 C130 76 170 76 182 66" fill="none" style={stroke(darken(color.hex, 0.1))} strokeWidth="6" strokeLinecap="round" />
  );
}

function ApparelPrints({ product, color, side, chest, statementTop }: PartProps & { chest: [number, number]; statementTop: number }) {
  const { front, back } = product.print;
  if (side === "front") {
    if (front === "chest") return <ChestMark x={chest[0]} y={chest[1]} color={color} />;
    if (front === "big")
      return (
        <g style={{ ...SANS, ...fill(color.ink) }}>
          <text x="150" y="190" fontSize="44" fontWeight="900" textAnchor="middle" letterSpacing="-2">BEYOND</text>
          <text x="150" y="232" fontSize="44" fontWeight="900" textAnchor="middle" letterSpacing="-2">THE CUP.</text>
          <text x="150" y="252" fontSize="6.5" fontWeight="600" textAnchor="middle" letterSpacing="2.2" style={MONO}>
            COFFEE CULTURE · {brand.mark}
          </text>
        </g>
      );
    return null;
  }
  if (back === "statement") return <Statement top={statementTop} color={color} />;
  if (back === "bean")
    return (
      <g>
        <Bean x={150} y={statementTop + 30} s={4} color={color.ink} groove={color.hex} />
        <text x="150" y={statementTop + 104} fontSize="7" fontWeight="700" textAnchor="middle" letterSpacing="2" style={{ ...MONO, ...fill(color.ink) }}>
          SIMPLE BY DESIGN
        </text>
      </g>
    );
  if (back === "tag") return <NeckTag y={80} color={color} />;
  return null;
}

function Tee(props: PartProps) {
  const { color, side, shade } = props;
  const d =
    "M118 66 C130 73 170 73 182 66 L238 82 L280 142 L247 160 L232 138 L234 378 Q150 386 66 378 L68 138 L53 160 L20 142 L62 82 Z";
  return (
    <>
      <Body d={d} color={color} shade={shade} />
      <Folds />
      <g fill="none" stroke={SEAM} strokeWidth="1" strokeDasharray="3 2.5">
        <path d="M273 132 L240 150" />
        <path d="M27 132 L60 150" />
        <path d="M67 366 Q150 374 233 366" />
      </g>
      <CrewNeck front={side === "front"} color={color} />
      <ApparelPrints {...props} chest={[188, 134]} statementTop={136} />
    </>
  );
}

const LONG_SLEEVES = [
  "M234 82 Q262 88 268 136 L278 336 L248 340 L238 168 Z",
  "M66 82 Q38 88 32 136 L22 336 L52 340 L62 168 Z",
];
const LONG_CUFFS = ["M277 314 L278 336 L248 340 L247 318 Z", "M23 314 L22 336 L52 340 L53 318 Z"];

function Sweatshirt(props: PartProps) {
  const { color, side, shade } = props;
  const d = "M118 66 C130 73 170 73 182 66 L236 82 Q246 92 238 128 L236 378 Q150 386 64 378 L62 128 Q54 92 64 82 Z";
  return (
    <>
      <Body d={d} color={color} shade={shade} />
      {LONG_SLEEVES.map((s) => (
        <Body key={s} d={s} color={color} shade={shade} />
      ))}
      {LONG_CUFFS.map((s) => (
        <path key={s} d={s} style={fill(darken(color.hex, 0.07))} stroke={SEAM} />
      ))}
      <path d="M64 356 H236 V378 Q150 386 64 378 Z" style={fill(darken(color.hex, 0.07))} stroke={SEAM} />
      <g fill="none" stroke={SEAM} strokeWidth="0.8">
        {[80, 100, 120, 140, 160, 180, 200, 220].map((x) => (
          <path key={x} d={`M${x} 359 V378`} />
        ))}
      </g>
      <Folds />
      <CrewNeck front={side === "front"} color={color} />
      <ApparelPrints {...props} chest={[186, 132]} statementTop={140} />
    </>
  );
}

function Hoodie(props: PartProps) {
  const { color, side, shade } = props;
  const front = side === "front";
  const d = "M116 64 C130 71 170 71 184 64 L240 82 Q250 94 242 130 L244 362 L56 362 L58 130 Q50 94 60 82 Z";
  const sleeves = [
    "M238 82 Q270 90 276 140 L284 344 L250 348 L244 168 Z",
    "M62 82 Q30 90 24 140 L16 344 L50 348 L56 168 Z",
  ];
  const cuffs = ["M283 324 L284 344 L250 348 L249 328 Z", "M17 324 L16 344 L50 348 L51 328 Z"];
  const cord = mix(color.hex, color.ink, 0.6);

  return (
    <>
      {front && <path d="M100 86 C88 28 212 28 200 86 Z" style={fill(darken(color.hex, 0.08))} stroke={OUTLINE} />}
      <Body d={d} color={color} shade={shade} />
      {sleeves.map((s) => (
        <Body key={s} d={s} color={color} shade={shade} />
      ))}
      {cuffs.map((s) => (
        <path key={s} d={s} style={fill(darken(color.hex, 0.08))} stroke={SEAM} />
      ))}
      <path d="M56 340 H244 V362 H56 Z" style={fill(darken(color.hex, 0.08))} stroke={SEAM} />
      <Folds />
      {front ? (
        <>
          <path d="M116 64 C130 71 170 71 184 64 Q150 116 116 64 Z" style={fill(darken(color.hex, 0.38))} />
          <path d="M116 64 Q150 116 184 64" fill="none" style={stroke(darken(color.hex, 0.12))} strokeWidth="5" />
          <g fill="none" strokeWidth="2.4" strokeLinecap="round" style={stroke(cord)}>
            <path d="M139 92 L135 164" />
            <path d="M161 92 L165 164" />
          </g>
          <rect x="132.5" y="162" width="5" height="9" rx="1.5" style={fill(darken(cord, 0.2))} />
          <rect x="162.5" y="162" width="5" height="9" rx="1.5" style={fill(darken(cord, 0.2))} />
          <path d="M92 252 H208 L224 330 H76 Z" fill="none" stroke={SEAM} strokeWidth="1.2" />
          <path d="M92 252 Q98 292 80 322 M208 252 Q202 292 220 322" fill="none" stroke={SEAM} strokeWidth="1" />
        </>
      ) : (
        <>
          <path d="M108 64 C108 64 116 176 150 178 C184 176 192 64 192 64 Q150 80 108 64 Z" style={fill(darken(color.hex, 0.06))} stroke={OUTLINE} />
          <path d="M150 74 V176" fill="none" stroke={SEAM} />
        </>
      )}
      <ApparelPrints {...props} chest={[190, 148]} statementTop={210} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Objects                                                             */
/* ------------------------------------------------------------------ */

function Cap({ product, color, side, shade }: PartProps) {
  const front = side === "front";
  const crown = "M70 252 C70 132 230 132 230 252 Z";
  return (
    <>
      <path d="M150 46 V162" stroke={METAL} strokeWidth="1.4" opacity="0.7" />
      <Body d={crown} color={color} shade={shade} />
      <g fill="none" stroke={SEAM} strokeWidth="1">
        <path d="M150 164 V252" />
        <path d="M150 164 C116 176 100 210 100 252" />
        <path d="M150 164 C184 176 200 210 200 252" />
      </g>
      <circle cx="150" cy="163" r="6" style={fill(darken(color.hex, 0.12))} />
      {[112, 188].map((x) => (
        <circle key={x} cx={x} cy="198" r="2" style={fill(darken(color.hex, 0.25))} />
      ))}
      {front ? (
        <>
          <path d="M70 250 C110 262 190 262 230 250" fill="none" stroke={SEAM} strokeWidth="1.2" />
          <path d="M80 280 C120 298 180 298 220 280" fill="none" style={stroke(darken(color.hex, 0.35))} strokeWidth="4" opacity="0.35" />
          <Body d="M58 252 C92 294 208 294 242 252 C204 264 96 264 58 252 Z" color={color} shade={shade} />
          <path d="M66 258 C100 286 200 286 234 258" fill="none" stroke={SEAM} strokeDasharray="3 2.5" />
          {product.print.front === "bean" && (
            <>
              <Bean x={150} y={204} s={1.6} color={color.ink} groove={color.hex} />
              <text x="150" y="232" fontSize="7.5" fontWeight="900" textAnchor="middle" letterSpacing="0.6" style={{ ...SANS, ...fill(color.ink) }}>
                {brand.mark}
              </text>
            </>
          )}
        </>
      ) : (
        <>
          <path d="M114 252 Q150 206 186 252 Z" style={fill(darken(color.hex, 0.42))} />
          <path d="M110 240 H190" strokeWidth="7" style={stroke(darken(color.hex, 0.1))} />
          <rect x="140" y="234" width="20" height="12" rx="2" fill="#b9a58c" stroke="#8d7a62" />
          <NeckTag y={184} color={color} />
        </>
      )}
    </>
  );
}

function Mug({ product, color, side, shade }: PartProps) {
  const front = side === "front";
  const body = "M94 214 V322 Q94 340 112 340 H188 Q206 340 206 322 V214 Z";
  const handle = front ? "M206 236 C234 236 236 300 206 304" : "M94 236 C66 236 64 300 94 304";
  return (
    <>
      <path d={handle} fill="none" style={stroke(darken(color.hex, 0.06))} strokeWidth="13" strokeLinecap="round" />
      <path d={handle} fill="none" stroke={OUTLINE} strokeWidth="13.5" strokeLinecap="round" opacity="0.35" />
      <Body d={body} color={color} shade={shade} />
      <ellipse cx="150" cy="214" rx="56" ry="9" style={fill(darken(color.hex, 0.08))} stroke={OUTLINE} />
      <ellipse cx="150" cy="215" rx="49" ry="6.5" fill="#3a2418" />
      <ellipse cx="150" cy="215" rx="40" ry="4.6" fill="none" stroke="#9a6a45" strokeWidth="1.2" opacity="0.7" />
      <g fill="#fff" opacity="0.5">
        <path d="M140 196 C136 186 146 182 142 172" fill="none" stroke="#c8b8a6" strokeWidth="2" strokeLinecap="round" />
        <path d="M158 198 C154 188 164 184 160 174" fill="none" stroke="#c8b8a6" strokeWidth="2" strokeLinecap="round" />
      </g>
      {front && product.print.front === "big" && (
        <g style={{ ...SANS, ...fill(color.ink) }}>
          <text x="150" y="268" fontSize="21" fontWeight="900" textAnchor="middle" letterSpacing="-0.8">BEYOND</text>
          <text x="150" y="290" fontSize="21" fontWeight="900" textAnchor="middle" letterSpacing="-0.8">THE CUP.</text>
          <text x="150" y="306" fontSize="5.5" fontWeight="600" textAnchor="middle" letterSpacing="1.6" style={MONO}>
            {brand.mark}
          </text>
        </g>
      )}
      {!front && product.print.back === "bean" && <Bean x={150} y={276} s={2.6} color={color.ink} groove={color.hex} />}
    </>
  );
}

function Bottle({ product, color, side, shade }: PartProps) {
  const front = side === "front";
  const lid = darken(color.hex, 0.35);
  const body = "M112 152 Q112 132 132 126 H168 Q188 132 188 152 V326 Q188 340 174 340 H126 Q112 340 112 326 Z";
  return (
    <>
      <path d="M138 100 C138 76 162 76 162 100" fill="none" style={stroke(lid)} strokeWidth="6" strokeLinecap="round" />
      <rect x="128" y="96" width="44" height="32" rx="6" style={fill(lid)} stroke={OUTLINE} />
      <path d="M130 106 H170 M130 114 H170" stroke="rgba(255,255,255,0.12)" />
      <Body d={body} color={color} shade={shade} />
      <rect x="124" y="146" width="9" height="184" rx="4.5" fill="#fff" opacity="0.16" />
      {front && product.print.front === "big" && (
        <g transform="rotate(-90 156 236)" style={{ ...SANS, ...fill(color.ink) }}>
          <text x="156" y="236" fontSize="19" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
            BEYOND THE CUP.
          </text>
          <text x="156" y="248" fontSize="6" fontWeight="600" textAnchor="middle" letterSpacing="2" style={MONO}>
            COFFEE CULTURE
          </text>
        </g>
      )}
      {!front && product.print.back === "bean" && (
        <>
          <Bean x={150} y={226} s={2.2} color={color.ink} groove={color.hex} />
          <text x="150" y="268" fontSize="7" fontWeight="900" textAnchor="middle" style={{ ...SANS, ...fill(color.ink) }}>
            {brand.mark}
          </text>
        </>
      )}
    </>
  );
}

function Tote({ product, color, side, shade }: PartProps) {
  const front = side === "front";
  const strap = darken(color.hex, 0.1);
  const body = "M66 158 H234 L244 380 Q244 386 238 386 H62 Q56 386 56 380 Z";
  return (
    <>
      <path d="M104 164 C104 98 140 50 150 46 C160 50 196 98 196 164" fill="none" style={stroke(strap)} strokeWidth="9" strokeLinecap="round" />
      <path d="M104 164 C104 98 140 50 150 46 C160 50 196 98 196 164" fill="none" stroke={OUTLINE} strokeWidth="9.5" opacity="0.3" />
      <Body d={body} color={color} shade={shade} />
      <path d="M65 178 H235" fill="none" stroke={SEAM} strokeDasharray="3 2.5" />
      {[104, 196].map((x) => (
        <g key={x}>
          <rect x={x - 8} y="158" width="16" height="20" style={fill(strap)} stroke={SEAM} />
          <path d={`M${x - 6} 160 L${x + 6} 176 M${x + 6} 160 L${x - 6} 176`} stroke={SEAM} />
        </g>
      ))}
      <g fill="none" stroke={FOLD} strokeWidth="1.6" strokeLinecap="round">
        <path d="M96 200 Q104 290 90 372" />
        <path d="M210 196 Q200 290 214 372" />
      </g>
      {front && product.print.front === "bean" && (
        <g>
          <Bean x={150} y={252} s={3.2} color={color.ink} groove={color.hex} />
          <text x="150" y="318" fontSize="20" fontWeight="900" textAnchor="middle" letterSpacing="-0.6" style={{ ...SANS, ...fill(color.ink) }}>
            COFFEE
          </text>
          <text x="150" y="334" fontSize="7" fontWeight="600" textAnchor="middle" letterSpacing="3.2" style={{ ...MONO, ...fill(color.ink) }}>
            COLLECTION
          </text>
        </g>
      )}
      {!front && product.print.back === "statement" && <Statement top={222} color={color} size={24} />}
    </>
  );
}

function Keychain({ color, side }: PartProps) {
  const front = side === "front";
  const grain = darken(color.hex, 0.18);
  return (
    <>
      <circle cx="150" cy="62" r="16" fill="none" stroke="#a59b90" strokeWidth="3.2" />
      <circle cx="150" cy="62" r="16" fill="none" stroke="#fff" strokeWidth="1" opacity="0.4" strokeDasharray="10 90" />
      {[88, 104].map((y) => (
        <ellipse key={y} cx="150" cy={y} rx="4.5" ry="8" fill="none" stroke="#a59b90" strokeWidth="2.6" />
      ))}
      <circle cx="150" cy="122" r="5" fill="none" stroke="#a59b90" strokeWidth="2.6" />
      <ellipse cx="150" cy="214" rx="62" ry="86" style={fill(color.hex)} stroke={OUTLINE} />
      <g fill="none" style={stroke(grain)} strokeWidth="1" opacity="0.5">
        <path d="M108 160 Q120 214 104 270" />
        <path d="M196 166 Q182 220 198 268" />
        <path d="M126 140 Q140 214 124 292" />
      </g>
      <circle cx="150" cy="138" r="4" fill="#f5f1ea" stroke={OUTLINE} />
      {front ? (
        <>
          <path d="M150 146 C116 186 184 246 150 292" fill="none" style={stroke(darken(color.hex, 0.4))} strokeWidth="7" strokeLinecap="round" />
          <path d="M152 148 C120 188 186 246 154 290" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.25" />
        </>
      ) : (
        <g style={{ ...SANS, ...fill(darken(color.hex, 0.35)) }}>
          <text x="150" y="208" fontSize="17" fontWeight="900" textAnchor="middle">COFFEE</text>
          <text x="150" y="226" fontSize="7" fontWeight="700" textAnchor="middle" letterSpacing="2.4" style={MONO}>
            COLLECTION
          </text>
        </g>
      )}
    </>
  );
}
