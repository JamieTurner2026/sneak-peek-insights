import { useState } from "react";

// ─── SNEAKER IMAGE DATABASE ──────────────────────────────────────────────────
// Maps shoe IDs to reliable image sources with automatic fallback
const SNEAKER_IMAGES: Record<string, { primary: string; fallback: string; bg: string }> = {
  "AJ1-CHI": {
    primary: "https://www.flightclub.com/media/catalog/product/cache/1/image/1600x1140/9df78eab33525d08d6e5fb8d27136e95/0/8/08.21.17-Air-Jordan-1-Retro-High-OG-Chicago-555088-101-1.png",
    fallback: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&q=80&w=600",
    bg: "#e8d5d5",
  },
  "AJ3-BLC": {
    primary: "https://www.flightclub.com/media/catalog/product/cache/1/image/1600x1140/9df78eab33525d08d6e5fb8d27136e95/8/0/800236_01.jpg",
    fallback: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&q=80&w=600",
    bg: "#d5d5d5",
  },
  "DUNK-PND": {
    primary: "https://www.flightclub.com/media/catalog/product/cache/1/image/1600x1140/9df78eab33525d08d6e5fb8d27136e95/d/u/dunk-low-retro-white-black-dd1391-100-1.png",
    fallback: "https://images.unsplash.com/photo-1607522370275-f6fd4197767c?auto=format&fit=crop&q=80&w=600",
    bg: "#f0f0f0",
  },
  "YZY-ZBR": {
    primary: "https://www.flightclub.com/media/catalog/product/cache/1/image/1600x1140/9df78eab33525d08d6e5fb8d27136e95/8/0/800586_01.jpg",
    fallback: "https://images.unsplash.com/photo-1584735175315-9d5df23be6e0?auto=format&fit=crop&q=80&w=600",
    bg: "#ebebeb",
  },
  "NB-550": {
    primary: "https://www.flightclub.com/media/catalog/product/cache/1/image/1600x1140/9df78eab33525d08d6e5fb8d27136e95/n/e/new-balance-550-white-green-bb550wt1-1.png",
    fallback: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=600",
    bg: "#dff0e8",
  },
};

export function getSneakerImageData(shoeId: string) {
  return SNEAKER_IMAGES[shoeId];
}

interface SneakerImageProps {
  shoeId: string;
  name: string;
  style?: React.CSSProperties;
}

export default function SneakerImage({ shoeId, name, style = {} }: SneakerImageProps) {
  const imgData = SNEAKER_IMAGES[shoeId];
  const [src, setSrc] = useState(imgData?.primary || imgData?.fallback || "");
  const [tried, setTried] = useState(0);

  const handleError = () => {
    if (tried === 0 && imgData?.fallback) {
      setSrc(imgData.fallback);
      setTried(1);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: imgData?.bg || "var(--sa)", ...style }}>
      {src ? (
        <img src={src} alt={name} onError={handleError} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      ) : (
        <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
          <path d="M5 30 Q10 10 25 15 Q35 5 45 12 Q55 8 58 20 L55 30 Z" fill="var(--sa)" stroke="var(--border)" strokeWidth="1.5" />
          <circle cx="15" cy="32" r="5" fill="var(--border)" />
          <circle cx="45" cy="32" r="5" fill="var(--border)" />
        </svg>
      )}
    </div>
  );
}
