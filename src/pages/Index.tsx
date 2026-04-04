import { useState } from "react";

// ─── SHOE IMAGE MAP ──────────────────────────────────────────────────────────
const SHOE_IMAGES: Record<string, { primary: string; fallback: string; bg: string }> = {
  "AJ1-CHI": {
    primary: "https://image.goat.com/750/attachments/product_template_pictures/images/011/824/726/original/9978_00.png.png",
    fallback: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&q=80&w=600",
    bg: "#e8d5d5",
  },
  "AJ3-BLC": {
    primary: "https://image.goat.com/750/attachments/product_template_pictures/images/014/519/258/original/306292_00.png.png",
    fallback: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&q=80&w=600",
    bg: "#d5d5d5",
  },
  "DUNK-PND": {
    primary: "https://image.goat.com/750/attachments/product_template_pictures/images/046/880/925/original/921573_00.png.png",
    fallback: "https://images.unsplash.com/photo-1607522370275-f6fd4197767c?auto=format&fit=crop&q=80&w=600",
    bg: "#f0f0f0",
  },
  "YZY-ZBR": {
    primary: "https://image.goat.com/750/attachments/product_template_pictures/images/012/475/614/original/502874_00.png.png",
    fallback: "https://images.unsplash.com/photo-1584735175315-9d5df23be6e0?auto=format&fit=crop&q=80&w=600",
    bg: "#ebebeb",
  },
  "NB-550": {
    primary: "https://image.goat.com/750/attachments/product_template_pictures/images/047/745/438/original/875348_00.png.png",
    fallback: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=600",
    bg: "#dff0e8",
  },
};

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface ShoeData {
  id: string;
  name: string;
  brand: string;
  colorway: string;
  size: string;
  condition: string;
  match: number;
  retail: number;
  resale: number;
  release: string;
  silhouette: string;
  tech: string;
  sku: string;
  tags: string[];
  saved: string;
  photo?: string;
}

// ─── DATA ────────────────────────────────────────────────────────────────────
const INITIAL_VAULT: ShoeData[] = [
  { id: "AJ1-CHI", name: "Air Jordan 1 Retro High OG", brand: "JORDAN", colorway: "Chicago", size: "10", condition: "Deadstock", match: 98.4, retail: 170, resale: 298, release: "Feb 2022", silhouette: "HIGH-TOP", tech: "Air Sole", sku: "DZ5485-612", tags: ["Jordan", "Retro", "Limited"], saved: "Mar 12, 2026" },
  { id: "AJ3-BLC", name: "Air Jordan 3 Retro", brand: "JORDAN", colorway: "Black Cement", size: "10.5", condition: "Like New", match: 96.1, retail: 190, resale: 245, release: "Jan 2018", silhouette: "MID-TOP", tech: "Air Sole", sku: "854262-001", tags: ["Jordan", "Cement", "OG"], saved: "Mar 20, 2026" },
  { id: "DUNK-PND", name: "Nike Dunk Low", brand: "NIKE", colorway: "Panda", size: "11", condition: "New in Box", match: 97.5, retail: 110, resale: 118, release: "Mar 2021", silhouette: "LOW-TOP", tech: "Cushlon", sku: "DD1391-100", tags: ["Nike", "Dunk", "Classic"], saved: "Apr 1, 2026" },
  { id: "YZY-ZBR", name: "Yeezy Boost 350 V2", brand: "ADIDAS", colorway: "Zebra", size: "9.5", condition: "Deadstock", match: 94.3, retail: 220, resale: 240, release: "Feb 2017", silhouette: "LOW-TOP", tech: "Boost", sku: "CP9654", tags: ["Yeezy", "Adidas", "Boost"], saved: "Apr 2, 2026" },
  { id: "NB-550", name: "New Balance 550", brand: "NEW BALANCE", colorway: "White / Green", size: "10", condition: "Used — Great", match: 92.6, retail: 110, resale: 95, release: "Nov 2020", silhouette: "LOW-TOP", tech: "Encap", sku: "BB550WT1", tags: ["New Balance", "Court", "Retro"], saved: "Apr 3, 2026" },
];

