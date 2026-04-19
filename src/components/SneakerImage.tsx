import { useState } from "react";
import aj1Chicago from "@/assets/aj1-chicago.png";
import aj3BlackCement from "@/assets/aj3-black-cement.png";
import dunkPanda from "@/assets/dunk-panda.png";
import yeezyZebra from "@/assets/yeezy-zebra.png";

// ─── VERIFIED SHOE IMAGE DATABASE ────────────────────────────────────────────
// Each entry has progressively more reliable fallback sources.
// Local assets are prioritized for reliability.

export const SNEAKER_IMAGE_DATA: Record<
  string,
  { srcs: string[]; bg: string; accent: string }
> = {
  // Air Jordan 1 Retro High OG 'Chicago' — red/white/black
  "AJ1-CHI": {
    srcs: [
      aj1Chicago,
      "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&q=85&w=800&h=600",
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
      dunkPanda,
      "https://images.unsplash.com/photo-1607522370275-f6fd4197767c?auto=format&fit=crop&q=85&w=800&h=600",
    ],
    bg: "#f2f2f2",
    accent: "#1a1818",
  },

  // Yeezy Boost 350 V2 'Zebra' — white/black primeknit
  "YZY-ZBR": {
    srcs: [
      yeezyZebra,
      "https://images.unsplash.com/photo-1584735175315-9d5df23be6e0?auto=format&fit=crop&q=85&w=800&h=600",
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
        /* Branded SNEAKID placeholder fallback */
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          {/* Logo mark */}
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ opacity: 0.6 }}
          >
            <rect x="8" y="28" width="32" height="8" rx="2" fill={accent} />
            <path
              d="M12 28L16 16L28 14L36 20L40 28"
              stroke={accent}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="18" cy="22" r="3" fill={accent} />
            <circle cx="30" cy="20" r="3" fill={accent} />
          </svg>
          {/* Brand text */}
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: accent,
              opacity: 0.5,
              textTransform: "uppercase",
            }}
          >
            SNEAKID
          </span>
          {/* Subtle shoe silhouette watermark */}
          <svg
            viewBox="0 0 200 120"
            style={{ width: "60%", height: "40%", opacity: 0.15, position: "absolute" }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="100" cy="108" rx="82" ry="9" fill={accent} />
            <path
              d="M18 88 Q24 30 90 26 Q130 22 162 46 Q178 58 178 88 Z"
              fill={accent}
            />
            <rect x="16" y="86" width="164" height="14" rx="3" fill="white" opacity="0.3" />
            <rect x="14" y="98" width="168" height="8" rx="3" fill={accent} opacity="0.3" />
          </svg>
        </div>
      )}
    </div>
  );
}
