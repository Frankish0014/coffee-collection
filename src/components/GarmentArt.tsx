"use client";

import { useId } from "react";
import type { ColorVariant, GarmentKind, Product, Side } from "@/types/product";

/** Vertical position of the hanger hook's inner curve within the 300×400 viewBox. */
export const HOOK_Y = 8;
export const ART_WIDTH = 300;

function mix(hex: string, target: string, amount: number) {
  const parse = (h: string) => {
    const n = parseInt(h.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const a = parse(hex);
  const b = parse(target);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * amount));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
}

const darken = (hex: string, amount: number) => mix(hex, "#000000", amount);
const lighten = (hex: string, amount: number) => mix(hex, "#ffffff", amount);

const OUTLINE = "rgba(0,0,0,0.16)";
const SEAM = "rgba(0,0,0,0.13)";
const FOLD = "rgba(0,0,0,0.07)";

const BODY: Record<GarmentKind, string> = {
  tee: "M118 66 C130 73 170 73 182 66 L238 82 L280 142 L247 160 L232 138 L234 378 Q150 386 66 378 L68 138 L53 160 L20 142 L62 82 Z",
  longsleeve:
    "M118 66 C130 73 170 73 182 66 L236 82 Q246 92 238 128 L236 378 Q150 386 64 378 L62 128 Q54 92 64 82 Z",
  shirt:
    "M120 64 C132 70 168 70 180 64 L236 82 Q246 92 238 128 L236 368 Q236 392 204 388 Q150 380 96 388 Q64 392 64 368 L62 128 Q54 92 64 82 Z",
  jacket:
    "M116 64 C130 71 170 71 184 64 L240 82 Q250 94 242 130 L244 362 L56 362 L58 130 Q50 94 60 82 Z",
};

const SLEEVES: Partial<Record<GarmentKind, { arms: string[]; cuffs: string[] }>> = {
  longsleeve: {
    arms: [
      "M234 82 Q262 88 268 136 L278 336 L248 340 L238 168 Z",
      "M66 82 Q38 88 32 136 L22 336 L52 340 L62 168 Z",
    ],
    cuffs: ["M277 316 L278 336 L248 340 L247 320 Z", "M23 316 L22 336 L52 340 L53 320 Z"],
  },
  shirt: {
    arms: [
      "M234 82 Q262 88 268 136 L278 336 L248 340 L238 168 Z",
      "M66 82 Q38 88 32 136 L22 336 L52 340 L62 168 Z",
    ],
    cuffs: ["M276 306 L278 336 L248 340 L246 310 Z", "M24 306 L22 336 L52 340 L54 310 Z"],
  },
  jacket: {
    arms: [
      "M238 82 Q270 90 276 140 L284 344 L250 348 L244 168 Z",
      "M62 82 Q30 90 24 140 L16 344 L50 348 L56 168 Z",
    ],
    cuffs: ["M283 326 L284 344 L250 348 L249 330 Z", "M17 326 L16 344 L50 348 L51 330 Z"],
  },
};

const CHEST_PRINT: Record<GarmentKind, [number, number]> = {
  tee: [194, 134],
  longsleeve: [194, 132],
  shirt: [194, 132],
  jacket: [198, 152],
};

interface GarmentArtProps {
  product: Product;
  color: ColorVariant;
  side: Side;
  className?: string;
}

export default function GarmentArt({ product, color, side, className }: GarmentArtProps) {
  if (color.images) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={color.images[side]}
        alt={`${product.name} in ${color.name.toLowerCase()}, ${side}`}
        className={className}
        draggable={false}
      />
    );
  }

  return <Illustration product={product} color={color} side={side} className={className} />;
}