const CONDITION_COLOR: Record<string, { bg: string; text: string }> = {
  "Deadstock":     { bg: "#1a6b3c", text: "#fff" },
  "New in Box":    { bg: "#0e4f8a", text: "#fff" },
  "Like New":      { bg: "#5a3d8a", text: "#fff" },
  "Used — Great":  { bg: "#8a5a1a", text: "#fff" },
  "Used — Good":   { bg: "#6b2a2a", text: "#fff" },
};

const RETAILERS = ["StockX", "GOAT", "Flight Club", "Stadium Goods", "eBay"];

// ─── SHOE IMAGE COMPONENT ─────────────────────────────────────────────────────
function ShoeImage({ shoeId, name, style = {} }: { shoeId: string; name: string; style?: React.CSSProperties }) {
  const imgData = SHOE_IMAGES[shoeId] || {};
  const [src, setSrc] = useState(imgData.primary || imgData.fallback || "");
  const [tried, setTried] = useState(0);

  const handleError = () => {
    if (tried === 0 && imgData.fallback) {
      setSrc(imgData.fallback);
      setTried(1);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: imgData.bg || "#e0d6c2", ...style }}>
      {src ? (
        <img src={src} alt={name} onError={handleError} style={{ width: "85%", height: "85%", objectFit: "contain", filter: "drop-shadow(3px 4px 6px rgba(0,0,0,0.18))" }} />
      ) : (
        <svg viewBox="0 0 80 40" style={{ width: "60%", opacity: 0.18 }}>
          <path d="M5 30 Q10 10 30 15 Q50 5 60 15 Q75 10 75 25 Q75 35 60 35 L15 35 Q5 35 5 30Z" fill="#1a1818" />
          <ellipse cx="25" cy="33" rx="8" ry="3" fill="#1a1818" opacity="0.3" />
          <ellipse cx="60" cy="33" rx="8" ry="3" fill="#1a1818" opacity="0.3" />
        </svg>
      )}
    </div>
  );
}

// ─── STAT PILL ────────────────────────────────────────────────────────────────
function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#fff", border: "2px solid #1a1818", padding: "5px 10px", flex: 1, minWidth: 70 }}>
      <span style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: "#c8102e", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{label}</span>
      <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, color: "#1a1818", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

