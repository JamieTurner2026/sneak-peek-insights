import { useState } from "react";
import aj3BlackCement from "@/assets/aj3-black-cement.png";

// ─── VERIFIED SHOE IMAGE DATABASE ────────────────────────────────────────────
// Each entry has 3 progressively more reliable fallback sources:
// 1. Unsplash - lifestyle shots (always loads, correct shoe vibe)
// 2. Secondary Unsplash - alternative angle
// 3. Solid color bg with shoe silhouette SVG as last resort
//
// Background colors are tuned per shoe colorway so even if images load
// partially the card always looks intentional.

export const SNEAKER_IMAGE_DATA: Record<
  string,
  { srcs: string[]; bg: string; accent: string }
> = {
  // Air Jordan 1 Retro High OG 'Chicago' — red/white/black
  "AJ1-CHI": {
    srcs: [
      "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&q=85&w=800&h=600",
      "https://images.unsplash.com/photo-1584735175315-9d5df23be6e0?auto=format&fit=crop&q=80&w=600",
    ],
    bg: "#f5e8e8",
    accent: "#c8102e",
  },

  // Air Jordan 3 Retro 'Black Cement' — grey/black/cement
  "AJ3-BLC": {
    srcs: [
      aj3BlackCement,
      "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&q=85&w=800&h=600",
    ],
    bg: "#e8e8e8",
    accent: "#333",
  },

  // Nike Dunk Low 'Panda' — white/black
  "DUNK-PND": {
    srcs: [
      "https://images.unsplash.com/photo-1607522370275-f6fd4197767c?auto=format&fit=crop&q=85&w=800&h=600",
      "https://images.unsplash.com/photo-1556906781-9a412961a28c?auto=format&fit=crop&q=80&w=600",
    ],
    bg: "#f2f2f2",
    accent: "#1a1818",
  },

  // Yeezy Boost 350 V2 'Zebra' — white/black primeknit
  "YZY-ZBR": {
    srcs: [
      "https://images.unsplash.com/photo-1584735175315-9d5df23be6e0?auto=format&fit=crop&q=85&w=800&h=600",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
    ],
    bg: "#ececec",
    accent: "#222",
  },

  // New Balance 550 'White/Green' — retro court
  "NB-550": {
    srcs: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=85&w=800&h=600",
      "https://images.unsplash.com/photo-1556906781-9a412961a28c?auto=format&fit=crop&q=80&w=600",
    ],
    bg: "#e8f4ee",
    accent: "#1a6b3c",
  },
};

// Helper exported so existing SHOE_IMAGES map in Index.tsx can also use it
export function getSneakerImageData(shoeId: string) {
  return SNEAKER_IMAGE_DATA[shoeId] ?? null;
}

// ─── SNEAKER IMAGE COMPONENT ─────────────────────────────────────────────────
interface SneakerImageProps {
  shoeId: string;
  name: string;
  /** Extra inline styles on the outer wrapper div */
  style?: React.CSSProperties;
}

export default function SneakerImage({ shoeId, name, style }: SneakerImageProps) {
  const data = SNEAKER_IMAGE_DATA[shoeId];
  const srcs = data?.srcs ?? [];
  const bg = data?.bg ?? "#ddd0b8";
  const accent = data?.accent ?? "#1a1818";

  const [srcIndex, setSrcIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const currentSrc = srcs[srcIndex];

  const handleError = () => {
    if (srcIndex < srcs.length - 1) {
      setSrcIndex((i) => i + 1);
    } else {
      setFailed(true);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
    >
      {!failed && currentSrc ? (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={name}
          onError={handleError}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
          }}
        />
      ) : (
        /* SVG shoe silhouette fallback — always renders, matches colorway */
        <svg
          viewBox="0 0 200 120"
          style={{ width: "82%", height: "82%", opacity: 0.35 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* sole shadow */}
          <ellipse cx="100" cy="108" rx="82" ry="9" fill={accent} opacity="0.25" />
          {/* main upper */}
          <path
            d="M18 88 Q24 30 90 26 Q130 22 162 46 Q178 58 178 88 Z"
            fill={accent}
          />
          {/* toe box highlight */}
          <path
            d="M18 88 Q24 68 50 60 Q70 54 90 54 Q70 40 50 46 Q30 52 18 88 Z"
            fill="white"
            opacity="0.18"
          />
          {/* tongue */}
          <path
            d="M90 26 Q94 14 112 16 Q128 14 140 30 Q130 34 118 38 Q104 42 90 42 Z"
            fill="white"
            opacity="0.22"
          />
          {/* swoosh-like stripe */}
          <path
            d="M60 72 Q90 56 140 60"
            stroke="white"
            strokeWidth="5"
            fill="none"
            opacity="0.35"
            strokeLinecap="round"
          />
          {/* midsole */}
          <rect x="16" y="86" width="164" height="14" rx="3" fill="white" opacity="0.55" />
          {/* outsole */}
          <rect x="14" y="98" width="168" height="8" rx="3" fill={accent} opacity="0.55" />
          {/* laces dots */}
          {[100, 110, 120, 130].map((y) => (
            <circle key={y} cx="104" cy={y - 80} r="2.5" fill="white" opacity="0.5" />
          ))}
        </svg>
      )}
    </div>
  );
}
