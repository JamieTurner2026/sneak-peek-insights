import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  // Vault
  const [vault, setVault] = useState<VaultItem[]>([]);

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

  // Auth modal
  const [authModal, setAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authUser, setAuthUser] = useState("");

  // Membership modal
  const [memberModal, setMemberModal] = useState(false);
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
    setLoggedIn(true);
    setAuthModal(false);
    showToast(authTab === "login" ? "Logged in!" : "Account created!");
  };

  // ─── RENDER HELPERS ────────────────────────────────────────────────────────
  const tickerContent = TICKER_ITEMS.map(t => `${t.text} <b>${t.price}</b>`).join(" · ");
  const tickerHtml = tickerContent + " · " + tickerContent;

  const tabItems = [
    { key: "scan", label: "Scan", notif: null },
    { key: "drops", label: "Drops", notif: drops.filter(d => d.hype === "HIGH").length || null },
    { key: "market", label: "Market", notif: null },
    { key: "vault", label: "Vault", notif: vault.length || null },
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
          <div className="phdr-sub">COLLECTION · {vault.length} PAIRS</div>
        </div>
        {vault.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: 42 }}>👟</div>
            <h3 style={{ fontFamily: "var(--ft)", fontSize: 22 }}>YOUR VAULT IS EMPTY.</h3>
            <p>SCAN A SHOE TO ADD IT.</p>
          </div>
        ) : (
          <div className="vlist">
            {vault.map((v, i) => (
              <div key={i} className="vitem" onClick={() => {/* could open detail */}}>
                <div className="vthumb">
                  {v.photo && <img src={v.photo} alt={v.name} />}
                </div>
                <div className="vinfo">
                  <div className="vname">{v.name}</div>
                  <div className="vsub">{v.brand} · {v.colorway}</div>
                </div>
                <div className="vbdg">{v.estimatedPrice || "—"}</div>
                <button className="vdel" onClick={e => { e.stopPropagation(); removeFromVault(i); }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

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
          <div className="idbig">SNAP{"\n"}SHOTZ{"\n"}{loggedIn ? `@${authUser || "USER"}` : "@GUEST"}</div>
          {loggedIn && <div className="mbdg">★ MEMBER</div>}

          <div className="idcard">
            <div className="idst">Stats</div>
            <div className="idr"><span className="idk">TOTAL SCANS</span><span className="idv">{totalScans}</span></div>
            <div className="idr"><span className="idk">VAULT SIZE</span><span className="idv">{vault.length} pairs</span></div>
            <div className="idr"><span className="idk">LISTINGS</span><span className="idv">{listings.length} active</span></div>
            <div className="idr"><span className="idk">PLAN</span><span className="idv">{memberPlan}</span></div>
          </div>

          <div className="idcard">
            <div className="idst">Interests</div>
            <div className="tagrow">
              {["JORDAN", "AIR MAX", "YEEZY", "LOW-TOP", "RETRO", "DUNK"].map(t => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          </div>

          <button className="btn-g" onClick={() => setMemberModal(true)}>★ UPGRADE MEMBERSHIP</button>
          {!loggedIn ? (
            <button className="btn-o" onClick={() => setAuthModal(true)}>LOG IN / CREATE ACCOUNT</button>
          ) : (
            <button className="btn-o" onClick={() => { setLoggedIn(false); showToast("Logged out"); }}>LOG OUT</button>
          )}
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
            <div className="mtitle">Choose Your Plan</div>
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
              setMemberPlan(selectedPlan === "free" ? "FREE" : selectedPlan === "sneakerhead" ? "SNEAKER HEAD" : "SOLE PRO");
              setMemberModal(false);
              showToast("Plan updated!");
            }}>SELECT PLAN ›</button>
            <p style={{ fontFamily: "var(--fm)", fontSize: 9, textAlign: "center", marginTop: 8, color: "var(--red)" }}>CANCEL ANYTIME · SECURE BILLING</p>
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