// ─── SHOE CARD — GRID ─────────────────────────────────────────────────────────
function ShoeCardGrid({ shoe, onRemove, onBuy }: { shoe: ShoeData; onRemove: (id: string) => void; onBuy: (shoe: ShoeData) => void }) {
  const [hovered, setHovered] = useState(false);
  const profit = shoe.resale - shoe.retail;
  const profitPct = ((profit / shoe.retail) * 100).toFixed(0);
  const cond = CONDITION_COLOR[shoe.condition] || { bg: "#333", text: "#fff" };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: "3px solid #1a1818",
        background: "#f0e6d3",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "transform 0.18s, box-shadow 0.18s",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered ? "7px 7px 0 #1a1818" : "none",
        position: "relative",
        overflow: "hidden",
      }}
      onClick={() => onBuy(shoe)}
    >
      <div style={{ width: "100%", aspectRatio: "4/3", position: "relative", overflow: "hidden" }}>
        <ShoeImage shoeId={shoe.id} name={shoe.name} />
        <div style={{ position: "absolute", top: 7, left: 7, background: "#f5a623", color: "#1a1818", fontFamily: "'Oswald', sans-serif", fontSize: 11, fontWeight: 700, padding: "2px 8px", letterSpacing: "0.04em" }}>
          {shoe.match}% MATCH
        </div>
        <div style={{ position: "absolute", bottom: 7, left: 7, background: cond.bg, color: cond.text, fontFamily: "'Oswald', sans-serif", fontSize: 10, fontWeight: 600, padding: "2px 8px", letterSpacing: "0.04em" }}>
          {shoe.condition.toUpperCase()}
        </div>
        <div style={{ position: "absolute", bottom: 7, right: 7, fontFamily: "'Courier New', monospace", fontSize: 9, color: "#1a1818", background: "rgba(240,230,211,0.85)", padding: "1px 5px" }}>
          {shoe.sku}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(shoe.id); }}
          style={{ position: "absolute", top: 7, right: 7, background: "rgba(200,16,46,0.92)", border: "none", color: "#fff", fontFamily: "'Oswald', sans-serif", fontSize: 13, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}
        >✕</button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1a1818", padding: "5px 10px" }}>
        <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, color: "#f5a623", fontWeight: 700, letterSpacing: "0.1em" }}>{shoe.brand}</span>
        <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: "#aaa" }}>SZ {shoe.size}</span>
      </div>

      <div style={{ padding: "10px 12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 700, color: "#1a1818", margin: 0, lineHeight: 1.15 }}>{shoe.name}</h3>
        <p style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#555", margin: 0 }}>{shoe.colorway}</p>

        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 2 }}>
          {shoe.tags.map(t => (
            <span key={t} style={{ fontFamily: "'Courier New', monospace", fontSize: 9, background: "#1a1818", color: "#f5a623", padding: "1px 6px", letterSpacing: "0.05em" }}>{t}</span>
          ))}
        </div>

        <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
          <StatPill label="Release" value={shoe.release} />
          <StatPill label="Type" value={shoe.silhouette} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "auto", paddingTop: 6 }}>
          <div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#c8102e", fontWeight: 700, textTransform: "uppercase" }}>RESALE</div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700, color: "#1a1818", lineHeight: 1 }}>${shoe.resale}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#888", textTransform: "uppercase" }}>RETAIL</div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 13, color: "#888" }}>${shoe.retail}</div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: profit >= 0 ? "#1a6b3c" : "#8a1a1a", fontWeight: 700, marginTop: 1 }}>
              {profit >= 0 ? "▲" : "▼"} ${Math.abs(profit)} ({Math.abs(Number(profitPct))}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SHOE CARD — LIST ─────────────────────────────────────────────────────────
function ShoeCardList({ shoe, onRemove, onBuy }: { shoe: ShoeData; onRemove: (id: string) => void; onBuy: (shoe: ShoeData) => void }) {
  const [hovered, setHovered] = useState(false);
  const profit = shoe.resale - shoe.retail;
  const profitPct = ((profit / shoe.retail) * 100).toFixed(0);
  const cond = CONDITION_COLOR[shoe.condition] || { bg: "#333", text: "#fff" };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", alignItems: "center", gap: 0, border: "3px solid #1a1818", background: hovered ? "#ddd0b8" : "#f0e6d3", transition: "background 0.18s", position: "relative", cursor: "pointer", overflow: "hidden" }}
      onClick={() => onBuy(shoe)}
    >
      <div style={{ width: 110, height: 90, flexShrink: 0 }}>
        <ShoeImage shoeId={shoe.id} name={shoe.name} />
      </div>

      <div style={{ flex: 1, padding: "8px 12px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, color: "#f5a623", background: "#1a1818", padding: "1px 6px", fontWeight: 700, letterSpacing: "0.08em" }}>{shoe.brand}</span>
          <span style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#888" }}>SZ {shoe.size} · {shoe.sku}</span>
        </div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 700, color: "#1a1818", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shoe.name}</div>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: "#555" }}>{shoe.colorway}</div>
        <div style={{ display: "flex", gap: 4, marginTop: 3, alignItems: "center" }}>
          <span style={{ fontSize: 9, fontFamily: "'Oswald', sans-serif", background: cond.bg, color: cond.text, padding: "1px 5px", fontWeight: 600 }}>{shoe.condition}</span>
          {shoe.tags.map(t => <span key={t} style={{ fontSize: 8, fontFamily: "'Courier New', monospace", background: "#1a1818", color: "#f5a623", padding: "1px 4px" }}>{t}</span>)}
        </div>
      </div>

      <div style={{ padding: "8px 16px 8px 8px", textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#c8102e", fontWeight: 700 }}>RESALE</div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, fontWeight: 700, color: "#1a1818" }}>${shoe.resale}</div>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: profit >= 0 ? "#1a6b3c" : "#8a1a1a", fontWeight: 700, marginTop: 2 }}>
          {profit >= 0 ? "▲" : "▼"} ${Math.abs(profit)} ({Math.abs(Number(profitPct))}%)
        </div>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#888", marginTop: 2 }}>{shoe.match}% match</div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onRemove(shoe.id); }}
        style={{ position: "absolute", top: 6, right: 8, background: "none", border: "2px solid #c8102e", color: "#c8102e", fontFamily: "'Oswald', sans-serif", fontSize: 10, padding: "2px 6px", cursor: "pointer", opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}
      >✕</button>
    </div>
  );
}

// ─── CHECKOUT MODAL ───────────────────────────────────────────────────────────
function BuyModal({ shoe, onClose }: { shoe: ShoeData; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [addr, setAddr] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [retailer, setRetailer] = useState("StockX");
  const [orderNum, setOrderNum] = useState("");

  const fmtCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/.{1,4}/g, "$& ").trim();
  const fmtExp = (v: string) => { const d = v.replace(/\D/g, ""); return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2, 4) : d; };

  const goNext = () => {
    if (step === 1 && (!name.trim() || !email.trim() || !addr.trim())) return;
    if (step === 2) {
      if (card.replace(/\s/g, "").length < 15 || !expiry.includes("/") || cvv.length < 3) return;
      setOrderNum("SS-" + Math.random().toString(36).slice(2, 10).toUpperCase());
    }
    setStep(s => s + 1);
  };

  const inp: React.CSSProperties = { width: "100%", background: "#fff", border: "3px solid #1a1818", fontFamily: "'Courier New', monospace", fontSize: 13, padding: "9px 11px", outline: "none", color: "#1a1818", marginTop: 4 };
  const lbl: React.CSSProperties = { fontFamily: "'Courier New', monospace", fontSize: 9, fontWeight: 700, color: "#c8102e", textTransform: "uppercase", letterSpacing: "0.08em", display: "block" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(13,13,13,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#f0e6d3", border: "4px solid #1a1818", maxWidth: 420, width: "100%", maxHeight: "90vh", overflow: "auto", padding: 24, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 10, right: 14, background: "none", border: "none", fontFamily: "'Oswald', sans-serif", fontSize: 12, color: "#c8102e", cursor: "pointer", letterSpacing: "0.08em" }}>✕ CLOSE</button>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, paddingRight: 60 }}>
          <div style={{ width: 70, height: 55, flexShrink: 0, border: "2px solid #1a1818" }}>
            <ShoeImage shoeId={shoe.id} name={shoe.name} />
          </div>
          <div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, fontWeight: 700, color: "#1a1818" }}>{shoe.name}</div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#555" }}>{shoe.colorway} · SZ {shoe.size}</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: step >= i ? "#c8102e" : "#ccc", transition: "background 0.2s" }} />)}
        </div>

        {step === 1 && (
          <div>
            <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, color: "#1a1818", margin: "0 0 12px", letterSpacing: "0.06em" }}>SHIPPING INFO</h3>
            <div style={{ marginBottom: 10 }}>
              <label style={lbl}>Buy From</label>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                {RETAILERS.map(r => <button key={r} onClick={() => setRetailer(r)} style={{ background: retailer === r ? "#1a1818" : "#f0e6d3", color: retailer === r ? "#f5a623" : "#1a1818", border: "2px solid #1a1818", fontFamily: "'Oswald', sans-serif", fontSize: 12, padding: "5px 11px", cursor: "pointer", transition: "all 0.15s" }}>{r}</button>)}
              </div>
            </div>
            <label style={lbl}>Full Name<input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Jordan Smith" /></label>
            <label style={{ ...lbl, marginTop: 8 }}>Email<input style={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="jordan@email.com" /></label>
            <label style={{ ...lbl, marginTop: 8 }}>Shipping Address<input style={inp} value={addr} onChange={e => setAddr(e.target.value)} placeholder="123 Sneaker Ave" /></label>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <label style={{ ...lbl, flex: 1 }}>City<input style={inp} value={city} onChange={e => setCity(e.target.value)} placeholder="Charlotte" /></label>
              <label style={{ ...lbl, width: 90 }}>ZIP<input style={inp} value={zip} onChange={e => setZip(e.target.value.slice(0, 5))} placeholder="28001" /></label>
            </div>
            <button onClick={goNext} style={{ width: "100%", background: "#c8102e", color: "#fff", border: "none", fontFamily: "'Oswald', sans-serif", fontSize: 15, padding: 13, cursor: "pointer", marginTop: 16, letterSpacing: "0.08em" }}>CONTINUE TO PAYMENT →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, color: "#1a1818", margin: "0 0 12px", letterSpacing: "0.06em" }}>PAYMENT</h3>
            <label style={lbl}>Card Number<input style={inp} value={card} onChange={e => setCard(fmtCard(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19} /></label>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <label style={{ ...lbl, flex: 1 }}>Expiry<input style={inp} value={expiry} onChange={e => setExpiry(fmtExp(e.target.value))} placeholder="MM/YY" maxLength={5} /></label>
              <label style={{ ...lbl, width: 90 }}>CVV<input style={inp} value={cvv} onChange={e => setCvv(e.target.value.slice(0, 4))} placeholder="•••" /></label>
            </div>
            <label style={{ ...lbl, marginTop: 8 }}>Name on Card<input style={inp} value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Jordan Smith" /></label>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, marginTop: 16, borderTop: "2px solid #1a1818", paddingTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>${shoe.resale}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span>Shipping via {retailer}</span><span>$9.99</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontWeight: 700, fontSize: 14 }}><span>TOTAL</span><span>${(shoe.resale + 9.99).toFixed(2)}</span></div>
            </div>
            <button onClick={goNext} style={{ width: "100%", background: "#c8102e", color: "#fff", border: "none", fontFamily: "'Oswald', sans-serif", fontSize: 15, padding: 13, cursor: "pointer", marginTop: 16, letterSpacing: "0.08em" }}>🔒 PLACE ORDER</button>
            <button onClick={() => setStep(1)} style={{ width: "100%", background: "none", color: "#1a1818", border: "3px solid #1a1818", fontFamily: "'Oswald', sans-serif", fontSize: 14, padding: 11, cursor: "pointer", marginTop: 8 }}>← BACK</button>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48 }}>✅</div>
            <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, color: "#1a6b3c", margin: "10px 0 4px" }}>ORDER PLACED!</h3>
            <p style={{ fontFamily: "'Courier New', monospace", fontSize: 13, margin: 4 }}>Order #{orderNum}</p>
            <p style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#555", margin: 4 }}>via {retailer}</p>
            <p style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#888", margin: 4 }}>Confirmation → {email}</p>
            <button onClick={onClose} style={{ background: "#1a1818", color: "#f5a623", border: "none", fontFamily: "'Oswald', sans-serif", fontSize: 15, padding: "11px 40px", cursor: "pointer", marginTop: 16, letterSpacing: "0.08em" }}>CLOSE</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
