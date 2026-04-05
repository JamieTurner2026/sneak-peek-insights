import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import SneakerImage, { getSneakerImageData } from "@/components/SneakerImage";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface ShoeResult {
  name: string;
  silhouette: string;
  colorway: string;
  release: string;
  tech: string;
  confidence: number;
  designer: string;
  inspiration: string;
  estimatedPrice: string;
  brand: string;
  photo?: string;
}

// ─── SHOE IMAGE MAP ──────────────────────────────────────────────────────────
const SHOE_IMAGES: Record<string, { primary: string; fallback: string; bg: string }> = {
  "AJ1-CHI": {
    primary: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&q=85&w=800&h=600",
    fallback: "https://images.unsplash.com/photo-1584735175315-9d5df23be6e0?auto=format&fit=crop&q=80&w=600",
    bg: "#f5e8e8",
  },
  "AJ3-BLC": {
    primary: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&q=85&w=800&h=600",
    fallback: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
    bg: "#e8e8e8",
  },
  "DUNK-PND": {
    primary: "https://images.unsplash.com/photo-1607522370275-f6fd4197767c?auto=format&fit=crop&q=85&w=800&h=600",
    fallback: "https://images.unsplash.com/photo-1556906781-9a412961a28c?auto=format&fit=crop&q=80&w=600",
    bg: "#f2f2f2",
  },
  "YZY-ZBR": {
    primary: "https://images.unsplash.com/photo-1584735175315-9d5df23be6e0?auto=format&fit=crop&q=85&w=800&h=600",
    fallback: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600",
    bg: "#ececec",
  },
  "NB-550": {
    primary: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=85&w=800&h=600",
    fallback: "https://images.unsplash.com/photo-1556906781-9a412961a28c?auto=format&fit=crop&q=80&w=600",
    bg: "#e8f4ee",
  },
};

interface VaultShoe {
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

// ─── SHOE STORIES DATABASE ──────────────────────────────────────────────────
const SHOE_STORIES: Record<string, { story: string; colorwayInspiration: string; funFact: string; designer: string }> = {
  "AJ1-CHI": {
    designer: "Peter Moore",
    story: "The Air Jordan 1 'Chicago' is the shoe that started it all. In 1985, Nike signed a rookie Michael Jordan to an unprecedented deal, and Peter Moore designed a shoe that broke every NBA uniform rule. The league fined Jordan $5,000 per game for wearing them — and Nike happily paid, turning the controversy into the most successful marketing campaign in sneaker history. The Chicago colorway, matching the Bulls' red, white, and black, became the definitive Jordan 1.",
    colorwayInspiration: "The red, white, and black colorway was directly inspired by the Chicago Bulls' team colors. The bold varsity red panels against the white leather and black accents perfectly captured the energy of 1980s Chicago basketball.",
    funFact: "The NBA fined Michael Jordan $5,000 every game he wore the original Air Jordan 1 because they violated the league's uniform policy. Nike paid every fine and turned it into the legendary 'Banned' marketing campaign."
  },
  "AJ3-BLC": {
    designer: "Tinker Hatfield",
    story: "The Air Jordan 3 'Black Cement' saved the Jordan line. By 1988, Michael Jordan was ready to leave Nike for Adidas. Enter Tinker Hatfield, who redesigned the entire silhouette with elephant print panels, a visible Air unit, and the now-iconic Jumpman logo. Jordan fell in love and stayed with Nike. The Black Cement colorway debuted during the 1988 Slam Dunk Contest, where MJ launched from the free-throw line for his legendary dunk.",
    colorwayInspiration: "The cement grey elephant print texture was inspired by safari patterns, giving the shoe a rugged, textured look. The black leather base with fire red accents created a timeless combination that Tinker Hatfield called 'sophisticated street.'",
    funFact: "This was the first Jordan to feature the Jumpman logo instead of the Nike Wings. It was also the shoe MJ wore when he took off from the free-throw line at the 1988 Slam Dunk Contest — arguably the most iconic dunk in basketball history."
  },
  "DUNK-PND": {
    designer: "Nike Design Team",
    story: "Originally designed in 1985 as a college basketball shoe, the Nike Dunk was created for Nike's 'Be True to Your School' campaign, featuring colorways for top NCAA programs. The shoe faded from mainstream attention for decades before being rediscovered by skaters and streetwear enthusiasts. The 'Panda' colorway — simple black and white — became a viral sensation in 2021, becoming one of the most sought-after sneakers of the decade and a staple of everyday style.",
    colorwayInspiration: "The 'Panda' name comes from its striking black and white contrast, mimicking the iconic coloring of a giant panda. The simplicity of the two-tone design is what makes it so versatile and universally appealing.",
    funFact: "The Panda Dunk became so popular that Nike couldn't keep up with demand, leading to dozens of restocks throughout 2021-2023. At one point, it was the #1 most-traded sneaker on StockX for over 50 consecutive weeks."
  },
  "YZY-ZBR": {
    designer: "Kanye West & adidas Design Team",
    story: "The Yeezy Boost 350 V2 'Zebra' was teased by Kanye West himself on Twitter in 2016, causing an internet frenzy. When it finally released in February 2017, it sold out in seconds. The distinctive black and white Primeknit pattern with the signature SPLY-350 branding became one of the most recognizable sneakers of the 2010s. The Zebra represented the peak of Yeezy hype, when getting a pair felt like winning the lottery.",
    colorwayInspiration: "The alternating white and black Primeknit stripes were designed to mimic a zebra's natural pattern, creating an organic, almost hypnotic visual effect. The red 'SPLY-350' text adds a bold pop against the monochrome upper.",
    funFact: "Kanye West first revealed the Zebra colorway with a simple tweet showing just the shoe on a table. That single image generated over 300,000 retweets and essentially invented the modern 'sneaker leak' format on social media."
  },
  "NB-550": {
    designer: "New Balance Design Team",
    story: "The New Balance 550 was originally released in 1989 as a basketball shoe, then quietly discontinued. In 2020, Aimé Leon Dore — a New York City boutique — collaborated with New Balance to bring it back, and the sneaker world went wild. The retro court silhouette with its chunky sole and vintage basketball DNA perfectly captured the post-hype era's appetite for understated, quality footwear. The White/Green colorway became the gateway drug for an entire generation discovering New Balance.",
    colorwayInspiration: "The white leather base with forest green accents pays homage to classic Boston Celtics basketball aesthetics. The natural, slightly off-white leather gives it a vintage feel, while the green 'N' logo pops with preppy sophistication.",
    funFact: "The New Balance 550 was essentially forgotten for 30 years before Aimé Leon Dore's Teddy Santis brought it back. The collaboration was so successful that it helped Santis land the role of Creative Director for New Balance's Made in USA line."
  },
};

// ─── RETAILER DATA ──────────────────────────────────────────────────────────
interface RetailerInfo {
  name: string;
  badge: string;
  shipping: number;
  verified: boolean;
}

const VAULT_RETAILERS: RetailerInfo[] = [
  { name: "StockX", badge: "VERIFIED ✓", shipping: 13.95, verified: true },
  { name: "GOAT", badge: "TRUSTED", shipping: 12.00, verified: true },
  { name: "Flight Club", badge: "CONSIGNMENT", shipping: 10.00, verified: true },
  { name: "Stadium Goods", badge: "PREMIUM", shipping: 15.00, verified: true },
  { name: "eBay", badge: "MARKETPLACE", shipping: 9.99, verified: false },
  { name: "Grailed", badge: "RESALE", shipping: 11.50, verified: false },
  { name: "KICKS CREW", badge: "GLOBAL", shipping: 14.00, verified: true },
  { name: "Sneaker Con", badge: "EVENT", shipping: 0, verified: true },
];

const INITIAL_VAULT_SHOES: VaultShoe[] = [
  { id: "AJ1-CHI", name: "Air Jordan 1 Retro High OG", brand: "JORDAN", colorway: "Chicago", size: "10", condition: "Deadstock", match: 98.4, retail: 170, resale: 298, release: "Feb 2022", silhouette: "HIGH-TOP", tech: "Air Sole", sku: "DZ5485-612", tags: ["Jordan", "Retro", "Limited"], saved: "Mar 12, 2026" },
  { id: "AJ3-BLC", name: "Air Jordan 3 Retro", brand: "JORDAN", colorway: "Black Cement", size: "10.5", condition: "Like New", match: 96.1, retail: 190, resale: 245, release: "Jan 2018", silhouette: "MID-TOP", tech: "Air Sole", sku: "854262-001", tags: ["Jordan", "Cement", "OG"], saved: "Mar 20, 2026" },
  { id: "DUNK-PND", name: "Nike Dunk Low", brand: "NIKE", colorway: "Panda", size: "11", condition: "New in Box", match: 97.5, retail: 110, resale: 118, release: "Mar 2021", silhouette: "LOW-TOP", tech: "Cushlon", sku: "DD1391-100", tags: ["Nike", "Dunk", "Classic"], saved: "Apr 1, 2026" },
  { id: "YZY-ZBR", name: "Yeezy Boost 350 V2", brand: "ADIDAS", colorway: "Zebra", size: "9.5", condition: "Deadstock", match: 94.3, retail: 220, resale: 240, release: "Feb 2017", silhouette: "LOW-TOP", tech: "Boost", sku: "CP9654", tags: ["Yeezy", "Adidas", "Boost"], saved: "Apr 2, 2026" },
  { id: "NB-550", name: "New Balance 550", brand: "NEW BALANCE", colorway: "White / Green", size: "10", condition: "Used — Great", match: 92.6, retail: 110, resale: 95, release: "Nov 2020", silhouette: "LOW-TOP", tech: "Encap", sku: "BB550WT1", tags: ["New Balance", "Court", "Retro"], saved: "Apr 3, 2026" },
];

const CONDITION_COLOR: Record<string, { bg: string; text: string }> = {
  "Deadstock": { bg: "#1a6b3c", text: "#fff" },
  "New in Box": { bg: "#0e4f8a", text: "#fff" },
  "Like New": { bg: "#5a3d8a", text: "#fff" },
  "Used — Great": { bg: "#8a5a1a", text: "#fff" },
  "Used — Good": { bg: "#6b2a2a", text: "#fff" },
};


// ─── SHOE CARD — GRID ─────────────────────────────────────────────────────────
function ShoeCardGrid({ shoe, onRemove, onBuy }: { shoe: VaultShoe; onRemove: (id: string) => void; onBuy: (shoe: VaultShoe) => void }) {
  const [hovered, setHovered] = useState(false);
  const profit = shoe.resale - shoe.retail;
  const profitPct = ((profit / shoe.retail) * 100).toFixed(0);
  const cond = CONDITION_COLOR[shoe.condition] || { bg: "#333", text: "#fff" };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ border: "3px solid var(--border)", background: "var(--surface)", display: "flex", flexDirection: "column", cursor: "pointer", transition: "transform 0.18s, box-shadow 0.18s", transform: hovered ? "translateY(-5px)" : "translateY(0)", boxShadow: hovered ? "7px 7px 0 var(--border)" : "none", position: "relative", overflow: "hidden" }}
      onClick={() => onBuy(shoe)}
    >
      <div style={{ height: 160, position: "relative", overflow: "hidden" }}>
        <SneakerImage shoeId={shoe.id} name={shoe.name} />
        <div style={{ position: "absolute", top: 7, left: 7, background: "rgba(13,13,13,.82)", color: "var(--gold)", border: "1.5px solid var(--gold)", fontFamily: "var(--fm)", fontSize: 10, fontWeight: 700, padding: "2px 7px", letterSpacing: "0.06em" }}>{shoe.match}% MATCH</div>
        <div style={{ position: "absolute", bottom: 7, left: 7, background: cond.bg, color: cond.text, fontFamily: "var(--fm)", fontSize: 9, fontWeight: 700, padding: "2px 7px" }}>{shoe.condition.toUpperCase()}</div>
        <div style={{ position: "absolute", bottom: 7, right: 7, fontFamily: "var(--fm)", fontSize: 8, color: "rgba(255,255,255,.6)" }}>{shoe.sku}</div>
        <button onClick={e => { e.stopPropagation(); onRemove(shoe.id); }} style={{ position: "absolute", top: 7, right: 7, background: "rgba(200,16,46,0.92)", border: "none", color: "#fff", fontFamily: "var(--ft)", fontSize: 13, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}>✕</button>
      </div>
      <div style={{ background: "var(--border)", color: "var(--surface)", fontFamily: "var(--ft)", fontSize: 11, letterSpacing: "0.1em", padding: "5px 10px", display: "flex", justifyContent: "space-between" }}>
        <span>{shoe.brand}</span><span>SZ {shoe.size}</span>
      </div>
      <div style={{ padding: "10px 10px 12px" }}>
        <div style={{ fontFamily: "var(--ft)", fontSize: 17, lineHeight: 1.1, marginBottom: 3 }}>{shoe.name}</div>
        <div style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--red)", fontWeight: 700, marginBottom: 6 }}>{shoe.colorway}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {shoe.tags.map(t => <span key={t} style={{ background: "var(--border)", color: "var(--surface)", fontFamily: "var(--fm)", fontSize: 8, fontWeight: 700, padding: "2px 6px" }}>{t}</span>)}
        </div>
        <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
          <div style={{ flex: 1, border: "2px solid var(--border)", padding: "4px 7px" }}><span style={{ fontFamily: "var(--fm)", fontSize: 8, color: "var(--red)", fontWeight: 700, display: "block" }}>SILHOUETTE</span><span style={{ fontFamily: "var(--ft)", fontSize: 13 }}>{shoe.silhouette}</span></div>
          <div style={{ flex: 1, border: "2px solid var(--border)", padding: "4px 7px" }}><span style={{ fontFamily: "var(--fm)", fontSize: 8, color: "var(--red)", fontWeight: 700, display: "block" }}>RELEASE</span><span style={{ fontFamily: "var(--ft)", fontSize: 13 }}>{shoe.release}</span></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div><div style={{ fontFamily: "var(--fm)", fontSize: 8, color: "var(--red)", fontWeight: 700 }}>RESALE</div><div style={{ fontFamily: "var(--ft)", fontSize: 22, color: "var(--red)", fontWeight: 700 }}>${shoe.resale}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontFamily: "var(--fm)", fontSize: 8, color: "var(--red)", fontWeight: 700 }}>RETAIL</div><div style={{ fontFamily: "var(--ft)", fontSize: 16, opacity: 0.6 }}>${shoe.retail}</div><div style={{ fontFamily: "var(--fm)", fontSize: 10, color: profit >= 0 ? "var(--green)" : "#8a1a1a", fontWeight: 700, marginTop: 1 }}>{profit >= 0 ? "▲" : "▼"} ${Math.abs(profit)} ({Math.abs(Number(profitPct))}%)</div></div>
        </div>
      </div>
    </div>
  );
}

