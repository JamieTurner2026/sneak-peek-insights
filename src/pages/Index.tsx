import { useState, useRef, useCallback, useEffect } from "react";

// ── Data ──
const TICKER_ITEMS = [
  { text: "JORDAN 4 MILITARY BLUE", val: "$387 ▲12%" },
  { text: "YEEZY 350 BONE", val: "$241 ▼3%" },
  { text: "DUNK LOW PANDA RESTOCK", val: "JUNE 15" },
  { text: "TRAVIS SCOTT x JORDAN 1 LOW", val: "$1,240 ▲8%" },
  { text: "NEW BALANCE 550 GREEN", val: "$119 ▼1%" },
  { text: "OFF-WHITE DUNK LOT 33", val: "$465 ▲5%" },
  { text: "NIKE SB DUNK WHAT THE", val: "$892 ▼2%" },
  { text: "ADIDAS SAMBA OG WHITE", val: "$104 ▲22%" },
];

const DROPS = [
  { name: "AIR JORDAN 1 RETRO HIGH OG 'CHICAGO'", brand: "JORDAN", date: "JUNE 12, 2025", retail: "$180", tag: "HOT", tagClass: "th", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600" },
  { name: "YEEZY BOOST 350 V2 'ONYX'", brand: "ADIDAS", date: "JUNE 18, 2025", retail: "$230", tag: "SOON", tagClass: "ts", img: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600" },
  { name: "DUNK LOW 'UNIVERSITY BLUE'", brand: "NIKE", date: "JULY 01, 2025", retail: "$110", tag: "LIMITED", tagClass: "tl2", img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600" },
];

const MARKET = [
  { brand: "NIKE", name: "Air Force 1 '07", cw: "WHITE/WHITE", trend: "+4.2%", up: true, prices: [{ label: "RETAIL", val: "$110" }, { label: "RESALE", val: "$142" }, { label: "LOW", val: "$125" }, { label: "HIGH", val: "$168" }] },
  { brand: "JORDAN", name: "Air Jordan 4 'Bred'", cw: "BLACK/CEMENT GREY/RED", trend: "-1.8%", up: false, prices: [{ label: "RETAIL", val: "$210" }, { label: "RESALE", val: "$387" }, { label: "LOW", val: "$340" }, { label: "HIGH", val: "$425" }] },
  { brand: "NEW BALANCE", name: "550 'White Green'", cw: "WHITE/GREEN", trend: "+12.1%", up: true, prices: [{ label: "RETAIL", val: "$110" }, { label: "RESALE", val: "$178" }, { label: "LOW", val: "$145" }, { label: "HIGH", val: "$210" }] },
];

const SIZES = ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13"];

const SHOE_DB = [
  { name: "Air Jordan 1 Retro High OG", silhouette: "Jordan 1 High", colorway: "Chicago / Red-White-Black", release: "1985 / 2015 Retro", tech: "Air Sole Unit", confidence: 94, retailers: [{ name: "StockX", badge: "bb", price: "$387", source: "STOCKX" }, { name: "GOAT", badge: "ba", price: "$395", source: "GOAT" }, { name: "Nike SNKRS", badge: "bn", price: "$180", source: "RETAIL" }, { name: "eBay Auth.", badge: "bs", price: "$360", source: "EBAY" }] },
  { name: "Nike Dunk Low Panda", silhouette: "Dunk Low", colorway: "White/Black", release: "2021", tech: "Foam Midsole", confidence: 91, retailers: [{ name: "StockX", badge: "bb", price: "$119", source: "STOCKX" }, { name: "GOAT", badge: "ba", price: "$125", source: "GOAT" }, { name: "Nike", badge: "bn", price: "$110", source: "RETAIL" }, { name: "Foot Locker", badge: "bd", price: "$110", source: "RETAIL" }] },
  { name: "Yeezy Boost 350 V2", silhouette: "Yeezy 350", colorway: "Bone / Off-White", release: "2022", tech: "Boost Midsole / Primeknit", confidence: 88, retailers: [{ name: "StockX", badge: "bb", price: "$241", source: "STOCKX" }, { name: "GOAT", badge: "ba", price: "$250", source: "GOAT" }, { name: "Adidas", badge: "bn", price: "$230", source: "RETAIL" }, { name: "Flight Club", badge: "bs", price: "$255", source: "RESALE" }] },
];

// ── Component ──
const Index = () => {
  const [tab, setTab] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [shoeIdx, setShoeIdx] = useState(0);
  const [drawerCollapsed, setDrawerCollapsed] = useState(true);
  const [vault, setVault] = useState<typeof SHOE_DB>([]);
  const [toast, setToast] = useState("");
  const [dropAlerts, setDropAlerts] = useState<Set<number>>(new Set());

  // Modals
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [alertModal, setAlertModal] = useState<number | null>(null);

  // Auth
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("GUEST");
  const [authTab, setAuthTab] = useState(0);

  // Checkout
  const [ckStep, setCkStep] = useState(0);
  const [selSize, setSelSize] = useState("");

  // Membership
  const [selPlan, setSelPlan] = useState(1);

  // Sell
  const [sellConditions] = useState(["DS/NEW", "VNDS", "USED", "BEATERS"]);
  const [selCondition, setSelCondition] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const shoe = SHOE_DB[shoeIdx];

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }, []);

  // Camera management
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setCapturedImage(null);
    } catch {
      showToast("CAMERA ACCESS DENIED");
    }
  }, [showToast]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  // Start/stop camera when scan tab is active
  useEffect(() => {
    if (tab === 0 && !scanned) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => { stopCamera(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, scanned]);

  const doScan = useCallback(() => {
    // Capture frame from video
    if (videoRef.current && canvasRef.current && cameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      setCapturedImage(canvas.toDataURL("image/jpeg"));
      stopCamera();
    }
    setScanning(true);
    setScanned(false);
    setDrawerCollapsed(true);
    const idx = Math.floor(Math.random() * SHOE_DB.length);
    setShoeIdx(idx);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
      setDrawerCollapsed(false);
    }, 2800);
  }, [cameraActive, stopCamera]);

  const resetScan = useCallback(() => {
    setScanned(false);
    setCapturedImage(null);
    setDrawerCollapsed(true);
  }, []);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCapturedImage(ev.target?.result as string);
        stopCamera();
      };
      reader.readAsDataURL(e.target.files[0]);
      doScan();
    }
  }, [doScan, stopCamera]);

  const saveToVault = useCallback(() => {
    if (vault.find(v => v.name === shoe.name)) {
      showToast("ALREADY IN VAULT");
      return;
    }
    setVault(prev => [...prev, shoe]);
    showToast("SAVED TO VAULT ✓");
  }, [vault, shoe, showToast]);

  const removeFromVault = useCallback((idx: number) => {
    setVault(prev => prev.filter((_, i) => i !== idx));
    showToast("REMOVED FROM VAULT");
  }, [showToast]);

  const toggleAlert = useCallback((idx: number) => {
    setDropAlerts(prev => {
      const n = new Set(prev);
      if (n.has(idx)) n.delete(idx); else n.add(idx);
      return n;
    });
    setAlertModal(null);
    showToast(dropAlerts.has(idx) ? "ALERT REMOVED" : "ALERT SET ✓");
  }, [dropAlerts, showToast]);

  const doLogin = useCallback((name?: string) => {
    setLoggedIn(true);
    setUsername(name || "SNEAKERHEAD99");
    setAuthOpen(false);
    showToast("LOGGED IN ✓");
  }, [showToast]);

  // Ticker duplicated for seamless loop
  const tickerContent = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <>
      {/* TICKER */}
      <div className="ticker-bar">
        <div className="ticker-inner">
          {tickerContent.map((t, i) => (
            <span className="tick-item" key={i}>{t.text} <b>{t.val}</b></span>
          ))}
        </div>
        <button className="bell-btn" onClick={() => showToast("🔔 ALERTS ON")}>🔔 ALERTS</button>
      </div>

      {/* ── SCAN SCREEN ── */}
      <div className={`screen ${tab === 0 ? "active" : ""}`} style={{ position: "relative" }}>
        <div className="jbg" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800)" }} />
        <div className={`cam-scanned ${scanned ? "vis" : ""}`} style={{ backgroundImage: "url(https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800)" }} />

        <div className="hf">
          <div className="hc tl" /><div className="hc tr" /><div className="hc bl" /><div className="hc br" />
          <div className={`sline ${scanning ? "run" : ""}`} />
          {scanned && (
            <>
              <div className="hlbl" style={{ top: "28%", left: "12%" }}>SWOOSH — 98%</div>
              <div className="hlbl" style={{ top: "55%", right: "10%" }}>MIDSOLE — 94%</div>
            </>
          )}
        </div>

        <div className="wmark">
          <div className="wm1">SNAPSHOTZ SOLES</div>
          <span className="wm2">AI SHOE RECOGNITION</span>
        </div>

        <div className="si">
          <div className="sh">
            <div className="sbdg"><div className={`sdot ${scanning ? "pulse" : ""}`} />{scanning ? "SCANNING..." : scanned ? "MATCH FOUND" : "MODE: STANDBY"}</div>
            <div className="obdg">{scanned ? `[${shoe.retailers.length}] RETAILERS` : "[0] OBJECTS"}</div>
          </div>

          <div>
            {!scanned && (
              <div className="capwrap">
                <button className="capbtn" onClick={doScan}>
                  <div className="capinn">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                </button>
                <label className="uplbl" onClick={() => fileRef.current?.click()}>⬆ UPLOAD IMAGE</label>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
              </div>
            )}

            {/* DRAWER */}
            <div className={`drw ${drawerCollapsed ? "coll" : ""}`}>
              <div className="hdl" onClick={() => setDrawerCollapsed(!drawerCollapsed)} />
              <div className="stitle">{scanned ? shoe.name : "AWAITING SCAN..."}</div>
              <div className="smeta">
                <span>{scanned ? `${shoe.confidence}% MATCH` : "—% MATCH"}</span>
                <span>ID: {scanned ? `SN-${Math.floor(Math.random() * 9000 + 1000)}` : "—"}</span>
              </div>
              <div className="cbar"><div className="cfill" style={{ width: scanned ? `${shoe.confidence}%` : "0%" }} /></div>

              {scanned && (
                <>
                  <div className="sgrid">
                    <div className="si2"><span className="sl">Silhouette</span><span className="sv">{shoe.silhouette}</span></div>
                    <div className="si2"><span className="sl">Colorway</span><span className="sv">{shoe.colorway}</span></div>
                    <div className="si2"><span className="sl">Release</span><span className="sv">{shoe.release}</span></div>
                    <div className="si2"><span className="sl">Tech</span><span className="sv">{shoe.tech}</span></div>
                  </div>

                  <button className="btn-o" style={{ marginTop: 0, marginBottom: 7 }} onClick={saveToVault}>+ SAVE TO VAULT</button>

                  <div className="sech">Where to Buy</div>
                  <div className="rgrid">
                    {shoe.retailers.map((r, i) => (
                      <div className="sc" key={i} onClick={() => { setCheckoutOpen(true); setCkStep(0); setSelSize(""); }}>
                        <div className="sct">
                          <span className="scn">{r.name}</span>
                          <span className={`scb ${r.badge}`}>{r.source}</span>
                        </div>
                        <div className="scs">LOWEST ASK</div>
                        <div className="scp">{r.price}</div>
                        <span className="sca">›</span>
                      </div>
                    ))}
                  </div>

                  <button className="btn-r" onClick={() => { setCheckoutOpen(true); setCkStep(0); setSelSize(""); }}>🛒 BUY NOW — CHECKOUT</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── DROPS SCREEN ── */}
      <div className={`screen ${tab === 1 ? "active" : ""}`} style={{ background: "var(--surface)" }}>
        <div className="phdr">
          <div className="phdr-logo">SNAPSHOTZ SOLES</div>
          <h1 className="phdr-title">Drop Calendar</h1>
          <div className="phdr-sub">UPCOMING RELEASES · SET ALERTS</div>
        </div>
        <div className="dlist">
          {DROPS.map((d, i) => (
            <div className="dcard" key={i}>
              <div className="dcimg" style={{ backgroundImage: `url(${d.img})` }}>
                <div className="dcimgi">
                  <div className="dcbr">{d.brand}</div>
                  <div className="dcn">{d.name}</div>
                </div>
              </div>
              <div className="dcbody">
                <div className="dmr">
                  <div className="ddate"><span className="ddlbl">DROP DATE</span>{d.date}</div>
                  <div className="dret">{d.retail}</div>
                  <span className={`dtag ${d.tagClass}`}>{d.tag}</span>
                </div>
                <button
                  className={`dnbtn ${dropAlerts.has(i) ? "dnset" : "dnon"}`}
                  onClick={() => dropAlerts.has(i) ? toggleAlert(i) : setAlertModal(i)}
                >
                  {dropAlerts.has(i) ? "✓ ALERT SET" : "🔔 SET DROP ALERT"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MARKET SCREEN ── */}
      <div className={`screen ${tab === 2 ? "active" : ""}`} style={{ background: "var(--surface)" }}>
        <div className="phdr">
          <div className="phdr-logo">SNAPSHOTZ SOLES</div>
          <h1 className="phdr-title">Market</h1>
          <div className="phdr-sub">LIVE RESALE PRICES · 8 RETAILERS</div>
        </div>
        <div className="mklist">
          {MARKET.map((m, i) => (
            <div className="mkcard" key={i}>
              <div className="mkhdr">
                <span className="mkbr">{m.brand}</span>
                <span className={`mktr ${m.up ? "up" : "dn"}`}>{m.trend}</span>
              </div>
              <div className="mkbody">
                <div className="mkname">{m.name}</div>
                <div className="mkcw">{m.cw}</div>
                <div className="mkp">
                  {m.prices.map((p, j) => (
                    <div className="mpb" key={j}>
                      <span className="mps">{p.label}</span>
                      <span className="mpn">{p.val}</span>
                    </div>
                  ))}
                </div>
                <div className="mkctas">
                  <button className="mkcta" onClick={() => { setCheckoutOpen(true); setCkStep(0); setSelSize(""); }}>BUY NOW</button>
                  <button className="mkcta sec">TRACK PRICE</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── VAULT SCREEN ── */}
      <div className={`screen ${tab === 3 ? "active" : ""}`} style={{ background: "var(--surface)" }}>
        <div className="phdr">
          <div className="phdr-logo">SNAPSHOTZ SOLES</div>
          <h1 className="phdr-title">My Vault</h1>
          <div className="phdr-sub">COLLECTION · {vault.length} PAIRS</div>
        </div>
        <div className="vlist">
          {vault.length === 0 ? (
            <div className="empty">
              <div style={{ fontSize: 40 }}>🔒</div>
              <p>YOUR VAULT IS EMPTY.<br />SCAN A SHOE TO ADD IT.</p>
            </div>
          ) : vault.map((v, i) => (
            <div className="vitem" key={i}>
              <div className="vthumb" />
              <div className="vinfo">
                <div className="vname">{v.name}</div>
                <div className="vsub">{v.colorway}</div>
              </div>
              <div className="vbdg">{v.retailers[0]?.price}</div>
              <button className="vdel" onClick={(e) => { e.stopPropagation(); removeFromVault(i); }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* ── SELL SCREEN ── */}
      <div className={`screen ${tab === 4 ? "active" : ""}`} style={{ background: "var(--surface)" }}>
        <div className="phdr">
          <div className="phdr-logo">SNAPSHOTZ SOLES</div>
          <h1 className="phdr-title">Sell</h1>
          <div className="phdr-sub">LIST YOUR SNEAKERS</div>
        </div>
        <div className="sbody">
          {!loggedIn ? (
            <div className="login-gate">
              <div style={{ fontSize: 40 }}>🏷️</div>
              <h2>SELL YOUR KICKS</h2>
              <p>Log in to list your sneakers on the marketplace</p>
              <button className="btn-r" onClick={() => setAuthOpen(true)}>LOG IN TO SELL</button>
            </div>
          ) : (
            <div className="lfm">
              <div className="fsect">LISTING DETAILS</div>
              <div className="fgrp"><label className="flbl">Shoe Name</label><input className="finp" placeholder="e.g. Air Jordan 1 Chicago" /></div>
              <div className="frow">
                <div className="fgrp"><label className="flbl">Size</label><input className="finp" placeholder="10" /></div>
                <div className="fgrp"><label className="flbl">Price ($)</label><input className="finp" placeholder="250" type="number" /></div>
              </div>
              <div className="fgrp">
                <label className="flbl">Condition</label>
                <div className="cgrid">
                  {sellConditions.map(c => (
                    <button key={c} className={`cbtn ${selCondition === c ? "sel" : ""}`} onClick={() => setSelCondition(c)}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="fgrp">
                <label className="flbl">Photos</label>
                <div className="izone"><div style={{ fontSize: 28 }}>📷</div><p>TAP TO ADD PHOTOS</p></div>
              </div>
              <button className="btn-r">LIST FOR SALE</button>
            </div>
          )}
        </div>
      </div>

      {/* ── PROFILE SCREEN ── */}
      <div className={`screen ${tab === 5 ? "active" : ""}`} style={{ background: "var(--surface)" }}>
        <div className="phdr">
          <div className="phdr-logo">SNAPSHOTZ SOLES</div>
          <h1 className="phdr-title">My Profile</h1>
          <div className="phdr-sub">{loggedIn ? `@${username}` : "NOT LOGGED IN"}</div>
        </div>
        <div className="idbody">
          <div className="idcard">
            <div className="idbig">SNAP{"\n"}SHOTZ</div>
            <div style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--red)", fontWeight: 700 }}>@{loggedIn ? username : "GUEST"}</div>
            {loggedIn && <div className="mbdg">★ MEMBER</div>}
          </div>

          <div className="idcard">
            <div className="idst">Stats</div>
            <div className="idr"><span className="idk">TOTAL SCANS</span><span className="idv">{scanned ? "1" : "0"}</span></div>
            <div className="idr"><span className="idk">VAULT SIZE</span><span className="idv">{vault.length} pairs</span></div>
            <div className="idr"><span className="idk">LISTINGS</span><span className="idv">0 active</span></div>
            <div className="idr"><span className="idk">TOP BRAND</span><span className="idv">{scanned ? "NIKE" : "—"}</span></div>
            <div className="idr"><span className="idk">PLAN</span><span className="idv">FREE</span></div>
          </div>

          <div className="idcard">
            <div className="idst">Interests</div>
            <div className="tagrow">
              {["JORDAN", "AIR MAX", "YEEZY", "LOW-TOP", "RETRO", "DUNK"].map(t => (
                <span className="tag" key={t}>{t}</span>
              ))}
            </div>
          </div>

          <button className="btn-g" onClick={() => setMemberOpen(true)}>★ UPGRADE MEMBERSHIP</button>
          {!loggedIn ? (
            <button className="btn-r" onClick={() => setAuthOpen(true)}>LOG IN / CREATE ACCOUNT</button>
          ) : (
            <button className="btn-o" onClick={() => { setLoggedIn(false); setUsername("GUEST"); showToast("LOGGED OUT"); }}>LOG OUT</button>
          )}
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <nav className="tabbar">
        {["Scan", "Drops", "Market", "Vault", "Sell", "Profile"].map((label, i) => (
          <button key={label} className={`tabbtn ${tab === i ? "active" : ""}`} onClick={() => setTab(i)}>
            <div className="tabico" />
            {label}
            {i === 1 && <span className="tnotif">5</span>}
          </button>
        ))}
      </nav>

      {/* ── CHECKOUT MODAL ── */}
      <div className={`mo ${checkoutOpen ? "open" : ""}`}>
        <div className="mb">
          <button className="mclose" onClick={() => setCheckoutOpen(false)}>✕ CLOSE</button>
          <div className="mtitle">Checkout</div>

          <div className="cksteps">
            {[0, 1, 2, 3].map(s => (
              <div key={s} className={`ckstep ${s < ckStep ? "done" : s === ckStep ? "act" : ""}`} />
            ))}
          </div>

          {/* Step 1: Size */}
          <div className={`cksec ${ckStep === 0 ? "act" : ""}`}>
            <div className="cktitle">01 — SELECT SIZE</div>
            <div className="szgrid">
              {SIZES.map(s => (
                <button key={s} className={`szbtn ${selSize === s ? "sel" : ""}`} onClick={() => setSelSize(s)}>{s}</button>
              ))}
            </div>
            <button className="btn-r" onClick={() => selSize && setCkStep(1)} style={{ opacity: selSize ? 1 : 0.4 }}>CONTINUE TO SHIPPING ›</button>
          </div>

          {/* Step 2: Shipping */}
          <div className={`cksec ${ckStep === 1 ? "act" : ""}`}>
            <div className="cktitle">02 — SHIPPING INFO</div>
            <div className="aform">
              <div className="fgrp"><label className="flbl">Full Name</label><input className="finp" placeholder="John Doe" /></div>
              <div className="fgrp"><label className="flbl">Email</label><input className="finp" placeholder="you@email.com" type="email" /></div>
              <div className="fgrp"><label className="flbl">Street Address</label><input className="finp" placeholder="123 Sneaker St" /></div>
              <div className="ckinrow">
                <div className="fgrp"><label className="flbl">City</label><input className="finp" placeholder="New York" /></div>
                <div className="fgrp"><label className="flbl">ZIP</label><input className="finp" placeholder="10001" /></div>
              </div>
            </div>
            <button className="btn-r" onClick={() => setCkStep(2)}>CONTINUE TO PAYMENT ›</button>
            <button className="btn-o" onClick={() => setCkStep(0)}>‹ BACK</button>
          </div>

          {/* Step 3: Payment */}
          <div className={`cksec ${ckStep === 2 ? "act" : ""}`}>
            <div className="cktitle">03 — PAYMENT</div>
            <div className="aform">
              <div className="fgrp"><label className="flbl">Name on Card</label><input className="finp" /></div>
              <div className="fgrp"><label className="flbl">Card Number</label><input className="finp" placeholder="4242 4242 4242 4242" /></div>
              <div className="ckinrow">
                <div className="fgrp"><label className="flbl">Expiry (MM/YY)</label><input className="finp" placeholder="12/27" /></div>
                <div className="fgrp"><label className="flbl">CVV</label><input className="finp" placeholder="***" /></div>
              </div>
              <div style={{ fontFamily: "var(--fm)", fontSize: 9, color: "var(--red)", textAlign: "center", padding: "5px 0" }}>🔒 256-BIT ENCRYPTED · SECURE CHECKOUT</div>
            </div>
            <div className="osm">
              <div className="osr"><span>SUBTOTAL</span><span>{shoe.retailers[0]?.price}</span></div>
              <div className="osr"><span>SHIPPING</span><span>$14.99</span></div>
              <div className="osr"><span>TAX</span><span>$31.20</span></div>
              <div className="osr tot"><span>TOTAL</span><span>$433.19</span></div>
            </div>
            <button className="btn-r" onClick={() => setCkStep(3)}>PLACE ORDER 🛒</button>
            <button className="btn-o" onClick={() => setCkStep(1)}>‹ BACK</button>
          </div>

          {/* Step 4: Success */}
          <div className={`cksec ${ckStep === 3 ? "act" : ""}`}>
            <div className="succ">
              <div className="succ-ico">✅</div>
              <div className="succ-title">ORDER PLACED!</div>
              <div className="succ-sub">YOUR KICKS ARE ON THE WAY.</div>
              <div className="succ-sub" style={{ marginTop: 4 }}>CHECK YOUR EMAIL FOR CONFIRMATION</div>
            </div>
            <button className="btn-r" onClick={() => setCheckoutOpen(false)}>CLOSE</button>
          </div>
        </div>
      </div>

      {/* ── MEMBERSHIP MODAL ── */}
      <div className={`mo ${memberOpen ? "open" : ""}`}>
        <div className="mb">
          <button className="mclose" onClick={() => setMemberOpen(false)}>✕ CLOSE</button>
          <div className="mtitle">Choose Your Plan</div>
          <div className="mplans">
            {[
              { name: "FREE", price: "$0", per: "/month", feats: [["y", "AI Shoe Scanning"], ["y", "Save up to 10 pairs"], ["y", "Market price viewing"], ["n", "Drop Alerts"], ["n", "Sell your shoes"], ["n", "Early access drops"]] },
              { name: "SNEAKER HEAD", price: "$9.99", per: "/month", popular: true, feats: [["y", "Everything in Free"], ["y", "Unlimited vault storage"], ["y", "🔔 Drop Alerts (all releases)"], ["y", "Sell up to 10 pairs/month"], ["n", "No seller fees"], ["n", "Early access drops"], ["n", "Priority checkout"]] },
              { name: "SOLE PRO ★", price: "$24.99", per: "/month", feats: [["y", "Everything in Sneaker Head"], ["y", "⚡ Early access to drops"], ["y", "Priority checkout (skip queue)"], ["y", "Unlimited selling"], ["y", "Seller analytics dashboard"], ["y", "Pro badge on listings"]] },
            ].map((plan, i) => (
              <div key={i} className={`mplan ${selPlan === i ? "sel2" : ""} ${plan.popular ? "feat" : ""}`} onClick={() => setSelPlan(i)}>
                {plan.popular && <div className="ppop">MOST POPULAR</div>}
                <div className="pname">{plan.name}</div>
                <div className="pprice">{plan.price}</div>
                <div className="pper">{plan.per}</div>
                <div className="pfeats">
                  {plan.feats.map(([type, text], j) => (
                    <div key={j} className={`pfeat ${type}`}>{text}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button className="btn-g" onClick={() => { setMemberOpen(false); showToast("PLAN SELECTED ✓"); }}>SELECT PLAN ›</button>
          <div style={{ fontFamily: "var(--fm)", fontSize: 9, color: "var(--red)", textAlign: "center", marginTop: 9, fontWeight: 700 }}>CANCEL ANYTIME · SECURE BILLING</div>
        </div>
      </div>

      {/* ── AUTH MODAL ── */}
      <div className={`mo ${authOpen ? "open" : ""}`}>
        <div className="mb">
          <button className="mclose" onClick={() => setAuthOpen(false)}>✕ CLOSE</button>
          <div className="mtitle">Account</div>
          <div className="atabs">
            <button className={`atab ${authTab === 0 ? "act" : ""}`} onClick={() => setAuthTab(0)}>LOG IN</button>
            <button className={`atab ${authTab === 1 ? "act" : ""}`} onClick={() => setAuthTab(1)}>SIGN UP</button>
          </div>
          {authTab === 0 ? (
            <div className="aform">
              <div className="fgrp"><label className="flbl">Email</label><input className="finp" placeholder="you@email.com" type="email" /></div>
              <div className="fgrp"><label className="flbl">Password</label><input className="finp" type="password" /></div>
              <button className="btn-r" onClick={() => doLogin()}>LOG IN</button>
              <button className="btn-o">G  CONTINUE WITH GOOGLE</button>
            </div>
          ) : (
            <div className="aform">
              <div className="fgrp"><label className="flbl">Username</label><input className="finp" placeholder="@sneakerhead99" /></div>
              <div className="fgrp"><label className="flbl">Email</label><input className="finp" placeholder="you@email.com" type="email" /></div>
              <div className="fgrp"><label className="flbl">Password</label><input className="finp" type="password" /></div>
              <button className="btn-r" onClick={() => doLogin("SNEAKERHEAD99")}>CREATE ACCOUNT</button>
              <button className="btn-o">G  CONTINUE WITH GOOGLE</button>
            </div>
          )}
        </div>
      </div>

      {/* ── ALERT MODAL ── */}
      <div className={`mo ${alertModal !== null ? "open" : ""}`}>
        <div className="mb">
          <button className="mclose" onClick={() => setAlertModal(null)}>✕ CLOSE</button>
          <div className="mtitle">Set Drop Alert</div>
          {alertModal !== null && <div style={{ fontFamily: "var(--ft)", fontSize: 18, marginBottom: 11 }}>{DROPS[alertModal]?.name}</div>}
          <button className="btn-g" onClick={() => alertModal !== null && toggleAlert(alertModal)}>🔔 NOTIFY ME ON DROP DAY</button>
          <button className="btn-o" onClick={() => setAlertModal(null)}>NOT NOW</button>
        </div>
      </div>

      {/* TOAST */}
      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </>
  );
};

export default Index;