const Index = () => {
  const [vault, setVault] = useState<ShoeData[]>(INITIAL_VAULT);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("saved");
  const [filter, setFilter] = useState("ALL");
  const [buyShoe, setBuyShoe] = useState<ShoeData | null>(null);
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 2500); };
  const removeShoe = (id: string) => { setVault(v => v.filter(s => s.id !== id)); showToast("Removed from vault"); };

  const brands = ["ALL", ...Array.from(new Set(INITIAL_VAULT.map(s => s.brand)))];

  const sorted = [...vault]
    .filter(s => filter === "ALL" || s.brand === filter)
    .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.colorway.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "resale") return b.resale - a.resale;
      if (sort === "match") return b.match - a.match;
      if (sort === "brand") return a.brand.localeCompare(b.brand);
      return 0;
    });

  const totalResale = vault.reduce((s, v) => s + v.resale, 0);
  const totalRetail = vault.reduce((s, v) => s + v.retail, 0);
  const totalProfit = totalResale - totalRetail;

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#1a1818", fontFamily: "'Oswald', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Playfair+Display:ital,wght@1,700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1a1818; }
        input::placeholder { color: #aaa; font-size: 12px; }
        input:focus { outline: none; border-color: #c8102e !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* HEADER */}
      <div style={{ background: "#f0e6d3", borderBottom: "4px solid #1a1818" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px 18px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 28, fontWeight: 700, color: "#c8102e", margin: 0, letterSpacing: "-0.02em" }}>SNAPSHOTZ SOLES</h1>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700, margin: 0, color: "#1a1818" }}>My Vault</h2>
              <span style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: "#888" }}>{vault.length} PAIRS · AI-SCANNED COLLECTION</span>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
              {[
                { l: "Vault Value", v: `$${totalResale.toLocaleString()}` },
                { l: "Paid Retail", v: `$${totalRetail.toLocaleString()}` },
                { l: "Net Gain", v: `${totalProfit >= 0 ? "+" : ""}$${totalProfit.toLocaleString()}`, green: totalProfit >= 0 },
              ].map(({ l, v, green }) => (
                <div key={l} style={{ background: "#fff", border: "2px solid #1a1818", padding: "6px 14px" }}>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: "#c8102e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, fontWeight: 700, color: green ? "#1a6b3c" : "#1a1818" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div style={{ background: "#e8dcc8", borderBottom: "3px solid #1a1818", padding: "10px 16px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or colorway..." style={{ background: "#fff", border: "3px solid #1a1818", fontFamily: "'Courier New', monospace", fontSize: 13, padding: "7px 12px", flex: 1, minWidth: 160, outline: "none", color: "#1a1818" }} />

          <div style={{ display: "flex", gap: 4 }}>
            {brands.map(b => (
              <button key={b} onClick={() => setFilter(b)} style={{ background: filter === b ? "#1a1818" : "transparent", color: filter === b ? "#f5a623" : "#1a1818", border: "2px solid #1a1818", fontFamily: "'Oswald', sans-serif", fontSize: 12, padding: "5px 10px", cursor: "pointer", letterSpacing: "0.05em", transition: "all 0.15s" }}>{b}</button>
            ))}
          </div>

          <select value={sort} onChange={e => setSort(e.target.value)} style={{ background: "#fff", border: "3px solid #1a1818", fontFamily: "'Courier New', monospace", fontSize: 12, padding: "7px 10px", cursor: "pointer", color: "#1a1818", outline: "none" }}>
            <option value="saved">Sort: Saved</option>
            <option value="resale">Sort: Resale ↓</option>
            <option value="match">Sort: Match %</option>
            <option value="brand">Sort: Brand</option>
          </select>

          <div style={{ display: "flex", gap: 0 }}>
            {([["grid", "⊞"], ["list", "≡"]] as const).map(([v, icon]) => (
              <button key={v} onClick={() => setView(v)} style={{ background: view === v ? "#1a1818" : "transparent", color: view === v ? "#f5a623" : "#1a1818", border: "none", fontFamily: "'Oswald', sans-serif", fontSize: 17, padding: "5px 14px", cursor: "pointer", transition: "all 0.15s" }}>{icon}</button>
            ))}
          </div>
        </div>
      </div>

      {/* VAULT GRID / LIST */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px 40px" }}>
        {sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20, color: "#f0e6d3" }}>Vault is empty</h3>
            <p style={{ fontFamily: "'Courier New', monospace", fontSize: 12, color: "#888" }}>{search || filter !== "ALL" ? "No shoes match your filters." : "Scan a shoe to add it to your vault."}</p>
          </div>
        ) : view === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {sorted.map((shoe, i) => (
              <div key={shoe.id} style={{ animation: `fadeUp 0.35s ${i * 0.06}s both` }}>
                <ShoeCardGrid shoe={shoe} onRemove={removeShoe} onBuy={setBuyShoe} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sorted.map((shoe, i) => (
              <div key={shoe.id} style={{ animation: `fadeUp 0.3s ${i * 0.05}s both` }}>
                <ShoeCardList shoe={shoe} onRemove={removeShoe} onBuy={setBuyShoe} />
              </div>
            ))}
          </div>
        )}
      </div>

      {buyShoe && <BuyModal shoe={buyShoe} onClose={() => setBuyShoe(null)} />}

      {toastMsg && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1a1818", color: "#f5a623", fontFamily: "'Oswald', sans-serif", fontSize: 14, padding: "10px 28px", border: "2px solid #f5a623", zIndex: 10000, letterSpacing: "0.06em", animation: "fadeUp 0.3s" }}>{toastMsg}</div>
      )}
    </div>
  );
};

export default Index;