function Illustration({ product, color, side, className }: GarmentArtProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const { kind, print } = product;
  const { hex, ink } = color;
  const fill = (c: string) => ({ fill: c, transition: "fill 500ms ease" });
  const sleeves = SLEEVES[kind];
  const isFront = side === "front";
  const shadeId = `shade-${uid}`;
  const [chestX, chestY] = CHEST_PRINT[kind];

  return (
    <svg
      viewBox="0 0 300 400"
      className={className}
      role="img"
      aria-label={`${product.name} in ${color.name.toLowerCase()}, ${side} view`}
    >
      <defs>
        <linearGradient id={shadeId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.14" />
          <stop offset="0.22" stopColor="#000" stopOpacity="0" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="0.8" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.16" />
        </linearGradient>
      </defs>

      {/* Hanger */}
      <g fill="none" stroke="#2c2c2c" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M150 44 V30 C150 24 157 21 157 13 C157 6 152 2 146 2 C140 2 136 6 136 11"
          strokeWidth="3.2"
        />
        <path d="M150 44 L64 80 M150 44 L236 80" strokeWidth="3.6" />
      </g>
      <circle cx="150" cy="44" r="3.6" fill="#2c2c2c" />

      {/* Body */}
      <path d={BODY[kind]} style={fill(hex)} stroke={OUTLINE} strokeWidth="1" />

      {sleeves?.arms.map((d) => (
        <path key={d} d={d} style={fill(hex)} stroke={OUTLINE} strokeWidth="1" />
      ))}
      {sleeves?.cuffs.map((d) => (
        <path key={d} d={d} style={fill(darken(hex, 0.07))} stroke={SEAM} strokeWidth="1" />
      ))}

      {/* Volume shading */}
      <path d={BODY[kind]} fill={`url(#${shadeId})`} pointerEvents="none" />
      {sleeves?.arms.map((d) => (
        <path key={`s-${d}`} d={d} fill={`url(#${shadeId})`} opacity="0.7" />
      ))}

      {/* Folds */}
      <g fill="none" stroke={FOLD} strokeWidth="1.6" strokeLinecap="round">
        <path d="M100 160 Q112 250 96 350" />
        <path d="M204 150 Q192 246 208 352" />
        <path d="M150 300 Q156 330 148 370" />
      </g>

      {kind === "tee" && (
        <g fill="none" stroke={SEAM} strokeWidth="1" strokeDasharray="3 2.5">
          <path d="M273 132 L240 150" />
          <path d="M27 132 L60 150" />
          <path d="M67 366 Q150 374 233 366" />
        </g>
      )}

      {(kind === "tee" || kind === "longsleeve") && (
        <>
          {isFront ? (
            <>
              <path
                d="M118 66 C130 73 170 73 182 66 Q150 104 118 66 Z"
                style={fill(darken(hex, 0.32))}
              />
              <rect x="144" y="70" width="12" height="6" rx="1" fill="#f4f4f1" opacity="0.9" />
              <path
                d="M118 66 Q150 104 182 66"
                fill="none"
                style={{ stroke: darken(hex, 0.1), transition: "stroke 500ms ease" }}
                strokeWidth="6"
                strokeLinecap="round"
              />
            </>
          ) : (
            <path
              d="M118 66 C130 76 170 76 182 66"
              fill="none"
              style={{ stroke: darken(hex, 0.1), transition: "stroke 500ms ease" }}
              strokeWidth="6"
              strokeLinecap="round"
            />
          )}
        </>
      )}

      {kind === "shirt" &&
        (isFront ? (
          <>
            <path d="M120 64 C132 70 168 70 180 64 L150 94 Z" style={fill(darken(hex, 0.3))} />
            <path d="M143 94 H157 V384 H143 Z" style={fill(hex)} stroke={SEAM} strokeWidth="1" />
            {[112, 150, 188, 226, 264, 302, 340].map((y) => (
              <circle key={y} cx="150" cy={y} r="2.8" style={fill(mix(hex, ink, 0.22))} />
            ))}
            <path d="M178 140 h34 v36 l-17 6 l-17 -6 Z" fill="none" stroke={SEAM} strokeWidth="1" />
            <path d="M120 62 Q140 66 150 94 L132 112 L110 74 Z" style={fill(lighten(hex, 0.04))} stroke={OUTLINE} />
            <path d="M180 62 Q160 66 150 94 L168 112 L190 74 Z" style={fill(lighten(hex, 0.04))} stroke={OUTLINE} />
            <circle cx="133" cy="105" r="1.6" style={fill(mix(hex, ink, 0.22))} />
            <circle cx="167" cy="105" r="1.6" style={fill(mix(hex, ink, 0.22))} />
          </>
        ) : (
          <>
            <path d="M120 62 Q150 72 180 62 L182 72 Q150 84 118 72 Z" style={fill(darken(hex, 0.05))} stroke={OUTLINE} />
            <g fill="none" stroke={SEAM} strokeWidth="1">
              <path d="M64 118 Q150 126 236 118" />
              <path d="M150 124 V184 M144 124 V150 M156 124 V150" />
            </g>
          </>
        ))}

      {kind === "jacket" && (
        <>
          <path d="M56 342 H244 V362 H56 Z" style={fill(darken(hex, 0.08))} stroke={SEAM} />
          {isFront ? (
            <>
              <path d="M116 64 C130 71 170 71 184 64 L150 98 Z" style={fill(darken(hex, 0.35))} />
              <path d="M150 98 V362" stroke={darken(hex, 0.3)} strokeWidth="1.6" />
              {[132, 182, 232, 282, 328].map((y) => (
                <g key={y}>
                  <circle cx="150" cy={y} r="3.8" style={fill(darken(hex, 0.25))} />
                  <circle cx="149" cy={y - 1} r="1.4" fill="#fff" opacity="0.35" />
                </g>
              ))}
              <g fill="none" stroke={SEAM} strokeWidth="1">
                <path d="M74 236 h54 v62 h-54 Z" />
                <path d="M172 236 h54 v62 h-54 Z" />
              </g>
              <path d="M116 60 Q138 64 150 98 L126 122 L98 76 Z" style={fill(lighten(hex, 0.04))} stroke={OUTLINE} />
              <path d="M184 60 Q162 64 150 98 L174 122 L202 76 Z" style={fill(lighten(hex, 0.04))} stroke={OUTLINE} />
            </>
          ) : (
            <>
              <path d="M116 60 Q150 74 184 60 L188 74 Q150 90 112 74 Z" style={fill(darken(hex, 0.05))} stroke={OUTLINE} />
              <path d="M58 124 Q150 132 242 124" fill="none" stroke={SEAM} />
            </>
          )}
        </>
      )}

      {/* Prints */}
      <g style={{ fill: ink, transition: "fill 500ms ease", fontFamily: "var(--font-geist-sans)" }}>
        {isFront && print.front === "chest" && (
          <text x={chestX} y={chestY} fontSize="10" fontWeight="900" letterSpacing="0.4">
            ITS US®
          </text>
        )}
        {isFront && print.front === "big" && (
          <>
            <text x="150" y="196" fontSize="54" fontWeight="900" textAnchor="middle" letterSpacing="-2.5">
              IT&apos;S
            </text>
            <text x="150" y="244" fontSize="54" fontWeight="900" textAnchor="middle" letterSpacing="-2.5">
              US.
            </text>
            <text x="150" y="266" fontSize="7" fontWeight="600" textAnchor="middle" letterSpacing="2.4" style={{ fontFamily: "var(--font-geist-mono)" }}>
              NEVER THEM — EST. 2026
            </text>
          </>
        )}
        {!isFront && print.back === "statement" && (
          <>
            <text x="150" y={kind === "jacket" ? 176 : 158} fontSize={kind === "jacket" ? 34 : 30} fontWeight="900" textAnchor="middle" letterSpacing="-1.2">
              IT&apos;S US.
            </text>
            <text x="150" y={kind === "jacket" ? 212 : 190} fontSize={kind === "jacket" ? 34 : 30} fontWeight="900" textAnchor="middle" letterSpacing="-1.2">
              NEVER THEM.
            </text>
            <text x="150" y={kind === "jacket" ? 236 : 212} fontSize="7" fontWeight="600" textAnchor="middle" letterSpacing="2.4" style={{ fontFamily: "var(--font-geist-mono)" }}>
              WORLDWIDE — EST. 2026
            </text>
          </>
        )}
        {!isFront && print.back === "tag" && (
          <>
            <rect x="137" y={kind === "jacket" ? 84 : 80} width="26" height="11" rx="1" />
            <text
              x="150"
              y={kind === "jacket" ? 92 : 88}
              fontSize="6"
              fontWeight="900"
              textAnchor="middle"
              style={{ fill: hex, transition: "fill 500ms ease" }}
            >
              ITS US
            </text>
          </>
        )}
      </g>
    </svg>
  );
}