// ─── SHOE CARD — LIST ─────────────────────────────────────────────────────────
function ShoeCardList({ shoe, onRemove, onBuy }: { shoe: VaultShoe; onRemove: (id: string) => void; onBuy: (shoe: VaultShoe) => void }) {
  const [hovered, setHovered] = useState(false);
  const profit = shoe.resale - shoe.retail;
  const profitPct = ((profit / shoe.retail) * 100).toFixed(0);
  const cond = CONDITION_COLOR[shoe.condition] || { bg: "#333", text: "#fff" };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", alignItems: "center", gap: 0, border: "3px solid var(--border)", background: hovered ? "var(--sa)" : "var(--surface)", transition: "background 0.18s", position: "relative", cursor: "pointer", overflow: "hidden" }}
      onClick={() => onBuy(shoe)}
    >
      <div style={{ width: 90, height: 90, flexShrink: 0, borderRight: "3px solid var(--border)" }}><SneakerImage shoeId={shoe.id} name={shoe.name} /></div>
      <div style={{ flex: 1, padding: "8px 10px", minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
          <span style={{ fontFamily: "var(--ft)", fontSize: 10, letterSpacing: "0.06em", color: "var(--red)" }}>{shoe.brand}</span>
          <span style={{ fontFamily: "var(--fm)", fontSize: 8, color: "var(--red)" }}>SZ {shoe.size} · {shoe.sku}</span>
        </div>
        <div style={{ fontFamily: "var(--ft)", fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shoe.name}</div>
        <div style={{ fontFamily: "var(--fm)", fontSize: 9, color: "var(--red)", fontWeight: 700 }}>{shoe.colorway}</div>
        <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
          <span style={{ background: cond.bg, color: cond.text, fontFamily: "var(--fm)", fontSize: 8, fontWeight: 700, padding: "1px 5px" }}>{shoe.condition}</span>
          {shoe.tags.map(t => <span key={t} style={{ background: "var(--border)", color: "var(--surface)", fontFamily: "var(--fm)", fontSize: 7, fontWeight: 700, padding: "1px 5px" }}>{t}</span>)}
        </div>
      </div>
      <div style={{ padding: "8px 12px", textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--fm)", fontSize: 8, color: "var(--red)", fontWeight: 700 }}>RESALE</div>
        <div style={{ fontFamily: "var(--ft)", fontSize: 20, color: "var(--red)", fontWeight: 700 }}>${shoe.resale}</div>
        <div style={{ fontFamily: "var(--fm)", fontSize: 10, color: profit >= 0 ? "var(--green)" : "#8a1a1a", fontWeight: 700, marginTop: 2 }}>{profit >= 0 ? "▲" : "▼"} ${Math.abs(profit)} ({Math.abs(Number(profitPct))}%)</div>
        <div style={{ fontFamily: "var(--fm)", fontSize: 9, color: "var(--red)", marginTop: 2 }}>{shoe.match}% match</div>
      </div>
      <button onClick={e => { e.stopPropagation(); onRemove(shoe.id); }} style={{ position: "absolute", top: 6, right: 8, background: "none", border: "2px solid var(--red)", color: "var(--red)", fontFamily: "var(--ft)", fontSize: 10, padding: "2px 6px", cursor: "pointer", opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}>✕</button>
    </div>
  );
}

// ─── SHOE DETAIL MODAL ────────────────────────────────────────────────────────
function ShoeDetailModal({ shoe, onClose, onBuy }: { shoe: VaultShoe; onClose: () => void; onBuy: (shoe: VaultShoe) => void }) {
  const story = SHOE_STORIES[shoe.id];
  const cond = CONDITION_COLOR[shoe.condition] || { bg: "#333", text: "#fff" };

  return (
    <div className="mo open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb">
        <button className="mclose" onClick={onClose}>✕ CLOSE</button>

        {/* Hero image */}
        <div style={{ height: 180, marginBottom: 14, border: "3px solid var(--border)", overflow: "hidden" }}>
          <SneakerImage shoeId={shoe.id} name={shoe.name} />
        </div>

        <div style={{ fontFamily: "var(--ft)", fontSize: 28, lineHeight: 0.92, marginBottom: 4 }}>{shoe.name}</div>
        <div style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--red)", fontWeight: 700, marginBottom: 10 }}>{shoe.colorway} · {shoe.sku}</div>

        {/* Quick stats grid */}
        <div className="sgrid">
          <div className="si2"><span className="sl">Brand</span><div className="sv">{shoe.brand}</div></div>
          <div className="si2"><span className="sl">Size</span><div className="sv">{shoe.size}</div></div>
          <div className="si2"><span className="sl">Silhouette</span><div className="sv">{shoe.silhouette}</div></div>
          <div className="si2"><span className="sl">Release</span><div className="sv">{shoe.release}</div></div>
          <div className="si2"><span className="sl">Tech</span><div className="sv">{shoe.tech}</div></div>
          <div className="si2"><span className="sl">Condition</span><div className="sv" style={{ color: cond.bg }}>{shoe.condition}</div></div>
        </div>

        {/* Prices */}
        <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
          <div style={{ flex: 1, border: "3px solid var(--border)", padding: "8px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--fm)", fontSize: 8, color: "var(--red)", fontWeight: 700 }}>RETAIL</div>
            <div style={{ fontFamily: "var(--ft)", fontSize: 24 }}>${shoe.retail}</div>
          </div>
          <div style={{ flex: 1, border: "3px solid var(--red)", padding: "8px", textAlign: "center", background: "rgba(200,16,46,0.05)" }}>
            <div style={{ fontFamily: "var(--fm)", fontSize: 8, color: "var(--red)", fontWeight: 700 }}>RESALE</div>
            <div style={{ fontFamily: "var(--ft)", fontSize: 24, color: "var(--red)" }}>${shoe.resale}</div>
          </div>
        </div>

        {story && (
          <>
            <div className="sech">The Story</div>
            <p style={{ fontFamily: "var(--fm)", fontSize: 11, lineHeight: 1.55, marginBottom: 14 }}>{story.story}</p>

            <div className="sech">Colorway Inspiration</div>
            <p style={{ fontFamily: "var(--fm)", fontSize: 11, lineHeight: 1.55, marginBottom: 14 }}>{story.colorwayInspiration}</p>

            <div style={{ border: "3px solid var(--gold)", background: "rgba(245,166,35,0.06)", padding: 12, marginBottom: 14 }}>
              <div style={{ fontFamily: "var(--ft)", fontSize: 13, color: "var(--gold)", marginBottom: 4 }}>⭐ FUN FACT</div>
              <p style={{ fontFamily: "var(--fm)", fontSize: 10, lineHeight: 1.5 }}>{story.funFact}</p>
            </div>

            <div style={{ fontFamily: "var(--fm)", fontSize: 9, color: "var(--red)", fontWeight: 700, marginBottom: 10 }}>DESIGNED BY: {story.designer}</div>
          </>
        )}

        <button className="btn-r" onClick={() => { onClose(); onBuy(shoe); }}>🛒 BUY NOW — CHECKOUT</button>
        <button className="btn-o" onClick={onClose}>CLOSE</button>
      </div>
    </div>
  );
}

// ─── VAULT BUY MODAL (5-STEP) ─────────────────────────────────────────────────
function VaultBuyModal({ shoe, onClose }: { shoe: VaultShoe; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedRetailer, setSelectedRetailer] = useState(0);
  const [size, setSize] = useState(shoe.size);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [addr, setAddr] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [orderNum, setOrderNum] = useState("");

  const fmtCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/.{1,4}/g, "$& ").trim();
  const fmtExp = (v: string) => { const d = v.replace(/\D/g, ""); return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2, 4) : d; };

  const retailer = VAULT_RETAILERS[selectedRetailer];
  const TAX_RATE = 0.08;
  const subtotal = shoe.resale;
  const shipping = retailer.shipping;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + shipping + tax;

  // Generate per-retailer prices (slight variation)
  const retailerPrices = VAULT_RETAILERS.map((r, i) => {
    const variation = [-5, 0, 7, 12, -8, 3, 10, -2][i] || 0;
    return shoe.resale + variation;
  });
  const bestDealIdx = retailerPrices.indexOf(Math.min(...retailerPrices));

  const SIZES = ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13"];

  const goNext = () => {
    if (step === 2 && !size) return;
    if (step === 3 && (!name.trim() || !email.trim() || !addr.trim() || !city.trim() || !zip.trim())) return;
    if (step === 4) {
      if (card.replace(/\s/g, "").length < 15 || !expiry.includes("/") || cvv.length < 3) return;
      setOrderNum("SS-" + Math.random().toString(36).slice(2, 10).toUpperCase());
    }
    setStep(s => s + 1);
  };

  return (
    <div className="mo open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mb">
        <button className="mclose" onClick={onClose}>✕ CLOSE</button>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
          <div style={{ width: 60, height: 60, border: "3px solid var(--border)", flexShrink: 0 }}><SneakerImage shoeId={shoe.id} name={shoe.name} /></div>
          <div><div style={{ fontFamily: "var(--ft)", fontSize: 18 }}>{shoe.name}</div><div style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--red)", fontWeight: 700 }}>{shoe.colorway} · SZ {size}</div></div>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
          {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ flex: 1, height: 4, background: step >= i ? (step > i ? "var(--green)" : "var(--red)") : "var(--sa)" }} />)}
        </div>

        {/* Step 1: Choose Retailer */}
        {step === 1 && (
          <div>
            <div className="cktitle">01 — CHOOSE RETAILER</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {VAULT_RETAILERS.map((r, i) => (
                <div
                  key={r.name}
                  onClick={() => setSelectedRetailer(i)}
                  style={{
                    border: selectedRetailer === i ? "3px solid var(--red)" : "3px solid var(--border)",
                    background: selectedRetailer === i ? "rgba(200,16,46,0.05)" : "var(--surface)",
                    padding: "10px 12px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.15s",
                  }}
                >
                  <div>
                    <div style={{ fontFamily: "var(--ft)", fontSize: 15 }}>{r.name}</div>
                    <div style={{ display: "flex", gap: 5, marginTop: 2 }}>
                      <span style={{ fontFamily: "var(--fm)", fontSize: 8, fontWeight: 700, background: r.verified ? "var(--green)" : "var(--sa)", color: r.verified ? "#fff" : "var(--txt)", padding: "1px 5px" }}>{r.badge}</span>
                      {i === bestDealIdx && <span style={{ fontFamily: "var(--fm)", fontSize: 8, fontWeight: 700, background: "var(--gold)", color: "var(--bg)", padding: "1px 5px" }}>BEST DEAL</span>}
                      {r.shipping === 0 && <span style={{ fontFamily: "var(--fm)", fontSize: 8, fontWeight: 700, background: "var(--green)", color: "#fff", padding: "1px 5px" }}>FREE SHIP</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--ft)", fontSize: 20, color: "var(--red)", fontWeight: 700 }}>${retailerPrices[i]}</div>
                    <div style={{ fontFamily: "var(--fm)", fontSize: 8, color: "var(--red)" }}>+${r.shipping.toFixed(2)} ship</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-r" onClick={goNext}>SELECT {retailer.name.toUpperCase()} →</button>
          </div>
        )}

        {/* Step 2: Size */}
        {step === 2 && (
          <div>
            <div className="cktitle">02 — SELECT SIZE</div>
            <div className="szgrid">
              {SIZES.map(s => (
                <button key={s} className={`szbtn ${size === s ? "sel" : ""}`} onClick={() => setSize(s)}>{s}</button>
              ))}
            </div>
            <button className="btn-r" onClick={goNext}>CONTINUE →</button>
            <button className="btn-o" onClick={() => setStep(1)}>← BACK</button>
          </div>
        )}

        {/* Step 3: Shipping */}
        {step === 3 && (
          <div>
            <div className="cktitle">03 — SHIPPING INFO</div>
            <div className="aform">
              <div className="fgrp"><label className="flbl">Full Name</label><input className="finp" value={name} onChange={e => setName(e.target.value)} placeholder="Jordan Smith" /></div>
              <div className="fgrp"><label className="flbl">Email</label><input className="finp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jordan@email.com" /></div>
              <div className="fgrp"><label className="flbl">Shipping Address</label><input className="finp" value={addr} onChange={e => setAddr(e.target.value)} placeholder="123 Sneaker Ave" /></div>
              <div className="ckinrow">
                <div className="fgrp"><label className="flbl">City</label><input className="finp" value={city} onChange={e => setCity(e.target.value)} placeholder="Charlotte" /></div>
                <div className="fgrp"><label className="flbl">State</label><input className="finp" value={state} onChange={e => setState(e.target.value.slice(0, 2).toUpperCase())} placeholder="NC" maxLength={2} /></div>
              </div>
              <div className="fgrp"><label className="flbl">ZIP Code</label><input className="finp" value={zip} onChange={e => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="28001" maxLength={5} /></div>
            </div>
            <button className="btn-r" onClick={goNext}>CONTINUE TO PAYMENT →</button>
            <button className="btn-o" onClick={() => setStep(2)}>← BACK</button>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <div>
            <div className="cktitle">04 — PAYMENT</div>
            <div className="aform">
              <div className="fgrp"><label className="flbl">Card Number</label><input className="finp" value={card} onChange={e => setCard(fmtCard(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19} /></div>
              <div className="ckinrow">
                <div className="fgrp"><label className="flbl">Expiry</label><input className="finp" value={expiry} onChange={e => setExpiry(fmtExp(e.target.value))} placeholder="MM/YY" maxLength={5} /></div>
                <div className="fgrp"><label className="flbl">CVV</label><input className="finp" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="•••" /></div>
              </div>
              <div className="fgrp"><label className="flbl">Name on Card</label><input className="finp" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Jordan Smith" /></div>
            </div>
            <div className="osm" style={{ marginTop: 12 }}>
              <div className="osr"><span>Subtotal ({retailer.name})</span><span>${subtotal}</span></div>
              <div className="osr"><span>Shipping</span><span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span></div>
              <div className="osr"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="osr tot"><span>TOTAL</span><span>${total.toFixed(2)}</span></div>
            </div>
            <p style={{ fontFamily: "var(--fm)", fontSize: 9, color: "var(--red)", textAlign: "center", marginTop: 4 }}>🔒 256-BIT ENCRYPTED · SECURE CHECKOUT</p>
            <button className="btn-r" onClick={goNext}>🔒 PLACE ORDER — ${total.toFixed(2)}</button>
            <button className="btn-o" onClick={() => setStep(3)}>← BACK</button>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div style={{ textAlign: "center", padding: "18px 0" }}>
            <div style={{ fontSize: 46, marginBottom: 8 }}>✅</div>
            <div style={{ fontFamily: "var(--ft)", fontSize: 28 }}>ORDER PLACED!</div>
            <div style={{ fontFamily: "var(--fm)", fontSize: 11, color: "var(--red)", fontWeight: 700 }}>Order #{orderNum}</div>
            <div style={{ fontFamily: "var(--fm)", fontSize: 10, marginTop: 4 }}>via {retailer.name} · ${total.toFixed(2)}</div>
            <div style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--red)", marginTop: 4 }}>Confirmation → {email}</div>
            <div style={{ fontFamily: "var(--fm)", fontSize: 9, marginTop: 8, opacity: 0.6 }}>Estimated delivery: 5-7 business days</div>
            <button className="btn-r" style={{ marginTop: 14 }} onClick={onClose}>CLOSE</button>
          </div>
        )}
      </div>
    </div>
  );
}
interface VaultItem extends ShoeResult {
  savedAt: string;
}

interface DropItem {
  id: string;
  name: string;
  brand: string;
  colorway: string;
  date: string;
  retail: number;
  image: string;
  hype: "HIGH" | "SELLOUT" | "LIMITED";
  alert: boolean;
}

interface MarketItem {
  id: string;
  name: string;
  brand: string;
  colorway: string;
  trend: "up" | "down";
  trendPct: string;
  prices: { label: string; value: string }[];
}

interface Listing {
  id: string;
  name: string;
  colorway: string;
  price: number;
  status: "live" | "sold" | "pending";
  image?: string;
}

// ─── DATA ────────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { text: "AJ1 CHICAGO", price: "$298" },
  { text: "DUNK LOW PANDA", price: "$118" },
  { text: "YEEZY 350 ZEBRA", price: "$240" },
  { text: "NB 550 GREEN", price: "$95" },
  { text: "AJ4 BRED", price: "$420" },
  { text: "AF1 WHITE", price: "$90" },
  { text: "AJ11 CONCORD", price: "$380" },
  { text: "DUNK SB TRAVIS", price: "$1,850" },
];

const INITIAL_DROPS: DropItem[] = [
  { id: "d1", name: "Air Jordan 4 Retro", brand: "JORDAN", colorway: "Bred Reimagined", date: "Apr 12, 2026", retail: 210, image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&q=80&w=600", hype: "HIGH", alert: false },
  { id: "d2", name: "Nike Dunk Low", brand: "NIKE", colorway: "University Blue", date: "Apr 19, 2026", retail: 115, image: "https://images.unsplash.com/photo-1607522370275-f6fd4197767c?auto=format&fit=crop&q=80&w=600", hype: "SELLOUT", alert: false },
  { id: "d3", name: "Yeezy Slide", brand: "ADIDAS", colorway: "Onyx", date: "Apr 25, 2026", retail: 70, image: "https://images.unsplash.com/photo-1584735175315-9d5df23be6e0?auto=format&fit=crop&q=80&w=600", hype: "LIMITED", alert: false },
];

const INITIAL_MARKET: MarketItem[] = [
  { id: "m1", name: "Air Jordan 1 High OG", brand: "JORDAN", colorway: "Chicago · DZ5485-612", trend: "up", trendPct: "+12%", prices: [{ label: "StockX", value: "$298" }, { label: "GOAT", value: "$305" }, { label: "Flight Club", value: "$310" }, { label: "eBay", value: "$285" }] },
  { id: "m2", name: "Nike Dunk Low", brand: "NIKE", colorway: "Panda · DD1391-100", trend: "down", trendPct: "-3%", prices: [{ label: "StockX", value: "$118" }, { label: "GOAT", value: "$120" }, { label: "Flight Club", value: "$125" }, { label: "eBay", value: "$112" }] },
  { id: "m3", name: "Yeezy Boost 350 V2", brand: "ADIDAS", colorway: "Zebra · CP9654", trend: "up", trendPct: "+8%", prices: [{ label: "StockX", value: "$240" }, { label: "GOAT", value: "$245" }, { label: "Flight Club", value: "$255" }, { label: "eBay", value: "$230" }] },
];

const SIZES = ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13"];
const CONDITIONS = ["Deadstock", "New in Box", "Like New", "Used — Great", "Used — Good", "Heavily Used"];

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
const Index = () => {
  // Navigation
  const [activeScreen, setActiveScreen] = useState("scan");

  // Scan state
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [shoeResult, setShoeResult] = useState<ShoeResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [drawerCollapsed, setDrawerCollapsed] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Vault (scanned shoes)
  const [vault, setVault] = useState<VaultItem[]>([]);
  // Vault collection (pre-loaded shoes with images)
  const [vaultShoes, setVaultShoes] = useState<VaultShoe[]>(INITIAL_VAULT_SHOES);
  const [vaultView, setVaultView] = useState<"grid" | "list">("grid");
  const [vaultSort, setVaultSort] = useState("saved");
  const [vaultFilter, setVaultFilter] = useState("ALL");
  const [vaultSearch, setVaultSearch] = useState("");
  const [vaultBuyShoe, setVaultBuyShoe] = useState<VaultShoe | null>(null);
  const [vaultDetailShoe, setVaultDetailShoe] = useState<VaultShoe | null>(null);

  // Drops
  const [drops, setDrops] = useState<DropItem[]>(INITIAL_DROPS);
  const [alertModal, setAlertModal] = useState<DropItem | null>(null);

  // Market
  const [market] = useState<MarketItem[]>(INITIAL_MARKET);
  const [marketDetail, setMarketDetail] = useState<MarketItem | null>(null);

  // Sell
  const [loggedIn, setLoggedIn] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [sellForm, setSellForm] = useState({ name: "", colorway: "", size: "", condition: "Deadstock", price: "" });

  // Profile
  const [totalScans, setTotalScans] = useState(0);
  const [memberPlan, setMemberPlan] = useState("FREE");
  const [editingUsername, setEditingUsername] = useState(false);
  const [editUsernameVal, setEditUsernameVal] = useState("");
  const [dropAlerts, setDropAlerts] = useState(true);
  const [resaleAlerts, setResaleAlerts] = useState(false);

  // Auth modal
  const [authModal, setAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authPassConfirm, setAuthPassConfirm] = useState("");
  const [authUser, setAuthUser] = useState("");
  const [authError, setAuthError] = useState("");

  const [memberModal, setMemberModal] = useState(false);
  const [memberStep, setMemberStep] = useState<"plans" | "payment" | "success">("plans");
  const [memberCardNum, setMemberCardNum] = useState("");
  const [memberCardExp, setMemberCardExp] = useState("");
  const [memberCardCvv, setMemberCardCvv] = useState("");
  const [memberCardName, setMemberCardName] = useState("");

  // Checkout modal
  const [selectedPlan, setSelectedPlan] = useState("free");

  // Checkout modal
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [checkoutShoe, setCheckoutShoe] = useState<ShoeResult | MarketItem | null>(null);
  const [ckStep, setCkStep] = useState(0);
  const [ckSize, setCkSize] = useState("");
  const [ckName, setCkName] = useState("");
  const [ckEmail, setCkEmail] = useState("");
  const [ckAddr, setCkAddr] = useState("");
  const [ckCity, setCkCity] = useState("");
  const [ckZip, setCkZip] = useState("");
  const [ckCard, setCkCard] = useState("");
  const [ckExp, setCkExp] = useState("");
  const [ckCvv, setCkCvv] = useState("");
  const [ckCardName, setCkCardName] = useState("");
  const [orderNum, setOrderNum] = useState("");

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // ─── CAMERA ──────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      streamRef.current = stream;
      setCameraActive(true);
    } catch {
      showToast("Camera access denied");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (activeScreen === "scan" && !scanned) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [activeScreen, scanned]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    const dataUrl = c.toDataURL("image/jpeg", 0.85);
    identifyShoe(dataUrl);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      identifyShoe(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const identifyShoe = async (imageBase64: string) => {
    setCapturedImage(imageBase64);
    setScanning(true);
    setScanned(true);
    setDrawerCollapsed(false);
    stopCamera();

    try {
      const { data, error } = await supabase.functions.invoke("identify-shoe", {
        body: { imageBase64 },
      });
      if (error) throw error;
      setShoeResult({ ...data, photo: imageBase64 });
      setTotalScans(s => s + 1);
    } catch {
      showToast("Identification failed — try again");
      setScanned(false);
      setScanning(false);
      startCamera();
    } finally {
      setScanning(false);
    }
  };

  const resetScan = () => {
    setScanned(false);
    setShoeResult(null);
    setCapturedImage(null);
    setDrawerCollapsed(true);
    setScanning(false);
  };

  const saveToVault = () => {
    if (!shoeResult) return;
    setVault(prev => [...prev, { ...shoeResult, photo: capturedImage || undefined, savedAt: new Date().toLocaleDateString() }]);
    showToast("Saved to vault!");
  };

  const removeFromVault = (i: number) => {
    setVault(prev => prev.filter((_, idx) => idx !== i));
    showToast("Removed from vault");
  };

  // ─── CHECKOUT ────────────────────────────────────────────────────────────
  const openCheckout = (shoe: ShoeResult | MarketItem) => {
    setCheckoutShoe(shoe);
    setCkStep(0);
    setCkSize("");
    setCkName("");
    setCkEmail("");
    setCkAddr("");
    setCkCity("");
    setCkZip("");
    setCkCard("");
    setCkExp("");
    setCkCvv("");
    setCkCardName("");
    setOrderNum("");
    setCheckoutModal(true);
  };

  const fmtCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/.{1,4}/g, "$& ").trim();
  const fmtExp = (v: string) => { const d = v.replace(/\D/g, ""); return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2, 4) : d; };

  const ckNext = () => {
    if (ckStep === 0 && !ckSize) return;
    if (ckStep === 1 && (!ckName || !ckEmail || !ckAddr)) return;
    if (ckStep === 2) {
      if (ckCard.replace(/\s/g, "").length < 15 || !ckExp.includes("/") || ckCvv.length < 3) return;
      setOrderNum("SS-" + Math.random().toString(36).slice(2, 10).toUpperCase());
    }
    setCkStep(s => s + 1);
  };

  // ─── SELL ────────────────────────────────────────────────────────────────
  const submitListing = () => {
    if (!sellForm.name || !sellForm.price) return;
    setListings(prev => [...prev, {
      id: Date.now().toString(),
      name: sellForm.name,
      colorway: sellForm.colorway,
      price: Number(sellForm.price),
      status: "live",
    }]);
    setSellForm({ name: "", colorway: "", size: "", condition: "Deadstock", price: "" });
    showToast("Listing created!");
  };

  // ─── AUTH ────────────────────────────────────────────────────────────────
  const handleAuth = () => {
    setAuthError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authEmail)) { setAuthError("Please enter a valid email address."); return; }
    if (authPass.length < 6) { setAuthError("Password must be at least 6 characters."); return; }
    if (authTab === "signup") {
      if (authPassConfirm !== authPass) { setAuthError("Passwords do not match."); return; }
      if (!authUser.trim()) { setAuthError("Please choose a username."); return; }
    }
    setLoggedIn(true);
    setAuthModal(false);
    setAuthError("");
    showToast(authTab === "login" ? "Logged in!" : "Account created!");
  };

  // ─── RENDER HELPERS ────────────────────────────────────────────────────────
  const tickerContent = TICKER_ITEMS.map(t => `${t.text} <b>${t.price}</b>`).join(" · ");
  const tickerHtml = tickerContent + " · " + tickerContent;

  const tabItems = [
    { key: "scan", label: "Scan", notif: null },
    { key: "drops", label: "Drops", notif: drops.filter(d => d.hype === "HIGH").length || null },
    { key: "market", label: "Market", notif: null },
    { key: "vault", label: "Vault", notif: (vaultShoes.length + vault.length) || null },
    { key: "sell", label: "Sell", notif: null },
    { key: "id", label: "Profile", notif: null },
  ];

  return (
    <>
      {/* TICKER */}
      <div className="ticker-bar">
        <div className="ticker-inner" dangerouslySetInnerHTML={{ __html: tickerHtml }} />
        <button className="bell-btn">🔔 ALERTS</button>
      </div>

      {/* ═══════════════════ SCAN SCREEN ═══════════════════ */}
      <div className={`screen ${activeScreen === "scan" ? "active" : ""}`} style={{ position: "relative" }}>
        {/* Background */}
        <div className="jbg" style={capturedImage ? { backgroundImage: `url(${capturedImage})` } : {}} />
        {capturedImage && <div className={`cam-scanned ${scanned ? "vis" : ""}`} style={{ backgroundImage: `url(${capturedImage})` }} />}

        {/* Camera video */}
        <video ref={videoRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1, display: cameraActive && !scanned ? "block" : "none" }} playsInline muted />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Scan frame */}
        <div className="hf" style={{ zIndex: 5 }}>
          <div className="hc tl" /><div className="hc tr" /><div className="hc bl" /><div className="hc br" />
          <div className={`sline ${scanning ? "run" : ""}`} />
          {scanning && <div className="hlbl" style={{ bottom: "12px", left: "50%", transform: "translateX(-50%)" }}>ANALYZING...</div>}
        </div>

        {/* Watermark */}
        <div className="wmark">
          <div className="wm1">SNAPSHOTZ SOLES</div>
          <span className="wm2">AI SHOE RECOGNITION</span>
        </div>

        {/* Scan UI */}
        <div className="si">
          <div className="sh">
            <div className="sbdg"><div className={`sdot ${scanning ? "pulse" : ""}`} />MODE: {scanning ? "SCANNING" : scanned ? "IDENTIFIED" : "STANDBY"}</div>
            <div className="obdg">VER 1.0</div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Status labels */}
          {!scanned && !scanning && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div className="hlbl" style={{ position: "static" }}>AWAITING SCAN...</div>
              <div className="hlbl" style={{ position: "static" }}>[0] OBJECTS</div>
            </div>
          )}
          {scanned && shoeResult && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div className="hlbl" style={{ position: "static" }}>IDENTIFIED</div>
              <div className="hlbl" style={{ position: "static" }}>{shoeResult.confidence}% MATCH</div>
            </div>
          )}

          {/* Capture / Upload */}
          {!scanned && (
            <div className="capwrap">
              <button className="capbtn" onClick={capturePhoto}>
                <div className="capinn">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><circle cx="12" cy="13" r="4" /><path d="M5 7h2l2-3h6l2 3h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z" /></svg>
                </div>
              </button>
              <label className="uplbl">
                ⬆ UPLOAD IMAGE
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
              </label>
            </div>
          )}

          {/* Results drawer */}
          <div className={`drw ${drawerCollapsed ? "coll" : ""}`}>
            <div className="hdl" onClick={() => setDrawerCollapsed(!drawerCollapsed)} />

            {scanning && !shoeResult && (
              <>
                <div className="stitle">Scanning...</div>
                <div className="smeta">ANALYZING IMAGE</div>
                <div className="cbar"><div className="cfill" style={{ width: "60%" }} /></div>
              </>
            )}

            {shoeResult && (
              <>
                <div className="stitle">{shoeResult.name}</div>
                <div className="smeta">
                  <span>{shoeResult.brand}</span>
                  <span>{shoeResult.colorway}</span>
                  <span>{shoeResult.confidence}% MATCH</span>
                </div>
                <div className="cbar"><div className="cfill" style={{ width: `${shoeResult.confidence}%` }} /></div>

                <div className="sgrid">
                  <div className="si2"><span className="sl">Silhouette</span><div className="sv">{shoeResult.silhouette}</div></div>
                  <div className="si2"><span className="sl">Colorway</span><div className="sv">{shoeResult.colorway}</div></div>
                  <div className="si2"><span className="sl">Release</span><div className="sv">{shoeResult.release}</div></div>
                  <div className="si2"><span className="sl">Tech</span><div className="sv">{shoeResult.tech}</div></div>
                </div>

                {shoeResult.designer && (
                  <div className="sgrid" style={{ gridTemplateColumns: "1fr" }}>
                    <div className="si2"><span className="sl">Designer</span><div className="sv">{shoeResult.designer}</div></div>
                  </div>
                )}

                {shoeResult.inspiration && (
                  <>
                    <div className="sech">The Story</div>
                    <p style={{ fontFamily: "var(--fm)", fontSize: 11, lineHeight: 1.5, marginBottom: 12 }}>{shoeResult.inspiration}</p>
                  </>
                )}

                <button className="btn-o" onClick={saveToVault}>+ SAVE TO VAULT</button>

                <div className="sech">Where to Buy</div>
                <div className="rgrid">
                  {["StockX", "GOAT", "Flight Club", "eBay"].map(r => (
                    <div key={r} className="sc" onClick={() => openCheckout(shoeResult)}>
                      <div className="sct">
                        <span className="scn">{r}</span>
                        <span className="scb bb">BUY</span>
                      </div>
                      <div className="scs">LOWEST ASK</div>
                      <div className="scp">{shoeResult.estimatedPrice || "—"}</div>
                      <span className="sca">→</span>
                    </div>
                  ))}
                </div>

                <button className="btn-r" onClick={() => openCheckout(shoeResult)}>🛒 BUY NOW — CHECKOUT</button>
                <button className="btn-o" style={{ marginTop: 8 }} onClick={resetScan}>SCAN ANOTHER</button>
              </>
            )}

            {!scanning && !shoeResult && (
              <>
                <div className="stitle">—</div>
                <div className="smeta">—% MATCH · ID: —</div>
                <div className="sgrid">
                  <div className="si2"><span className="sl">Silhouette</span><div className="sv">—</div></div>
                  <div className="si2"><span className="sl">Colorway</span><div className="sv">—</div></div>
                  <div className="si2"><span className="sl">Release</span><div className="sv">—</div></div>
                  <div className="si2"><span className="sl">Tech</span><div className="sv">—</div></div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════ DROPS SCREEN ═══════════════════ */}
      <div className={`screen ${activeScreen === "drops" ? "active" : ""}`} style={{ background: "var(--surface)" }}>
        <div className="phdr">
          <div className="phdr-logo">SNAPSHOTZ SOLES</div>
          <div className="phdr-title">Drop Calendar</div>
          <div className="phdr-sub">UPCOMING RELEASES · SET ALERTS</div>
        </div>
        <div className="dlist">
          {drops.map(drop => (
            <div key={drop.id} className="dcard">
              <div className="dcimg" style={{ backgroundImage: `url(${drop.image})` }}>
                <div className="dcimgi">
                  <div className="dcbr">{drop.brand}</div>
                  <div className="dcn">{drop.name}</div>
                </div>
              </div>
              <div className="dcbody">
                <div className="dmr">
                  <div className="ddate"><span className="ddlbl">Drop Date</span>{drop.date}</div>
                  <div className="dret">${drop.retail}</div>
                </div>
                <div style={{ display: "flex", gap: 5, marginBottom: 9 }}>
                  <span className="dtag th">{drop.hype}</span>
                  <span className="dtag ts">{drop.colorway}</span>
                </div>
                <div className="cdown">⏱ COUNTDOWN ACTIVE</div>
                <button
                  className={`dnbtn ${drop.alert ? "dnset" : "dnon"}`}
                  onClick={() => {
                    if (!drop.alert) {
                      setAlertModal(drop);
                    } else {
                      setDrops(prev => prev.map(d => d.id === drop.id ? { ...d, alert: false } : d));
                      showToast("Alert removed");
                    }
                  }}
                >
                  {drop.alert ? "✓ ALERT SET" : "🔔 SET DROP ALERT"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════ MARKET SCREEN ═══════════════════ */}
      <div className={`screen ${activeScreen === "market" ? "active" : ""}`} style={{ background: "var(--surface)" }}>
        <div className="phdr">
          <div className="phdr-logo">SNAPSHOTZ SOLES</div>
          <div className="phdr-title">Market</div>
          <div className="phdr-sub">LIVE RESALE PRICES · 8 RETAILERS</div>
        </div>
        <div className="mklist">
          {market.map(item => (
            <div key={item.id} className="mkcard">
              <div className="mkhdr">
                <span className="mkbr">{item.brand}</span>
                <span className={`mktr ${item.trend === "up" ? "up" : "dn"}`}>{item.trendPct}</span>
              </div>
              <div className="mkbody">
                <div className="mkname">{item.name}</div>
                <div className="mkcw">{item.colorway}</div>
                <div className="mkp">
                  {item.prices.map(p => (
                    <div key={p.label} className="mpb">
                      <span className="mps">{p.label.toUpperCase()}</span>
                      <span className="mpn">{p.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mkctas">
                  <button className="mkcta" onClick={() => openCheckout(item)}>BUY NOW</button>
                  <button className="mkcta sec" onClick={() => setMarketDetail(item)}>DETAILS</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════ VAULT SCREEN ═══════════════════ */}
      <div className={`screen ${activeScreen === "vault" ? "active" : ""}`} style={{ background: "var(--surface)" }}>
        <div className="phdr">
          <div className="phdr-logo">SNAPSHOTZ SOLES</div>
          <div className="phdr-title">My Vault</div>
          <div className="phdr-sub">{vaultShoes.length + vault.length} PAIRS · AI-SCANNED COLLECTION</div>
        </div>

        {/* Vault summary stats */}
        {(() => {
          const totalResale = vaultShoes.reduce((s, v) => s + v.resale, 0);
          const totalRetail = vaultShoes.reduce((s, v) => s + v.retail, 0);
          const totalProfit = totalResale - totalRetail;
          return (
            <div style={{ display: "flex", gap: 3, padding: "10px 14px 0", background: "var(--border)" }}>
              {[
                { l: "Vault Value", v: `$${totalResale.toLocaleString()}` },
                { l: "Paid Retail", v: `$${totalRetail.toLocaleString()}` },
                { l: "Net Gain", v: `${totalProfit >= 0 ? "+" : ""}$${totalProfit.toLocaleString()}`, green: totalProfit >= 0 },
              ].map(({ l, v, green }) => (
                <div key={l} style={{ flex: 1, background: "var(--surface)", padding: "7px 9px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--fm)", fontSize: 8, color: "var(--red)", fontWeight: 700, textTransform: "uppercase" }}>{l}</div>
                  <div style={{ fontFamily: "var(--ft)", fontSize: 18, color: green ? "var(--green)" : "var(--txt)", fontWeight: 700 }}>{v}</div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Vault controls */}
        <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8, borderBottom: "3px solid var(--border)" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <input value={vaultSearch} onChange={e => setVaultSearch(e.target.value)} placeholder="Search by name or colorway..." className="finp" style={{ flex: 1, minWidth: 140, fontSize: 12, padding: "6px 10px" }} />
            <div style={{ display: "flex", gap: 4 }}>
              {["ALL", ...Array.from(new Set(INITIAL_VAULT_SHOES.map(s => s.brand)))].map(b => (
                <button key={b} onClick={() => setVaultFilter(b)} style={{ background: vaultFilter === b ? "var(--border)" : "transparent", color: vaultFilter === b ? "var(--gold)" : "var(--border)", border: "2px solid var(--border)", fontFamily: "var(--ft)", fontSize: 11, padding: "4px 8px", cursor: "pointer", letterSpacing: "0.05em" }}>{b}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "space-between", alignItems: "center" }}>
            <select value={vaultSort} onChange={e => setVaultSort(e.target.value)} className="fsel" style={{ fontSize: 11, padding: "5px 8px", width: "auto" }}>
              <option value="saved">Sort: Saved</option>
              <option value="resale">Sort: Resale ↓</option>
              <option value="match">Sort: Match %</option>
              <option value="brand">Sort: Brand</option>
            </select>
            <div style={{ display: "flex", gap: 2 }}>
              {([["grid", "⊞"], ["list", "≡"]] as const).map(([v, icon]) => (
                <button key={v} onClick={() => setVaultView(v as "grid" | "list")} style={{ background: vaultView === v ? "var(--border)" : "transparent", color: vaultView === v ? "var(--gold)" : "var(--border)", border: "none", fontFamily: "var(--ft)", fontSize: 17, padding: "4px 12px", cursor: "pointer" }}>{icon}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Vault content */}
        <div className="vlist">
          {(() => {
            const sorted = [...vaultShoes]
              .filter(s => vaultFilter === "ALL" || s.brand === vaultFilter)
              .filter(s => !vaultSearch || s.name.toLowerCase().includes(vaultSearch.toLowerCase()) || s.colorway.toLowerCase().includes(vaultSearch.toLowerCase()))
              .sort((a, b) => {
                if (vaultSort === "resale") return b.resale - a.resale;
                if (vaultSort === "match") return b.match - a.match;
                if (vaultSort === "brand") return a.brand.localeCompare(b.brand);
                return 0;
              });

            if (sorted.length === 0 && vault.length === 0) {
              return (
                <div className="empty">
                  <div style={{ fontSize: 42 }}>👟</div>
                  <h3 style={{ fontFamily: "var(--ft)", fontSize: 22 }}>VAULT IS EMPTY</h3>
                  <p>{vaultSearch || vaultFilter !== "ALL" ? "No shoes match your filters." : "Scan a shoe to add it to your vault."}</p>
                </div>
              );
            }

            return (
              <>
                {vaultView === "grid" ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, padding: 14 }}>
                    {sorted.map((shoe, i) => (
                      <div key={shoe.id} style={{ animation: `fadeUp 0.4s ease ${i * 0.06}s both` }}>
                        <ShoeCardGrid shoe={shoe} onRemove={id => { setVaultShoes(v => v.filter(s => s.id !== id)); showToast("Removed from vault"); }} onBuy={s => setVaultDetailShoe(s)} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 14 }}>
                    {sorted.map((shoe, i) => (
                      <div key={shoe.id} style={{ animation: `fadeUp 0.4s ease ${i * 0.06}s both` }}>
                        <ShoeCardList shoe={shoe} onRemove={id => { setVaultShoes(v => v.filter(s => s.id !== id)); showToast("Removed from vault"); }} onBuy={s => setVaultBuyShoe(s)} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Also show scanned vault items */}
                {vault.length > 0 && (
                  <>
                    <div style={{ fontFamily: "var(--ft)", fontSize: 12, letterSpacing: "0.1em", color: "var(--red)", textTransform: "uppercase", padding: "10px 14px", borderTop: "3px solid var(--border)" }}>SCANNED SHOES</div>
                    {vault.map((v, i) => (
                      <div key={i} className="vitem" style={{ margin: "0 14px 8px" }}>
                        <div className="vthumb">{v.photo && <img src={v.photo} alt={v.name} />}</div>
                        <div className="vinfo">
                          <div className="vname">{v.name}</div>
                          <div className="vsub">{v.brand} · {v.colorway}</div>
                        </div>
                        <div className="vbdg">{v.estimatedPrice || "—"}</div>
                        <button className="vdel" onClick={e => { e.stopPropagation(); removeFromVault(i); }}>✕</button>
                      </div>
                    ))}
                  </>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Vault Buy Modal */}
      {vaultBuyShoe && <VaultBuyModal shoe={vaultBuyShoe} onClose={() => setVaultBuyShoe(null)} />}

      {/* ═══════════════════ SELL SCREEN ═══════════════════ */}
      <div className={`screen ${activeScreen === "sell" ? "active" : ""}`} style={{ background: "var(--surface)" }}>
        <div className="phdr">
          <div className="phdr-logo">SNAPSHOTZ SOLES</div>
          <div className="phdr-title">Sell</div>
          <div className="phdr-sub">LIST YOUR SNEAKERS</div>
        </div>
        <div className="sbody">
          {!loggedIn ? (
            <div className="login-gate">
              <h2>SELL YOUR KICKS</h2>
              <p>Log in or create an account to start listing your sneakers.</p>
              <button className="btn-r" style={{ maxWidth: 260 }} onClick={() => setAuthModal(true)}>LOG IN / SIGN UP</button>
            </div>
          ) : (
            <div className="lfm">
              <div className="fsect">CREATE LISTING</div>
              <div className="fgrp">
                <label className="flbl">Shoe Name</label>
                <input className="finp" value={sellForm.name} onChange={e => setSellForm(p => ({ ...p, name: e.target.value }))} placeholder="Air Jordan 1 High OG" />
              </div>
              <div className="fgrp">
                <label className="flbl">Colorway</label>
                <input className="finp" value={sellForm.colorway} onChange={e => setSellForm(p => ({ ...p, colorway: e.target.value }))} placeholder="Chicago" />
              </div>
              <div className="frow">
                <div className="fgrp">
                  <label className="flbl">Size</label>
                  <select className="fsel" value={sellForm.size} onChange={e => setSellForm(p => ({ ...p, size: e.target.value }))}>
                    <option value="">Select</option>
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="fgrp">
                  <label className="flbl">Condition</label>
                  <select className="fsel" value={sellForm.condition} onChange={e => setSellForm(p => ({ ...p, condition: e.target.value }))}>
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="fgrp">
                <label className="flbl">Asking Price ($)</label>
                <input className="finp" type="number" value={sellForm.price} onChange={e => setSellForm(p => ({ ...p, price: e.target.value }))} placeholder="250" />
              </div>
              <button className="btn-r" onClick={submitListing}>LIST FOR SALE</button>

              {listings.length > 0 && (
                <>
                  <div className="fsect" style={{ marginTop: 16 }}>YOUR LISTINGS</div>
                  <div className="lcards">
                    {listings.map(l => (
                      <div key={l.id} className="lcard">
                        <div className="limg" />
                        <div className="linfo">
                          <div className="lname">{l.name}</div>
                          <div className="lsub">{l.colorway}</div>
                          <span className={`lstatus ${l.status === "live" ? "ls-live" : l.status === "sold" ? "ls-sold" : "ls-pend"}`}>{l.status.toUpperCase()}</span>
                        </div>
                        <div className="lprice">${l.price}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════ PROFILE SCREEN ═══════════════════ */}
      <div className={`screen ${activeScreen === "id" ? "active" : ""}`} style={{ background: "var(--surface)" }}>
        <div className="phdr">
          <div className="phdr-logo">SNAPSHOTZ SOLES</div>
          <div className="phdr-title">My Profile</div>
          <div className="phdr-sub">{loggedIn ? authUser || authEmail : "NOT LOGGED IN"}</div>
        </div>
        <div className="idbody">
          {/* Big name block */}
          <div className="idbig">SNAP{"\n"}SHOTZ{"\n"}{loggedIn ? `@${authUser || "USER"}` : "@GUEST"}</div>
          {loggedIn && <div className="mbdg">★ {memberPlan}</div>}

          {/* Username edit */}
          {loggedIn && (
            <div className="idcard">
              <div className="idst">Username</div>
              {editingUsername ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <input className="finp" style={{ flex: 1, fontSize: 14, padding: "7px 10px" }} value={editUsernameVal} onChange={e => setEditUsernameVal(e.target.value)} placeholder="New username" />
                  <button className="btn-r" style={{ width: "auto", padding: "7px 14px", marginTop: 0 }} onClick={() => { if (editUsernameVal.trim()) setAuthUser(editUsernameVal.trim()); setEditingUsername(false); showToast("Username updated!"); }}>SAVE</button>
                  <button className="btn-o" style={{ width: "auto", padding: "7px 14px", marginTop: 0 }} onClick={() => setEditingUsername(false)}>CANCEL</button>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--ft)", fontSize: 18 }}>@{authUser || "USER"}</span>
                  <button style={{ background: "none", border: "2px solid var(--border)", fontFamily: "var(--ft)", fontSize: 10, padding: "3px 10px", cursor: "pointer", letterSpacing: "0.05em" }} onClick={() => { setEditUsernameVal(authUser); setEditingUsername(true); }}>EDIT</button>
                </div>
              )}
            </div>
          )}

          {/* Stats — live from vault data */}
          {(() => {
            const allPairs = vaultShoes.length + vault.length;
            const totalVal = vaultShoes.reduce((s, v) => s + v.resale, 0);
            const totalRet = vaultShoes.reduce((s, v) => s + v.retail, 0);
            const netGain = totalVal - totalRet;
            const brandCounts: Record<string, number> = {};
            vaultShoes.forEach(s => { brandCounts[s.brand] = (brandCounts[s.brand] || 0) + 1; });
            const topBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
            return (
              <div className="idcard">
                <div className="idst">Stats</div>
                <div className="idr"><span className="idk">TOTAL SCANS</span><span className="idv">{totalScans}</span></div>
                <div className="idr"><span className="idk">VAULT SIZE</span><span className="idv">{allPairs} pairs</span></div>
                <div className="idr"><span className="idk">VAULT VALUE</span><span className="idv">${totalVal.toLocaleString()}</span></div>
                <div className="idr"><span className="idk">RETAIL PAID</span><span className="idv">${totalRet.toLocaleString()}</span></div>
                <div className="idr"><span className="idk">NET GAIN</span><span className="idv" style={{ color: netGain >= 0 ? "var(--green)" : "var(--red)" }}>{netGain >= 0 ? "+" : ""}${netGain.toLocaleString()}</span></div>
                <div className="idr"><span className="idk">TOP BRAND</span><span className="idv">{topBrand}</span></div>
                <div className="idr"><span className="idk">LISTINGS</span><span className="idv">{listings.length} active</span></div>
                <div className="idr"><span className="idk">PLAN</span><span className="idv">{memberPlan}</span></div>
              </div>
            );
          })()}

          {/* Membership mini preview */}
          <div className="idcard">
            <div className="idst">Membership</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
              {([
                { key: "FREE", label: "BASIC", price: "$0" },
                { key: "SNEAKER HEAD", label: "GOLD", price: "$9.99" },
                { key: "SOLE PRO", label: "PRO", price: "$24.99" },
              ] as const).map(p => (
                <div key={p.key} style={{ border: memberPlan === p.key ? "3px solid var(--red)" : "3px solid var(--border)", background: memberPlan === p.key ? "rgba(200,16,46,0.06)" : "var(--surface)", padding: "8px 6px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--ft)", fontSize: 12, letterSpacing: "0.05em" }}>{p.label}</div>
                  <div style={{ fontFamily: "var(--ft)", fontSize: 18, color: "var(--red)", fontWeight: 700 }}>{p.price}</div>
                  {memberPlan === p.key && <div style={{ fontFamily: "var(--fm)", fontSize: 8, fontWeight: 700, color: "var(--green)", marginTop: 2 }}>ACTIVE</div>}
                </div>
              ))}
            </div>
            <button className="btn-o" style={{ marginTop: 8 }} onClick={() => { setMemberStep("plans"); setMemberModal(true); }}>VIEW ALL PLANS & UPGRADE</button>
          </div>

          {/* Notifications */}
          <div className="idcard">
            <div className="idst">Notifications</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(13,13,13,0.12)" }}>
              <span style={{ fontFamily: "var(--fm)", fontSize: 11, fontWeight: 700 }}>Drop Alerts</span>
              <button onClick={() => setDropAlerts(!dropAlerts)} style={{ width: 40, height: 22, borderRadius: 11, border: "none", background: dropAlerts ? "var(--green)" : "var(--sa)", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: dropAlerts ? 21 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
              <span style={{ fontFamily: "var(--fm)", fontSize: 11, fontWeight: 700 }}>Resale Price Alerts</span>
              <button onClick={() => setResaleAlerts(!resaleAlerts)} style={{ width: 40, height: 22, borderRadius: 11, border: "none", background: resaleAlerts ? "var(--green)" : "var(--sa)", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: resaleAlerts ? 21 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
              </button>
            </div>
            <button className="btn-o" style={{ marginTop: 6 }} onClick={() => showToast("Notification preferences saved!")}>SAVE PREFERENCES</button>
          </div>

          {/* Interests */}
          <div className="idcard">
            <div className="idst">Interests</div>
            <div className="tagrow">
              {["JORDAN", "AIR MAX", "YEEZY", "LOW-TOP", "RETRO", "DUNK"].map(t => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          </div>

          {/* Account section */}
          <div className="idcard">
            <div className="idst">Account</div>
            {loggedIn ? (
              <>
                <button className="btn-o" style={{ marginTop: 0 }} onClick={() => { setEditUsernameVal(authUser); setEditingUsername(true); window.scrollTo(0, 0); }}>CHANGE USERNAME</button>
                <button className="btn-r" style={{ background: "var(--border)" }} onClick={() => { setLoggedIn(false); showToast("Logged out"); }}>SIGN OUT</button>
              </>
            ) : (
              <button className="btn-r" onClick={() => setAuthModal(true)}>LOG IN / CREATE ACCOUNT</button>
            )}
          </div>

          <button className="btn-g" onClick={() => { setMemberStep("plans"); setMemberModal(true); }}>★ UPGRADE MEMBERSHIP</button>
        </div>
      </div>

      {/* ═══════════════════ TAB BAR ═══════════════════ */}
      <div className="tabbar">
        {tabItems.map(t => (
          <button key={t.key} className={`tabbtn ${activeScreen === t.key ? "active" : ""}`} onClick={() => { setActiveScreen(t.key); if (t.key === "scan" && scanned) resetScan(); }}>
            <div className="tabico" />
            {t.notif && <span className="tnotif">{t.notif}</span>}
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════ CHECKOUT MODAL ═══════════════════ */}
      {checkoutModal && checkoutShoe && (
        <div className="mo open">
          <div className="mb">
            <button className="mclose" onClick={() => setCheckoutModal(false)}>✕ CLOSE</button>
            <div className="mtitle">Checkout</div>

            <div className="cksteps">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`ckstep ${ckStep > i ? "done" : ckStep === i ? "act" : ""}`} />
              ))}
            </div>

            {/* Step 0: Size */}
            <div className={`cksec ${ckStep === 0 ? "act" : ""}`}>
              <div className="cktitle">01 — SELECT SIZE</div>
              <div className="szgrid">
                {SIZES.map(s => (
                  <button key={s} className={`szbtn ${ckSize === s ? "sel" : ""}`} onClick={() => setCkSize(s)}>{s}</button>
                ))}
              </div>
              <button className="btn-r" onClick={ckNext}>CONTINUE TO SHIPPING ›</button>
            </div>

            {/* Step 1: Shipping */}
            <div className={`cksec ${ckStep === 1 ? "act" : ""}`}>
              <div className="cktitle">02 — SHIPPING INFO</div>
              <div className="aform">
                <div className="fgrp"><label className="flbl">Full Name</label><input className="finp" value={ckName} onChange={e => setCkName(e.target.value)} /></div>
                <div className="fgrp"><label className="flbl">Email</label><input className="finp" type="email" value={ckEmail} onChange={e => setCkEmail(e.target.value)} /></div>
                <div className="fgrp"><label className="flbl">Street Address</label><input className="finp" value={ckAddr} onChange={e => setCkAddr(e.target.value)} /></div>
                <div className="ckinrow">
                  <div className="fgrp"><label className="flbl">City</label><input className="finp" value={ckCity} onChange={e => setCkCity(e.target.value)} /></div>
                  <div className="fgrp"><label className="flbl">ZIP</label><input className="finp" value={ckZip} onChange={e => setCkZip(e.target.value.slice(0, 5))} /></div>
                </div>
              </div>
              <button className="btn-r" onClick={ckNext}>CONTINUE TO PAYMENT ›</button>
              <button className="btn-o" onClick={() => setCkStep(0)}>‹ BACK</button>
            </div>

            {/* Step 2: Payment */}
            <div className={`cksec ${ckStep === 2 ? "act" : ""}`}>
              <div className="cktitle">03 — PAYMENT</div>
              <div className="aform">
                <div className="fgrp"><label className="flbl">Name on Card</label><input className="finp" value={ckCardName} onChange={e => setCkCardName(e.target.value)} /></div>
                <div className="fgrp"><label className="flbl">Card Number</label><input className="finp" value={ckCard} onChange={e => setCkCard(fmtCard(e.target.value))} maxLength={19} /></div>
                <div className="ckinrow">
                  <div className="fgrp"><label className="flbl">Expiry (MM/YY)</label><input className="finp" value={ckExp} onChange={e => setCkExp(fmtExp(e.target.value))} maxLength={5} /></div>
                  <div className="fgrp"><label className="flbl">CVV</label><input className="finp" value={ckCvv} onChange={e => setCkCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} /></div>
                </div>
                <p style={{ fontFamily: "var(--fm)", fontSize: 9, color: "var(--red)", textAlign: "center", marginTop: 4 }}>🔒 256-BIT ENCRYPTED · SECURE CHECKOUT</p>
              </div>
              <div className="osm">
                <div className="osr"><span>Subtotal</span><span>{"estimatedPrice" in checkoutShoe ? (checkoutShoe as ShoeResult).estimatedPrice : (checkoutShoe as MarketItem).prices[0]?.value}</span></div>
                <div className="osr"><span>Shipping</span><span>$9.99</span></div>
                <div className="osr tot"><span>TOTAL</span><span>—</span></div>
              </div>
              <button className="btn-r" onClick={ckNext}>PLACE ORDER 🛒</button>
              <button className="btn-o" onClick={() => setCkStep(1)}>‹ BACK</button>
            </div>

            {/* Step 3: Success */}
            <div className={`cksec ${ckStep === 3 ? "act" : ""}`}>
              <div className="succ">
                <div className="succ-ico">✅</div>
                <div className="succ-title">ORDER PLACED!</div>
                <div className="succ-sub">YOUR KICKS ARE ON THE WAY.</div>
                <p style={{ fontFamily: "var(--fm)", fontSize: 10, marginTop: 8 }}>Order #{orderNum}</p>
                <p style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--red)" }}>CHECK YOUR EMAIL FOR CONFIRMATION</p>
              </div>
              <button className="btn-r" onClick={() => setCheckoutModal(false)}>CLOSE</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ MEMBERSHIP MODAL ═══════════════════ */}
      {memberModal && (
        <div className="mo open">
          <div className="mb">
            <button className="mclose" onClick={() => setMemberModal(false)}>✕ CLOSE</button>
            <div className="mtitle">{memberStep === "plans" ? "Choose Your Plan" : memberStep === "payment" ? "Payment Details" : "Welcome!"}</div>

            {memberStep === "plans" && (
              <>
                <div className="mplans">
                  <div className={`mplan ${selectedPlan === "free" ? "sel2" : ""}`} onClick={() => setSelectedPlan("free")}>
                    <div className="pname">FREE</div>
                    <div className="pprice">$0<span className="pper">/month</span></div>
                    <div className="pfeats">
                      <div className="pfeat y">AI Shoe Scanning</div>
                      <div className="pfeat y">Save up to 10 pairs</div>
                      <div className="pfeat y">Market price viewing</div>
                      <div className="pfeat n">Drop Alerts</div>
                      <div className="pfeat n">Sell your shoes</div>
                      <div className="pfeat n">Early access drops</div>
                    </div>
                  </div>
                  <div className={`mplan feat ${selectedPlan === "sneakerhead" ? "sel2" : ""}`} onClick={() => setSelectedPlan("sneakerhead")}>
                    <div className="ppop">MOST POPULAR</div>
                    <div className="pname">SNEAKER HEAD</div>
                    <div className="pprice">$9.99<span className="pper">/month</span></div>
                    <div className="pfeats">
                      <div className="pfeat y">Everything in Free</div>
                      <div className="pfeat y">Unlimited vault storage</div>
                      <div className="pfeat y">🔔 Drop Alerts (all releases)</div>
                      <div className="pfeat y">Sell up to 10 pairs/month</div>
                      <div className="pfeat y">No seller fees</div>
                      <div className="pfeat n">Early access drops</div>
                      <div className="pfeat n">Priority checkout</div>
                    </div>
                  </div>
                  <div className={`mplan ${selectedPlan === "solepro" ? "sel2" : ""}`} onClick={() => setSelectedPlan("solepro")}>
                    <div className="pname">SOLE PRO ★</div>
                    <div className="pprice">$24.99<span className="pper">/month</span></div>
                    <div className="pfeats">
                      <div className="pfeat y">Everything in Sneaker Head</div>
                      <div className="pfeat y">⚡ Early access to drops</div>
                      <div className="pfeat y">Priority checkout (skip queue)</div>
                      <div className="pfeat y">Unlimited selling</div>
                      <div className="pfeat y">Seller analytics dashboard</div>
                      <div className="pfeat y">Pro badge on listings</div>
                    </div>
                  </div>
                </div>
                <button className="btn-r" onClick={() => {
                  if (selectedPlan === "free") {
                    setMemberPlan("FREE");
                    setMemberModal(false);
                    showToast("Plan updated!");
                  } else {
                    setMemberCardNum(""); setMemberCardExp(""); setMemberCardCvv(""); setMemberCardName("");
                    setMemberStep("payment");
                  }
                }}>
                  {selectedPlan === "free" ? "SELECT FREE PLAN" : "CONTINUE TO PAYMENT ›"}
                </button>
                <p style={{ fontFamily: "var(--fm)", fontSize: 9, textAlign: "center", marginTop: 8, color: "var(--red)" }}>CANCEL ANYTIME · SECURE BILLING</p>
              </>
            )}

            {memberStep === "payment" && (
              <>
                <div style={{ border: "3px solid var(--border)", padding: 12, marginBottom: 14, textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--ft)", fontSize: 18 }}>{selectedPlan === "sneakerhead" ? "SNEAKER HEAD" : "SOLE PRO ★"}</div>
                  <div style={{ fontFamily: "var(--ft)", fontSize: 28, color: "var(--red)", fontWeight: 700 }}>{selectedPlan === "sneakerhead" ? "$9.99" : "$24.99"}<span style={{ fontFamily: "var(--fm)", fontSize: 10 }}>/month</span></div>
                </div>
                <div className="aform">
                  <div className="fgrp"><label className="flbl">Name on Card</label><input className="finp" value={memberCardName} onChange={e => setMemberCardName(e.target.value)} placeholder="Jordan Smith" /></div>
                  <div className="fgrp"><label className="flbl">Card Number</label><input className="finp" value={memberCardNum} onChange={e => setMemberCardNum(fmtCard(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19} /></div>
                  <div className="ckinrow">
                    <div className="fgrp"><label className="flbl">Expiry (MM/YY)</label><input className="finp" value={memberCardExp} onChange={e => setMemberCardExp(fmtExp(e.target.value))} placeholder="MM/YY" maxLength={5} /></div>
                    <div className="fgrp"><label className="flbl">CVV</label><input className="finp" value={memberCardCvv} onChange={e => setMemberCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="•••" /></div>
                  </div>
                  <p style={{ fontFamily: "var(--fm)", fontSize: 9, color: "var(--red)", textAlign: "center", marginTop: 4 }}>🔒 256-BIT ENCRYPTED · SECURE BILLING</p>
                </div>
                <button className="btn-r" onClick={() => {
                  if (!memberCardName || memberCardNum.replace(/\s/g, "").length < 15 || !memberCardExp.includes("/") || memberCardCvv.length < 3) return;
                  setMemberPlan(selectedPlan === "sneakerhead" ? "SNEAKER HEAD" : "SOLE PRO");
                  setMemberStep("success");
                }}>SUBSCRIBE NOW 🔒</button>
                <button className="btn-o" onClick={() => setMemberStep("plans")}>‹ BACK TO PLANS</button>
              </>
            )}

            {memberStep === "success" && (
              <div style={{ textAlign: "center", padding: "18px 0" }}>
                <div style={{ fontSize: 46, marginBottom: 8 }}>🎉</div>
                <div style={{ fontFamily: "var(--ft)", fontSize: 28 }}>WELCOME TO {memberPlan}!</div>
                <div style={{ fontFamily: "var(--fm)", fontSize: 11, color: "var(--red)", fontWeight: 700, marginTop: 6 }}>YOUR MEMBERSHIP IS NOW ACTIVE</div>
                <p style={{ fontFamily: "var(--fm)", fontSize: 10, marginTop: 8, opacity: 0.7 }}>All premium features have been unlocked.</p>
                <button className="btn-r" style={{ marginTop: 14 }} onClick={() => setMemberModal(false)}>LET'S GO!</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════ AUTH MODAL ═══════════════════ */}
      {authModal && (
        <div className="mo open">
          <div className="mb">
            <button className="mclose" onClick={() => setAuthModal(false)}>✕ CLOSE</button>
            <div className="mtitle">Account</div>
            <div className="atabs">
              <button className={`atab ${authTab === "login" ? "act" : ""}`} onClick={() => setAuthTab("login")}>LOG IN</button>
              <button className={`atab ${authTab === "signup" ? "act" : ""}`} onClick={() => setAuthTab("signup")}>SIGN UP</button>
            </div>
            {authTab === "login" ? (
              <div className="aform">
                <div className="fgrp"><label className="flbl">Email</label><input className="finp" type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="you@email.com" /></div>
                <div className="fgrp"><label className="flbl">Password</label><input className="finp" type="password" value={authPass} onChange={e => setAuthPass(e.target.value)} /></div>
                <button className="btn-r" onClick={handleAuth}>LOG IN</button>
                <button className="btn-o">G&nbsp;&nbsp;CONTINUE WITH GOOGLE</button>
              </div>
            ) : (
              <div className="aform">
                <div className="fgrp"><label className="flbl">Username</label><input className="finp" value={authUser} onChange={e => setAuthUser(e.target.value)} placeholder="@sneakerhead99" /></div>
                <div className="fgrp"><label className="flbl">Email</label><input className="finp" type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="you@email.com" /></div>
                <div className="fgrp"><label className="flbl">Password</label><input className="finp" type="password" value={authPass} onChange={e => setAuthPass(e.target.value)} /></div>
                <button className="btn-r" onClick={handleAuth}>CREATE ACCOUNT</button>
                <button className="btn-o">G&nbsp;&nbsp;CONTINUE WITH GOOGLE</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════ ALERT MODAL ═══════════════════ */}
      {alertModal && (
        <div className="mo open">
          <div className="mb">
            <button className="mclose" onClick={() => setAlertModal(null)}>✕ CLOSE</button>
            <div className="mtitle">Set Drop Alert</div>
            <p style={{ fontFamily: "var(--fm)", fontSize: 11, marginBottom: 12 }}>{alertModal.name} — {alertModal.colorway}<br />{alertModal.date}</p>
            <button className="btn-r" onClick={() => {
              setDrops(prev => prev.map(d => d.id === alertModal.id ? { ...d, alert: true } : d));
              setAlertModal(null);
              showToast("Alert set!");
            }}>🔔 NOTIFY ME ON DROP DAY</button>
            <button className="btn-o" onClick={() => setAlertModal(null)}>NOT NOW</button>
          </div>
        </div>
      )}

      {/* ═══════════════════ MARKET DETAIL MODAL ═══════════════════ */}
      {marketDetail && (
        <div className="mo open">
          <div className="mb">
            <button className="mclose" onClick={() => setMarketDetail(null)}>✕ CLOSE</button>
            <div className="mtitle">{marketDetail.name}</div>
            <div className="mkcw">{marketDetail.colorway}</div>
            <div className="mkp" style={{ marginTop: 12 }}>
              {marketDetail.prices.map(p => (
                <div key={p.label} className="mpb">
                  <span className="mps">{p.label.toUpperCase()}</span>
                  <span className="mpn">{p.value}</span>
                </div>
              ))}
            </div>
            <button className="btn-r" onClick={() => { setMarketDetail(null); openCheckout(marketDetail); }}>🛒 BUY NOW — CHECKOUT</button>
            <button className="btn-o" onClick={() => {
              setVault(prev => [...prev, { name: marketDetail.name, brand: marketDetail.brand, colorway: marketDetail.colorway, silhouette: "", release: "", tech: "", confidence: 0, designer: "", inspiration: "", estimatedPrice: marketDetail.prices[0]?.value || "", savedAt: new Date().toLocaleDateString() }]);
              setMarketDetail(null);
              showToast("Saved to vault!");
            }}>+ SAVE TO VAULT</button>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </>
  );
};

export default Index;
