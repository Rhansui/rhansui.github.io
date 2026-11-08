// =====================================================================
//  DA VINCI'NİN FABRİKASI  v1.2
//  Saf Kalem Eskizi Mekaniği (Dönüşmeden Çizim Olarak Çalışır)
//  + Sadece Çizimli Ok (⇄) ile Yön Değiştirme + Sıfır Yazı Kalabalığı
// =====================================================================
(() => {
"use strict";

const W = 1600, H = 900;
const FLOOR_Y = 612;                    // Delikli panonun alt ahşap çerçeve zemini
const TRAY_Y = 724;                     // Alttaki nizami alet dizilimi satırı
// Sol alttaki boşlukta yazısız el çizimi Müzik (♪), Sıfırla (↺) ve Çalıştır (▶) simgeleri
// Sol alttaki pano hizasında (X: 300..510) nizami dizilmiş Müzik (♪), İpucu (i), Sıfırla (↺) ve Çalıştır (▶) simgeleri
const MUSIC_BTN = { x: 300, y: 712, r: 28 };
const INFO_BTN  = { x: 368, y: 712, r: 28 };
const RESET_BTN = { x: 436, y: 712, r: 28 };
const RUN_BTN   = { x: 510, y: 712, r: 34 };
// Hemen altlarında tam ortalanmış geçici Bölüm İleri/Geri (◀ ▶) el çizimi okları:
const PREV_BTN  = { x: 372, y: 782, r: 21 };
const NEXT_BTN  = { x: 436, y: 782, r: 21 };
const REMOTE_LEVELS_URL = "";

// Delikli Pano (Pegboard) üzerindeki gerçek delik koordinatları (23 sütun x 13 satır - üstten 3 satır genişletildi!)
const PEG_X = [321, 359, 397, 434, 471, 507, 543, 580, 617, 653, 690, 726, 763, 800, 836, 873, 909, 945, 982, 1018, 1054, 1091, 1127];
const PEG_Y = [181, 215, 248, 282, 315, 349, 383, 416, 450, 484, 519, 554, 586];

const cv = document.getElementById("c");
const ctx = cv.getContext("2d");
const $ = id => document.getElementById(id);

// ------------------------------------------------------------ RESİMLER
const ASSETS = {
  bg: "assets/bg_parchment_table",
  sk_gear: "assets/cut/sketch_gear",
  sk_lever: "assets/cut/sketch_lever",
  sk_lever_base: "assets/cut/sketch_lever_base",
  sk_lever_beam: "assets/cut/sketch_lever_beam",
  sk_ramp: "assets/cut/sketch_ramp",
  sk_waterwheel: "assets/cut/sketch_waterwheel",
  sk_pulley: "assets/cut/sketch_pulley",
  sk_anvil: "assets/cut/sketch_anvil",
  sk_stone: "assets/cut/sketch_stone",
  sk_basket: "assets/cut/sketch_basket",
  sk_sled: "assets/cut/sketch_sled",
  sk_well: "assets/cut/sketch_well",
  sk_archimedes: "assets/cut/sketch_archimedes",
  sk_heron: "assets/cut/sketch_heron",
  sk_aeolipile: "assets/cut/sketch_aeolipile",
  sk_aeolipile_base: "assets/cut/sketch_aeolipile_base",
  sk_aeolipile_sphere: "assets/cut/sketch_aeolipile_sphere",
  sk_temple_pillars: "assets/cut/sketch_temple_pillars",
  sk_temple_gate: "assets/cut/sketch_temple_gate",
  sk_ship: "assets/cut/sketch_ship",
  pen: "assets/cut/golden_pen"
};
const IMG = {};
function loadOne(key, base) {
  return new Promise(res => {
    const exts = base.includes("/cut/") ? [".png"] : [".jpg", ".png"];
    let i = 0;
    const tryNext = () => {
      if (i >= exts.length) { res(); return; }
      const im = new Image();
      im.onload = () => { IMG[key] = im; res(); };
      im.onerror = () => { i++; tryNext(); };
      im.src = base + exts[i] + "?v=28";
    };
    tryNext();
  });
}

const PARTS = {
  lever:      { name: "Kaldıraç",     sk: "sk_lever",      defSize: 290, canFlip: true },
  ramp:       { name: "Eğik Rampa",   sk: "sk_ramp",       defSize: 235, canFlip: true },
  pulley:     { name: "Makara",       sk: "sk_pulley",     defSize: 110 },
  rope_coil:  { name: "Halat Kangalı", proc: "rope",       defSize: 105 },
  waterwheel: { name: "Su Çarkı",     sk: "sk_waterwheel", defSize: 225, round: true },
  aeolipile:  { name: "Buhar Küresi", sk: "sk_aeolipile",  defSize: 215, round: true },
  gear_s:     { name: "Küçük Dişli",  sk: "sk_gear",       defSize: 125, round: true, scale: 0.55 },
  gear_l:     { name: "Büyük Dişli",  sk: "sk_gear",       defSize: 220, round: true },
  piston:     { name: "Krank Piston", proc: true,          defSize: 190, canFlip: true }
};

const INK = "#3f230e";

// ------------------------------------------------------------ SES (WebAudio)
let AC = null;
function ac() { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); return AC; }
function noise(dur, freq, q, vol, type = "bandpass") {
  const a = ac(), n = a.sampleRate * dur, b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1);
  const s = a.createBufferSource(); s.buffer = b;
  const f = a.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = a.createGain(); g.gain.setValueAtTime(vol, a.currentTime); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
  s.connect(f).connect(g).connect(a.destination); s.start();
}
function tone(freq, dur, vol = 0.15, type = "sine", delay = 0) {
  const a = ac(), o = a.createOscillator(), g = a.createGain(), t = a.currentTime + delay;
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.05);
}
const SFX = {
  scratch() { noise(0.07 + Math.random() * 0.05, 2500 + Math.random() * 2500, 1.2, 0.09); },
  thud() { tone(90, 0.25, 0.4, "sine"); noise(0.12, 300, 1, 0.2, "lowpass"); },
  whoosh() { noise(0.45, 900, 0.7, 0.12); },
  slide() { noise(0.8, 500, 0.8, 0.08); },
  tick() { for (let i = 0; i < 4; i++) setTimeout(() => noise(0.03, 3500, 4, 0.18), i * 90); },
  crank() { for (let i = 0; i < 12; i++) setTimeout(() => noise(0.03, 2200, 5, 0.12), i * 160); },
  water() { noise(1.4, 700, 0.4, 0.1); },
  steam() { for (let i = 0; i < 10; i++) setTimeout(() => noise(0.14, 1800 + (i % 3) * 400, 0.9, 0.08, "bandpass"), i * 130); },
  place() { tone(540, 0.12, 0.12, "triangle"); },
  flip() { tone(660, 0.09, 0.1, "sine"); },
  win() { [0, 4, 7, 12, 7, 12, 16].forEach((s, i) => tone(523 * Math.pow(2, s / 12), 0.35, 0.12, "triangle", i * 0.12)); },
  fail() { tone(220, 0.3, 0.15, "sawtooth"); tone(160, 0.45, 0.15, "sawtooth", 0.2); }
};

// ------------------------------------------------------------ TELİFSİZ TARİHSEL DÖNEM MÜZİĞİ MOTORU (BGM - WebAudio Akustik Sentez)
const BGM = {
  muted: false,
  timer: null,
  step: 0,
  // Dönemlere göre otantik makam/mod dizileri (Hz) ve arpej yürüyüşleri
  themes: {
    // 1) Arşimet (M.Ö. 287-212): Antik Yunan Liri (Seikilos / Dorian Modu - Sıcak Akustik Lir)
    sk_archimedes: {
      tempo: 680,
      drone: 146.83, // D3
      notes: [293.66, 329.63, 349.23, 392.00, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63, 293.66, 349.23, 440.00, 523.25, 440.00, 392.00]
    },
    // 2) İskenderiyeli Heron (M.S. 10-70): İskenderiye Tapınak Arpı & Kithara (Antik Hicaz / Phrygian Dominant)
    sk_heron: {
      tempo: 640,
      drone: 146.83, // D3
      notes: [293.66, 311.13, 369.99, 392.00, 440.00, 466.16, 440.00, 392.00, 369.99, 311.13, 293.66, 369.99, 440.00, 523.25, 466.16, 440.00]
    },
    // 3) Türk-İslam Bilginleri (Banu Musa, İbnü'l-Heysem, El-Cezeri, Ali Kuşçu, Mimar Sinan, Takiyüddin, Hezarfen): Klasik Ud & Kanun & Ney
    islamic_golden: {
      tempo: 620,
      drone: 146.83,
      notes: [293.66, 329.63, 369.99, 392.00, 440.00, 493.88, 523.25, 440.00, 392.00, 369.99, 329.63, 293.66, 329.63, 392.00, 369.99, 293.66]
    },
    // 4) Rönesans & Aydınlanma (Da Vinci, Galileo, Newton): Rönesans Lavtası (Lute)
    renaissance: {
      tempo: 600,
      drone: 164.81, // E3
      notes: [329.63, 392.00, 440.00, 493.88, 523.25, 493.88, 440.00, 392.00, 349.23, 329.63, 293.66, 329.63, 392.00, 440.00, 392.00, 329.63]
    }
  },
  pluck(freq, dur, vol, isDrone = false) {
    if (this.muted || !AC) return;
    const a = AC, now = a.currentTime;
    const o1 = a.createOscillator(), o2 = a.createOscillator();
    const flt = a.createBiquadFilter(), g = a.createGain();
    o1.type = isDrone ? "sine" : "triangle";
    o2.type = "sine";
    o1.frequency.setValueAtTime(freq, now);
    o2.frequency.setValueAtTime(freq * (isDrone ? 1.5 : 2.0), now); // Akustik tel harmonik tınısı
    flt.type = "lowpass";
    flt.frequency.setValueAtTime(isDrone ? 420 : 1150, now);
    flt.frequency.exponentialRampToValueAtTime(260, now + dur);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(vol, now + (isDrone ? 0.18 : 0.025));
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    const g2 = a.createGain();
    g2.gain.value = 0.22;
    o1.connect(flt);
    o2.connect(g2).connect(flt);
    flt.connect(g).connect(a.destination);
    o1.start(now); o2.start(now);
    o1.stop(now + dur + 0.05); o2.stop(now + dur + 0.05);
  },
  tick() {
    if (this.muted || !AC || !S || !S.L) return;
    const key = S.L.masterKey || "sk_archimedes";
    const th = this.themes[key] || this.themes.sk_archimedes;
    const isBossModal = $("modal").classList.contains("on") && S.L.isBoss;
    const baseVol = isBossModal ? 0.052 : 0.026; // Arka fonda inceden, tatlı akustik seviye
    const n = th.notes[this.step % th.notes.length];
    this.pluck(n, 1.35, baseVol, false);
    // Yumuşak akustik yankı (echo)
    setTimeout(() => this.pluck(n, 1.1, baseVol * 0.38, false), 240);
    // Her 4 vuruşta bir derinden gelen hafif antik dem/bas teli
    if (this.step % 4 === 0) {
      this.pluck(th.drone, 2.6, baseVol * 0.65, true);
    }
    this.step++;
  },
  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), 660);
  },
  toggle() {
    this.muted = !this.muted;
    SFX.flip();
    if (!this.muted) {
      this.start();
      this.tick();
    }
  }
};

// ------------------------------------------------------------ YARDIMCILAR
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const EASE = {
  lin: t => t, in: t => t * t, out: t => 1 - (1 - t) * (1 - t),
  io: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
};
const rnd = (a, b) => a + Math.random() * (b - a);

function nearestPeg(x, y) {
  let bestX = PEG_X[0], bestC = 0, dxMin = 9999;
  PEG_X.forEach((px, i) => { const d = Math.abs(x - px); if (d < dxMin) { dxMin = d; bestX = px; bestC = i + 1; } });
  let bestY = PEG_Y[0], bestR = 0, dyMin = 9999;
  PEG_Y.forEach((py, i) => { const d = Math.abs(y - py); if (d < dyMin) { dyMin = d; bestY = py; bestR = i + 1; } });
  const onBoard = x >= 275 && x <= 1175 && y >= 150 && y <= 618;
  return { x: bestX, y: bestY, col: bestC, row: bestR, onBoard };
}

// ------------------------------------------------------------ OYUN DURUMU
let LEVELS = window.LEVELS;
let S = null;
let levelIndex = 0;
let particles = [];
let pointer = { x: 0, y: 0, down: false };
let drag = null;
let hintTimer = 0;
let hintToolTimer = 0;
let hintToolType = null;
let lastT = performance.now();
let globalT = 0;
let nextUid = 1;

function saveProgress() { try { localStorage.setItem("dvf_level", String(levelIndex)); } catch (e) {} }
function loadProgress() { try { return parseInt(localStorage.getItem("dvf_level") || "0", 10) || 0; } catch (e) { return 0; } }

function startLevel(i) {
  levelIndex = clamp(i, 0, LEVELS.length - 1);
  saveProgress();
  const L = LEVELS[levelIndex];
  S = {
    L,
    mode: "build",            // build | run | win | fail
    padPiece: null,
    boardPieces: [],
    ropeMode: false,          // Halat Kangalına tıklanınca aktif olur: siyah delikten siyah deliğe ip çekme!
    ropeStart: null,          // İp çekmeye başlanan ilk nokta
    ropeLinks: [],            // Oyuncunun çektiği halat bağları: [{ a: nodeA, b: nodeB }]
    tray: L.tray.map((type, k) => ({ type, used: false, k })),
    actors: {},
    stepI: 0, stepT: 0,
    waterOn: false, conveyorOn: false
  };
  hintTimer = 0;
  hintToolTimer = 0;
  hintToolType = null;
  resetActors();
  $("title").textContent = `Bölüm ${L.id} · ${L.title}`;
  closeModal();
}

function resetActors() {
  S.actors = {};
  for (const [k, a] of Object.entries(S.L.actors)) S.actors[k] = { ...a, ang: a.ang || 0, hidden: !!a.hidden, fall: null, unhookedPos: null };
}

function backToBuild() {
  for (const p of S.boardPieces) {
    p.rot = 0; p.spinV = 0; p.ang = 0; p.push = 0; p.pushOn = false;
    if (p.origX !== undefined) { p.x = p.origX; p.y = p.origY; delete p.origX; delete p.origY; }
    delete p.matchedSlotId;
  }
  S.mode = "build"; S.stepI = 0; S.stepT = 0; S.waterOn = false; S.conveyorOn = false;
  resetActors();
}

// ------------------------------------------------------------ ALTTAKİ NİZAMİ YAZISIZ KARE ALET DİZİLİMİ (ALTLI ÜSTLÜ 2 SIRA DESTEKLİ)
function trayRects() {
  const n = S.tray.length;
  // 5 veya daha az alet varsa tek sırada büyük kare (100x100), 6+ alet olduğunda otomatik altlı üstlü 2 sıra (84x84)!
  const rows = n > 5 ? 2 : 1;
  const cols = Math.ceil(n / rows);
  const cs = rows === 2 ? 84 : 100;
  const gapX = 16, gapY = 12;
  const totalW = cols * cs + (cols - 1) * gapX;
  const totalH = rows * cs + (rows - 1) * gapY;
  // ▶ (510) simgesinin sağındaki geniş parşömen alanında (X: 575..1180) panoyla tam hizalı 2'li sıra!
  const centerX = 875;
  const centerY = rows === 2 ? 734 : 724;
  const x0 = Math.max(572, centerX - totalW / 2);
  const y0 = centerY - totalH / 2;
  return S.tray.map((c, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      c,
      x: x0 + col * (cs + gapX),
      y: y0 + row * (cs + gapY),
      w: cs,
      h: cs
    };
  });
}

function fitBox(im, size) {
  if (!im) return { w: size, h: size };
  const k = Math.min(size / im.width, size / im.height);
  return { w: im.width * k, h: im.height * k };
}
function partBox(type, size) {
  const def = PARTS[type];
  const sz = size || def.defSize || 240;
  if (def.proc === "rope") return { w: sz * 0.78, h: sz * 0.78 };
  if (def.proc) return { w: sz * 0.95, h: sz * 0.42 };
  return fitBox(IMG[def.sk], sz);
}

function getSizeForType(type) {
  const sl = S.L.slots.find(s => s.accepts === type);
  return sl ? sl.size : (PARTS[type].defSize || 240);
}

function spawnOnDrawingPad(card) {
  if (S.padPiece) {
    const oldCard = S.tray.find(t => t.k === S.padPiece.trayK);
    if (oldCard) oldCard.used = false;
  }
  card.used = true;
  S.padPiece = {
    uid: nextUid++,
    type: card.type,
    trayK: card.k,
    size: getSizeForType(card.type),
    drawT: 0,
    flip: false
  };
  SFX.place();
}

function mountOnPegboard(pieceData, x, y, needsSketch = false) {
  const peg = nearestPeg(x, y);
  const mounted = {
    uid: pieceData.uid || nextUid++,
    type: pieceData.type,
    trayK: pieceData.trayK,
    x: peg.x,
    y: peg.y,
    col: peg.col,
    row: peg.row,
    size: getSizeForType(pieceData.type),
    flip: !!pieceData.flip,
    drawT: needsSketch ? 0 : 1,
    rot: 0, spinV: 0, ang: 0, push: 0
  };
  S.boardPieces.push(mounted);
  SFX.place();
}

// Parçanın üstündeki çizimli yön değiştirme okunun (⇄) koordinatı
function flipIconPos(p) {
  const b = partBox(p.type, p.size);
  return { x: p.x, y: p.y - b.h / 2 - 22, r: 19 };
}

function boardFlipIconAt(x, y) {
  for (let i = S.boardPieces.length - 1; i >= 0; i--) {
    const p = S.boardPieces[i];
    if (!PARTS[p.type].canFlip) continue;
    const fp = flipIconPos(p);
    if (Math.hypot(x - fp.x, y - fp.y) <= fp.r + 6) return p;
  }
  return null;
}

function boardPieceAt(x, y) {
  for (let i = S.boardPieces.length - 1; i >= 0; i--) {
    const p = S.boardPieces[i];
    const b = partBox(p.type, p.size);
    if (Math.abs(x - p.x) < b.w / 2 + 16 && Math.abs(y - p.y) < b.h / 2 + 16) return p;
  }
  return null;
}

// İp (Halat) bağlanabilecek tüm noktalar:
// 1) Panoya yerleştirilmiş aletlerin merkezleri ve kaldıraç uçları (boş deliğe ip bağlanmaz, alet sökülürse ip de çözülür!)
// 2) Gemi, Tapınak Kapısı ve Halatlı Kaya/Örs
function getRopeNodes() {
  const nodes = [];
  for (const p of S.boardPieces) {
    nodes.push({ id: `piece_${p.uid}`, kind: p.type, piece: p, x: p.x, y: p.y });
    if (p.type === "lever") {
      const armL = -p.size * 0.42, armR = p.size * 0.42, rot = p.rot || 0;
      const lx = Math.round(p.x + Math.cos(rot) * armL), ly = Math.round(p.y + Math.sin(rot) * armL - 8);
      const rx = Math.round(p.x + Math.cos(rot) * armR), ry = Math.round(p.y + Math.sin(rot) * armR - 8);
      nodes.push({ id: `lever_L_${p.uid}`, kind: "lever", piece: p, arm: -1, x: lx, y: ly });
      nodes.push({ id: `lever_R_${p.uid}`, kind: "lever", piece: p, arm: 1,  x: rx, y: ry });
    }
  }
  for (const [k, a] of Object.entries(S.actors)) {
    if (a.hidden) continue;
    if (a.kind === "ship") {
      // Geminin tam üst demir halkası (a.x + 42, a.y - 48) geniş yakalama alanıyla eklensin!
      nodes.push({ id: `actor_${k}`, kind: "ship", actorKey: k, x: a.x + 42, y: a.y - 48, hitR: 135 });
    } else if (a.kind === "gate") {
      // Tapınak kapısının üst demir halkası
      nodes.push({ id: `actor_${k}`, kind: "gate", actorKey: k, x: a.x + 6, y: a.y - (a.s || 225) * 0.34, hitR: 135 });
    } else if (S.L.rope && (S.L.rope.actor === k || (S.L.rope.actors && S.L.rope.actors.includes(k)))) {
      const offY = a.kind === "anvil" ? 30 : (a.s ? a.s * 0.38 : 24);
      nodes.push({ id: `actor_${k}`, kind: a.kind, actorKey: k, x: a.x, y: a.y - offY, hitR: 95 });
    }
  }
  return nodes;
}

function ropeNodeAt(x, y) {
  let best = null, minDist = 9999;
  for (const n of getRopeNodes()) {
    const maxR = n.hitR || 95;
    const d = Math.hypot(x - n.x, y - n.y);
    if (d <= maxR && d < minDist) {
      minDist = d;
      best = n;
    }
  }
  return best;
}

// ------------------------------------------------------------ GİRDİ
function toLocal(e) {
  const r = cv.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
}

cv.addEventListener("pointerdown", e => {
  ac();
  BGM.start();
  const p = toLocal(e); pointer = { ...p, down: true, sx: p.x, sy: p.y };

  // Sol alttaki yazısız çizim Müzik (♪) aç/kapat simgesi
  if (Math.hypot(p.x - MUSIC_BTN.x, p.y - MUSIC_BTN.y) <= MUSIC_BTN.r + 6) {
    BGM.toggle();
    return;
  }

  // Sol alttaki yazısız çizim İpucu / Bilgi (i) simgesi — Açık açık yeri söylemeden sıradaki doğru aracı işaret eder!
  if (Math.hypot(p.x - INFO_BTN.x, p.y - INFO_BTN.y) <= INFO_BTN.r + 6) {
    SFX.flip();
    showSmartInfoHint();
    return;
  }

  // Sol alttaki yazısız çizim Sıfırla (↺) simgesi her modda çalışır
  if (Math.hypot(p.x - RESET_BTN.x, p.y - RESET_BTN.y) <= RESET_BTN.r + 6) {
    SFX.flip();
    startLevel(levelIndex);
    return;
  }

  // Sol alttaki yazısız çizim Çalıştır (▶) üçgeni
  if (S.mode === "build" && Math.hypot(p.x - RUN_BTN.x, p.y - RUN_BTN.y) <= RUN_BTN.r + 6) {
    triggerRun();
    return;
  }

  // Play tuşunun altındaki geçici Bölüm Geri (◀) ve Bölüm İleri (▶) okları
  if (Math.hypot(p.x - PREV_BTN.x, p.y - PREV_BTN.y) <= PREV_BTN.r + 6) {
    SFX.flip();
    startLevel(Math.max(0, levelIndex - 1));
    return;
  }
  if (Math.hypot(p.x - NEXT_BTN.x, p.y - NEXT_BTN.y) <= NEXT_BTN.r + 6) {
    SFX.flip();
    startLevel(Math.min(LEVELS.length - 1, levelIndex + 1));
    return;
  }

  if (S.mode !== "build") return;

  // 0) Parçanın üstündeki çizimli yön okuna (⇄) mı tıklandı?
  const fpPiece = boardFlipIconAt(p.x, p.y);
  if (fpPiece) {
    fpPiece.flip = !fpPiece.flip;
    SFX.flip();
    return;
  }

  // 0B) Çekilmiş bir halatın ortasındaki çözme/kesme düğmesine (✕) mi tıklandı? (Aletleri sökmeden tek ipi siler!)
  if (S.ropeLinks && S.ropeLinks.length > 0) {
    for (let i = S.ropeLinks.length - 1; i >= 0; i--) {
      const l = S.ropeLinks[i];
      const p1 = resolveLiveNodePos(l.a);
      const p2 = resolveLiveNodePos(l.b);
      const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
      if (Math.hypot(p.x - mx, p.y - my) <= 18) {
        S.ropeLinks.splice(i, 1);
        SFX.flip();
        return;
      }
    }
  }

  // 1) Alt tepsiden bir parça kartına mı basıldı?
  for (const r of trayRects()) {
    if (!r.c.used && p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h) {
      // Eğer Halat Kangalına (rope_coil) basıldıysa: Panoya kangal koyma! "Halat Bağlama Modu"nu aç/kapat!
      if (r.c.type === "rope_coil") {
        S.ropeMode = !S.ropeMode;
        S.ropeStart = null;
        SFX.flip();
        return;
      }
      S.ropeMode = false;
      drag = {
        type: r.c.type, trayK: r.c.k, card: r.c,
        x: p.x, y: p.y, moved: false, source: "tray"
      };
      cv.setPointerCapture(e.pointerId);
      return;
    }
  }

  // 1B) Halat Bağlama Modu (ropeMode) açıksa:
  // Her yere basılıp çekilebilir! Bir noktadan diğerine çekildiğinde veya tıklandığında ip bağlanır ve çizgi kesilir!
  if (S.ropeMode) {
    const rn = ropeNodeAt(p.x, p.y);
    if (rn) {
      if (S.ropeStart && S.ropeStart.id !== rn.id) {
        const exists = S.ropeLinks.some(l =>
          (l.a.id === S.ropeStart.id && l.b.id === rn.id) ||
          (l.a.id === rn.id && l.b.id === S.ropeStart.id)
        );
        if (!exists) {
          S.ropeLinks.push({ a: S.ropeStart, b: rn });
          SFX.place();
        }
        // İki nokta bağlandığı anda sarkan çizgiyi tamamen bitir!
        S.ropeStart = null;
        drag = null;
        if (S.L.rope && S.ropeLinks.length >= (S.L.rope.needLinks || 99)) {
          S.ropeMode = false;
        }
        return;
      }
      S.ropeStart = rn;
      drag = { source: "rope_draw", fromNode: rn, sx: rn.x, sy: rn.y, x: p.x, y: p.y, moved: false };
      cv.setPointerCapture(e.pointerId);
      SFX.scratch();
      return;
    } else {
      // Herhangi bir boş yerden de serbestçe ip çekmeye başlayabilir!
      S.ropeStart = null;
      drag = { source: "rope_draw", fromNode: null, sx: p.x, sy: p.y, x: p.x, y: p.y, moved: false };
      cv.setPointerCapture(e.pointerId);
      SFX.scratch();
      return;
    }
  }

  // 2) Delikli Pano üzerindeki monte edilmiş bir parçaya mı basıldı?
  const bp = boardPieceAt(p.x, p.y);
  if (bp) {
    // Eğer parçanın tam siyah merkez deliğine (r <= 18) basıldıysa ve bölümde halat varsa, doğrudan ip çekmeye de izin ver!
    if (S.L.rope && Math.hypot(p.x - bp.x, p.y - bp.y) <= 18 && (bp.type === "pulley" || S.ropeMode)) {
      const rn = ropeNodeAt(p.x, p.y);
      if (rn) {
        S.ropeMode = true;
        S.ropeStart = rn;
        drag = { source: "rope_draw", fromNode: rn, sx: rn.x, sy: rn.y, x: p.x, y: p.y, moved: false };
        cv.setPointerCapture(e.pointerId);
        SFX.scratch();
        return;
      }
    }
    const idx = S.boardPieces.indexOf(bp);
    if (idx >= 0) S.boardPieces.splice(idx, 1);
    // Sökülen veya yeri değiştirilen alete bağlı tüm ipleri anında çöz ve kaldır!
    S.ropeLinks = S.ropeLinks.filter(l =>
      (!l.a.piece || l.a.piece.uid !== bp.uid) &&
      (!l.b.piece || l.b.piece.uid !== bp.uid) &&
      Math.hypot(l.a.x - bp.x, l.a.y - bp.y) > 22 &&
      Math.hypot(l.b.x - bp.x, l.b.y - bp.y) > 22
    );
    drag = {
      type: bp.type, trayK: bp.trayK, flip: bp.flip, origPiece: bp,
      x: p.x, y: p.y, moved: false, source: "board", wasDrawn: true
    };
    cv.setPointerCapture(e.pointerId);
    return;
  }
});

cv.addEventListener("pointermove", e => {
  const p = toLocal(e); pointer.x = p.x; pointer.y = p.y;
  if (drag) {
    drag.x = p.x; drag.y = p.y;
    if (Math.hypot(p.x - pointer.sx, p.y - pointer.sy) > 10) drag.moved = true;
  }
});

cv.addEventListener("pointerup", e => {
  const p = toLocal(e); pointer.down = false;
  if (!drag) return;

  // 0) İP (HALAT) ÇEKİLDİYSE:
  if (drag.source === "rope_draw") {
    const startNode = drag.fromNode || ropeNodeAt(drag.sx, drag.sy);
    const targetNode = ropeNodeAt(p.x, p.y);
    if (startNode && targetNode && targetNode.id !== startNode.id) {
      // Doğru iki bağlantı noktası arasına çekildiyse halatı sabitle ve sarkan çizgiyi bitir!
      const exists = S.ropeLinks.some(l =>
        (l.a.id === startNode.id && l.b.id === targetNode.id) ||
        (l.a.id === targetNode.id && l.b.id === startNode.id)
      );
      if (!exists) {
        S.ropeLinks.push({ a: startNode, b: targetNode });
        SFX.place();
      }
      S.ropeStart = null;
      if (S.L.rope && S.ropeLinks.length >= (S.L.rope.needLinks || 99)) {
        S.ropeMode = false;
      }
    } else if (drag.moved) {
      // Basılı tutup boşluğa bırakıldıysa sarkan çizgi kalmasın, geri toplansın!
      S.ropeStart = null;
    } else if (!startNode) {
      // Boş bir yere sadece tek tıklandıysa Halat Modundan çık
      S.ropeMode = false;
      S.ropeStart = null;
    }
    drag = null;
    return;
  }

  const peg = nearestPeg(p.x, p.y);

  // A) Panodaki parçaya sadece tıklandıysa (sürüklenmediyse) -> Yönünü çevir (⇄) ve yerinde bırak!
  if (drag.source === "board" && !drag.moved && drag.origPiece) {
    if (PARTS[drag.origPiece.type].canFlip) {
      drag.origPiece.flip = !drag.origPiece.flip;
      SFX.flip();
    }
    S.boardPieces.push(drag.origPiece);
    drag = null;
    return;
  }

  // B) Delikli Pano (Pegboard) üzerine bırakıldıysa -> En yakın deliğe mıknatısla monte et ve kalemle çiz!
  if (peg.onBoard) {
    if (drag.source === "tray" && drag.card) drag.card.used = true;
    mountOnPegboard(drag, p.x, p.y, drag.source === "tray");
    drag = null;
    return;
  }

  // C) Pano dışına boşluğa bırakıldıysa -> Sökülsün (tepsiye geri dönsün)
  const card = S.tray.find(t => t.k === drag.trayK);
  if (card) card.used = false;
  drag = null;
});

// ------------------------------------------------------------ ÇALIŞTIRMA KONTROLÜ
function triggerRun() {
  if (S.mode !== "build") return;
  S.mode = "run"; S.stepI = 0; S.stepT = 0;
  beginStep();
}

// ------------------------------------------------------------ MODAL
function openModal(html) { $("card").innerHTML = html; $("modal").classList.add("on"); }
function closeModal() { $("modal").classList.remove("on"); }

function showWin() {
  SFX.win();
  for (let i = 0; i < 80; i++) spark(rnd(320, 1120), rnd(240, 590), true);
  const last = levelIndex >= LEVELS.length - 1;
  setTimeout(() => {
    if (S.L.isBoss) {
      const mImg = S.L.masterImg || "assets/cut/sketch_archimedes.png";
      openModal(`
        <div style="display:flex;align-items:center;gap:22px;text-align:left;margin-bottom:14px">
          <img src="${mImg}" style="width:125px;height:auto;border:3px solid #5a3a1c;border-radius:12px;background:#f4e3bc;padding:6px">
          <div>
            <div style="font-family:'Great Vibes',cursive;font-size:48px;color:#3a1f08;line-height:1">${S.L.masterName || "Arşimet"}</div>
            <div style="font-style:italic;font-size:15px;color:#6b4420;margin-bottom:6px">${S.L.masterYears || "M.Ö. 287 – 212"}</div>
            <div style="font-family:'Cinzel',serif;font-weight:800;font-size:16px;color:#7a4a10">${S.L.masterWork || "Üstat Sınavı Tamamlandı!"}</div>
          </div>
        </div>
        <p id="typeText" style="font-family:'Lora',serif;font-style:italic;font-size:18px;line-height:1.6;min-height:4.8em;background:rgba(255,248,228,0.65);padding:12px 16px;border-radius:10px;border:2px dashed #8b6336"></p>
        ${last ? `<button class="btn" id="mAgain">↺ 1. Bölümden Oyna</button>`
               : `<button class="btn" id="mNext">Sonraki Üstada Geç ▶</button>`}
        <button class="btn" id="mReplay" style="background:radial-gradient(circle at 30% 25%,#fbf1dc,#d9c19a 50%,#8b6b43)">↺ Tekrar İzle</button>
      `);
      // Daktilo / Kalemle tek tek yazılma efekti!
      const fullTxt = S.L.secret;
      const el = $("typeText");
      let idx = 0;
      const timer = setInterval(() => {
        if (!el || !$("modal").classList.contains("on")) { clearInterval(timer); return; }
        idx += 2;
        el.textContent = fullTxt.slice(0, idx);
        if (idx % 6 === 0) SFX.scratch();
        if (idx >= fullTxt.length) clearInterval(timer);
      }, 32);
    } else {
      openModal(`<h2>🏆 Kusursuz Mühendislik!</h2>
        <p style="font-family:Cinzel,serif;font-weight:800;color:#7a4a10">🧠 Usta Mühendis Sırrı</p>
        <p>${S.L.secret}</p>
        ${last ? `<p><b>🏛️ İlk 5 Mühendislik Sınavını Tamamladın!</b></p>
                 <button class="btn" id="mAgain">↺ 1. Bölümden Oyna</button>`
               : `<button class="btn" id="mNext">Sonraki Bölüm ▶</button>`}
        <button class="btn" id="mReplay" style="background:radial-gradient(circle at 30% 25%,#fbf1dc,#d9c19a 50%,#8b6b43)">↺ Tekrar İzle</button>`);
    }
    const n = $("mNext"); if (n) n.onclick = () => startLevel(levelIndex + 1);
    const a = $("mAgain"); if (a) a.onclick = () => startLevel(0);
    $("mReplay").onclick = () => { closeModal(); backToBuild(); S.mode = "run"; beginStep(); };
  }, 850);
}

function showFailReason(title, whyHtml) {
  SFX.fail();
  setTimeout(() => {
    openModal(`<h2>${title}</h2><p>${whyHtml}</p>
      <button class="btn" id="mRetry">✒️ Panoya Dön & Düzelt</button>
      <button class="btn" id="mShowHint" style="background:radial-gradient(circle at 30% 25%,#fff8d6,#e8c05b 50%,#9c6d16)">ℹ️ Usta İpucu Al</button>`);
    $("mRetry").onclick = () => { closeModal(); backToBuild(); };
    $("mShowHint").onclick = () => { closeModal(); backToBuild(); showSmartInfoHint(); };
  }, 1000);
}

const TOOL_HINTS = {
  lever:      "Düşen ağırlığın dikey darbesini karşı uçta yukarı yönlü fırlatma kuvvetine çevirmek için bir <b>Kaldıraç (Dayanaklı Kalas)</b> kullanmalısın.",
  ramp:       "Yüksekten düşen veya fırlatılan cismin hızını yatay yöne aktarmak için <b>Eğik Rampa</b> kullanmalısın (üstündeki <b>⇄</b> okuyla eğim yönüne dikkat et!).",
  pulley:     "Kuvvetin yönünü tavandan değiştirmek ve halatı yukarıdan aşırmak için üst deliklere bir <b>Sabit Makara</b> monte etmelisin.",
  rope_coil:  "Parçaları yerleştirdin! Şimdi gücü birbirine bağlamak için alttaki <b>Halat Kangalı</b> aracına tıklayıp siyah merkez delikleri ve halkaları birbirine bağla.",
  waterwheel: "Yukarıdaki oluktan akan suyun akış enerjisini dönme hareketine (torka) çevirmek için suyun tam altına <b>Su Çarkı</b> kurmalısın.",
  aeolipile:  "Kaynayan kazandan çıkan basınçlı buharla yüksek devirli dönüş elde etmek için <b>Heron'un Buhar Küresi (Aeolipile)</b> aracını kullanmalısın.",
  gear_s:     "Dönüş hızını ve torku aktarmak için <b>Küçük Dişli Çark</b> kullanmalısın.",
  gear_l:     "Gücü büyütmek ve torku katlamak için <b>Büyük Dişli Çark</b> kullanmalısın.",
  piston:     "Dairesel çark hareketini doğrusal itme gücüne çevirmek için <b>Krank Piston</b> kullanmalısın."
};

// "i" (Information / Usta İpucu) düğmesi: Açık açık cevabı ele vermeden, o aşamada hangi aracın gerektiğini ve fizik mantığını fısıldar!
function showSmartInfoHint() {
  if (S.mode !== "build") backToBuild();
  let nextMissingSlot = null;
  for (const sl of S.L.slots) {
    const res = validateSlotStep(sl);
    if (!res.ok) {
      nextMissingSlot = sl;
      break;
    }
  }

  let targetType = null;
  let stageTitle = "🧭 Usta Mühendis Fısıltısı (1. Kademe İpucu)";
  let clueHtml = "";

  if (nextMissingSlot) {
    targetType = nextMissingSlot.accepts;
    const partName = PARTS[targetType].name;
    clueHtml = `${TOOL_HINTS[targetType] || ""}<br><br>👉 <b>Şu Anki Aşamada Gereken Araç:</b> Alttaki tepside altın çerçeveyle parlayan <b>${partName}</b> aracını seçip delikli panoda uygun hizaya yerleştir!`;
  } else if (S.L.rope && S.ropeLinks.length < (S.L.rope.needLinks || 2)) {
    targetType = "rope_coil";
    clueHtml = `${TOOL_HINTS.rope_coil}<br><br>👉 Bu bölümde toplam <b>${S.L.rope.needLinks || 2} halat bağlantısı</b> kurman gerekiyor (Şu an bağlı: <b>${S.ropeLinks.length}</b>).`;
  } else {
    clueHtml = `🎉 <b>Tüm araçlar ve bağlantılar hazır görünüyor!</b><br>Sol alttaki <b>Çalıştır (▶)</b> üçgenine basarak düzeneği test edebilirsin!`;
  }

  if (targetType) {
    hintToolType = targetType;
    hintToolTimer = 9.0;
  }

  openModal(`
    <h2>${stageTitle}</h2>
    <p>${clueHtml}</p>
    <button class="btn" id="mInfoOk">✒️ Anladım, Kendim Kuracağım!</button>
    <button class="btn" id="mDeepHint" style="background:radial-gradient(circle at 30% 25%,#fbf1dc,#d9c19a 50%,#8b6b43)">🔍 2. Kademe: Panodaki Yeri Göster</button>
  `);
  $("mInfoOk").onclick = () => closeModal();
  $("mDeepHint").onclick = () => {
    closeModal();
    hintTimer = 5.5;
  };
}

// ------------------------------------------------------------ PARÇACIKLAR
function spark(x, y, big) {
  particles.push({ x, y, vx: rnd(-1, 1) * (big ? 220 : 100), vy: rnd(-1.2, 0.2) * (big ? 240 : 130),
    life: rnd(0.5, 1.1), t: 0, r: rnd(1.5, big ? 4.2 : 2.8), hue: rnd(34, 48) });
}
function drip(x, y) { particles.push({ x, y, vx: rnd(-18, 18), vy: rnd(190, 280), life: 0.45, t: 0, r: rnd(2, 3.8), water: true }); }
function firePuff(x, y) {
  particles.push({ x: x + rnd(-24, 24), y: y + rnd(-4, 6), vx: rnd(-18, 18), vy: rnd(-95, -45), life: rnd(0.28, 0.52), t: 0, r: rnd(4, 7.5), hue: rnd(14, 38), fire: true });
}
function steamPuff(x, y, vx, vy) {
  particles.push({ x, y, vx: vx + rnd(-25, 25), vy: vy + rnd(-35, -10), life: rnd(0.45, 0.85), t: 0, r: rnd(6, 13), steam: true });
}

// ------------------------------------------------------------ MATEMATİK & FİZİK DOĞRULAMA
function validateSlotStep(slot) {
  const candidates = S.boardPieces.filter(p => p.type === slot.accepts);
  const partName = PARTS[slot.accepts].name;
  const targetPeg = nearestPeg(slot.x, slot.y);

  if (candidates.length === 0) {
    const nearWrong = S.boardPieces.find(p => Math.hypot(p.x - slot.x, p.y - slot.y) < 110);
    if (nearWrong) {
      return {
        ok: false, piece: nearWrong,
        title: "💥 Yanlış Mekanizma!",
        why: `Buraya <b>${PARTS[nearWrong.type].name}</b> koymuşsun ama bu adımda <b>${partName}</b> gerekiyor!`
      };
    }
    return {
      ok: false, piece: null,
      title: "💥 Eksik Parça!",
      why: `Bu aşamada <b>${partName}</b> gerekiyor ama delikli panoya henüz yerleştirmedin!`
    };
  }

  let best = candidates[0], minDist = 99999;
  for (const c of candidates) {
    const d = Math.hypot(c.x - slot.x, c.y - slot.y);
    if (d < minDist) { minDist = d; best = c; }
  }

  const tol = slot.tol || 72;
  if (minDist > tol) {
    const dc = best.col - targetPeg.col;
    const dr = best.row - targetPeg.row;
    const horiz = dc < 0 ? `<b>${Math.abs(dc)} delik sağa</b>` : (dc > 0 ? `<b>${dc} delik sola</b>` : "");
    const vert  = dr < 0 ? `<b>${Math.abs(dr)} delik aşağı</b>` : (dr > 0 ? `<b>${dr} delik yukarı</b>` : "");
    const moveTxt = [horiz, vert].filter(Boolean).join(" ve ");
    return {
      ok: false, piece: best,
      title: "📐 Matematik Hesabı Şaştı!",
      why: `<b>${partName}</b> biraz uzakta kaldığı için mekanizma ıskaladı!<br>Parçayı yaklaşık ${moveTxt} kaydır.`
    };
  }

  if (slot.accepts === "ramp" && !!best.flip !== !!slot.flip) {
    return {
      ok: false, piece: best,
      title: "📐 Eğim Yönü Ters!",
      why: `<b>Eğik Rampa</b> doğru yerde ama <b>ters yöne</b> bakıyor!<br>Rampanın üstündeki çizimli oka (<b>⇄</b>) dokunarak yönünü çevir.`
    };
  }

  return { ok: true, piece: best };
}

function findPieceForSlotId(slotId) {
  return S.boardPieces.find(p => p.matchedSlotId === slotId);
}

// ------------------------------------------------------------ GÜNCELLEME
function update(dt) {
  globalT += dt;
  if (hintTimer > 0) hintTimer = Math.max(0, hintTimer - dt);
  if (hintToolTimer > 0) hintToolTimer = Math.max(0, hintToolTimer - dt);

  if (S.padPiece && S.padPiece.drawT < 1) {
    S.padPiece.drawT = Math.min(1, S.padPiece.drawT + dt / 1.0);
    if (Math.random() < 0.48) SFX.scratch();
  }

  for (const p of S.boardPieces) {
    if (p.drawT < 1) {
      p.drawT = Math.min(1, p.drawT + dt / 1.0);
      if (Math.random() < 0.45) SFX.scratch();
    }
    p.ang += p.spinV * dt;
    // Buhar Küresi (Aeolipile) çalışırken: Alt kazanda harlı ateş + dönen iki borudan fışkıran yoğun buhar bulutları!
    if (p.type === "aeolipile" && Math.abs(p.spinV) > 0.1) {
      if (Math.random() < 0.85) firePuff(p.x, p.y + p.size * 0.43);
      if (Math.random() < 0.92) {
        const nr = p.size * 0.31;
        for (const aOff of [-0.55, Math.PI + 0.55]) {
          const ang = (p.ang || 0) + aOff;
          const nx = p.x + Math.cos(ang) * nr;
          const ny = p.y + Math.sin(ang) * nr;
          steamPuff(nx, ny, Math.cos(ang - 1.2) * 95, Math.sin(ang - 1.2) * 95 - 40);
        }
      }
    }
  }

  if (S.mode === "run") {
    runStep(dt);
  } else if (S.mode === "fail") {
    for (const a of Object.values(S.actors)) if (a.fall) {
      a.fall.t += dt; a.fall.vy += 1350 * dt; a.y += a.fall.vy * dt; a.x += a.fall.vx * dt; a.ang += a.fall.va * dt;
      const floor = FLOOR_Y - (a.s ? a.s / 2 : a.r);
      if (a.y > floor) { a.y = floor; a.fall.vy *= -0.32; a.fall.vx *= 0.6; a.fall.va *= 0.5; }
    }
  }

  if (S.waterOn && S.L.water && Math.random() < 0.8) drip(S.L.water.x + rnd(-12, 12), S.L.water.y1 - 8);
  particles = particles.filter(p => (p.t += dt) < p.life);
  for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; if (!p.water) { p.vy += -40 * dt; p.vx *= 0.98; } }
}

function beginStep() {
  const st = S.L.steps[S.stepI];
  if (!st) return;
  st._start = {};
  for (const m of st.move || []) { const a = S.actors[m.a]; st._start[m.a] = { x: a.x, y: a.y, ang: a.ang }; }
  if (st.show) S.actors[st.show].hidden = false;
  if (st.unhook && S.actors[st.unhook]) {
    const ua = S.actors[st.unhook];
    const offY = ua.kind === "anvil" ? 30 : (ua.s ? ua.s * 0.38 : 24);
    ua.unhookedPos = { x: ua.x, y: ua.y - offY };
  }

  // Su ve bant her zaman ilk anda çalışmaya başlasın!
  if (st.water) { S.waterOn = true; if (SFX.water) SFX.water(); }
  if (st.conveyor) S.conveyorOn = true;

  if (st.need) {
    const needs = Array.isArray(st.need) ? st.need : [st.need];
    for (const nid of needs) {
      const slot = S.L.slots.find(s => s.id === nid);
      const check = validateSlotStep(slot);
      if (!check.ok) {
        S.mode = "fail";
        // Sadece o adımda havada/harekette olan aktör düşsün; yerde/kapıda duran nesneler olduğu yerde kalsın!
        const movingActor = st.move && st.move[0] && S.actors[st.move[0].a];
        if (movingActor && movingActor.kind === "anvil" && movingActor.y < 490) {
          movingActor.fall = { t: 0, vy: 60, vx: rnd(-90, 90), va: rnd(-3, 3) };
        }
        SFX.thud();
        showFailReason(check.title, check.why);
        return;
      }
      const p = check.piece;
      p.matchedSlotId = slot.id;
      if (p.origX === undefined) { p.origX = p.x; p.origY = p.y; }
      p.x = slot.x; p.y = slot.y;
      if (st.spin && st.spin[nid]) {
        p.spinV = st.spin[nid];
        if (p.type === "aeolipile" && SFX.steam) SFX.steam();
      }
      if (st.push && st.push[nid]) p.pushOn = true;
    }
  }

  if (st.needRope) {
    const req = typeof st.needRope === "number" ? st.needRope : ((S.L.rope && S.L.rope.needLinks) || 2);
    if (S.ropeLinks.length < req) {
      S.mode = "fail";
      const movingActor = st.move && st.move[0] && S.actors[st.move[0].a];
      if (movingActor && movingActor.kind === "anvil" && movingActor.y < 490) {
        movingActor.fall = { t: 0, vy: 60, vx: rnd(-70, 70), va: rnd(-2.5, 2.5) };
      }
      SFX.thud();
      showFailReason("🪢 Halat Bağlantısı Eksik!",
        `Çark ve makaralar döndü ama halat bağlı olmadığı için güç aktarılamadı!<br>Alttan <b>Halat Kangalı</b> aracına tıkla ve deliklerden/halkalardan birbirine halatı bağla!`);
      return;
    }
    // Eğer oyuncu 1. Makara'ya kadar ipi çektiyse ve örsün halkasına bağlamayı unuttuysa bile otomatik kancala ki örs rampaya bırakılsın!
    if (st.autoHookActor && S.actors[st.autoHookActor]) {
      const ak = st.autoHookActor;
      const hasActorLink = S.ropeLinks.some(l => l.a.actorKey === ak || l.b.actorKey === ak);
      if (!hasActorLink) {
        const makPiece = findPieceForSlotId("makara1") || S.boardPieces.find(bp => bp.type === "pulley");
        const actObj = S.actors[ak];
        if (makPiece && actObj) {
          const offY = actObj.kind === "anvil" ? 30 : (actObj.s ? actObj.s * 0.38 : 24);
          S.ropeLinks.push({
            a: { id: `piece_${makPiece.uid}`, kind: makPiece.type, piece: makPiece, x: makPiece.x, y: makPiece.y },
            b: { id: `actor_${ak}`, kind: actObj.kind, actorKey: ak, x: actObj.x, y: actObj.y - offY }
          });
        }
      }
    }
  }

  for (const [id, v] of Object.entries(st.spin || {})) {
    const p = findPieceForSlotId(id);
    if (p) p.spinV = v;
  }
  for (const [id] of Object.entries(st.push || {})) {
    const p = findPieceForSlotId(id);
    if (p) p.pushOn = true;
  }
  if (st.sound && st.sound !== "water" && SFX[st.sound]) SFX[st.sound]();
}

function runStep(dt) {
  const st = S.L.steps[S.stepI];
  if (!st) { S.mode = "win"; showWin(); return; }
  S.stepT += dt;
  const t = clamp(S.stepT / st.dur, 0, 1);
  for (const [id, [a, b]] of Object.entries(st.rot || {})) {
    const p = findPieceForSlotId(id);
    if (p) p.rot = lerp(a, b, EASE.out(t));
  }
  for (const m of st.move || []) {
    const a = S.actors[m.a], s0 = st._start[m.a], e = (EASE[m.ease] || EASE.lin)(t);
    a.x = lerp(s0.x, m.to[0], e);
    a.y = lerp(s0.y, m.to[1], e) - (m.arc ? Math.sin(Math.PI * e) * m.arc : 0);
    if (m.spin) a.ang = s0.ang + m.spin * e;
  }
  for (const c of st.circle || []) {
    const a = S.actors[c.a], ang = lerp(c.a0, c.a1, EASE.io(t));
    a.x = c.cx + Math.cos(ang) * c.r; a.y = c.cy + Math.sin(ang) * c.r;
  }
  if (t >= 1) {
    if (st.hide) S.actors[st.hide].hidden = true;
    S.stepI++; S.stepT = 0;
    if (S.stepI >= S.L.steps.length) { S.mode = "win"; showWin(); }
    else beginStep();
  }
}

// ------------------------------------------------------------ ÇİZİM
function drawBg() {
  const im = IMG.bg;
  if (im) {
    const sc = Math.max(W / im.width, H / im.height);
    ctx.drawImage(im, (W - im.width * sc) / 2, (H - im.height * sc) / 2, im.width * sc, im.height * sc);
  } else {
    ctx.fillStyle = "#e8d2a6"; ctx.fillRect(0, 0, W, H);
  }

  // Sol parşömen boşluğuna çağın büyük ustasının mürekkep eskiz silüeti (panoya doğru bakar!)
  const mKey = S.L.masterKey || "sk_archimedes";
  const mSign = S.L.masterSign || "Arşimet";
  const mYears = S.L.masterYears || "M.Ö. 287 – 212";
  const archIm = IMG[mKey] || IMG.sk_archimedes;
  if (archIm) {
    ctx.save();
    ctx.globalAlpha = 0.86;
    const b = fitBox(archIm, 255);
    ctx.drawImage(archIm, 155 - b.w / 2, 420 - b.h / 2, b.w, b.h);

    // Altına Da Vinci parşömen el yazısıyla (kaligrafik mürekkep) üstadın imzası ve tarihi
    ctx.textAlign = "center";
    ctx.fillStyle = INK;
    ctx.globalAlpha = 0.88;
    ctx.font = "44px 'Great Vibes', 'Lora', cursive";
    ctx.fillText(mSign, 155, 420 + b.h / 2 + 34);
    ctx.font = "italic 600 14px 'Lora', Georgia, serif";
    ctx.globalAlpha = 0.72;
    ctx.fillText(mYears, 155, 420 + b.h / 2 + 56);
    ctx.restore();
  }

  // Sağ parşömen boşluğuna (X: 1222..1496, Y: 336..518) okunaklı, çok dilli (TR/EN) Mühendislik Görev Notu!
  drawParchmentMissionNote();

  // Koyulması gereken yerlerdeki pano deliklerini biraz daha koyu siyah/demir pim yuvası yap (ipucu yazısı olmadan doğal görünüm!)
  for (const s of S.L.slots) {
    const peg = nearestPeg(s.x, s.y);
    ctx.save();
    ctx.fillStyle = "rgba(32, 16, 5, 0.78)";
    ctx.beginPath(); ctx.arc(peg.x, peg.y, 7.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(20, 9, 2, 0.9)";
    ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(peg.x, peg.y, 9.5, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  // Sürüklerken sadece en yakın deliğin etrafında ince çizim halkası göster (yazı yok!)
  if (S.mode === "build" && ((drag && drag.type) || S.padPiece)) {
    const hoverPeg = nearestPeg(pointer.x, pointer.y);
    if (hoverPeg && hoverPeg.onBoard) {
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.arc(hoverPeg.x, hoverPeg.y, 14, 0, 7); ctx.stroke();
      ctx.restore();
    }
  }
}

const LANG = new URLSearchParams(location.search).get("lang") || "tr";
const NOTE_I18N = {
  tr: {
    intro: "Burası bir proje çizim ekranıdır; doğru çizimleri yaptırana kadar düzenek hareketlenmez.",
    taskLabel: "BU BÖLÜMDEKİ GÖREVİNİZ:",
    taskDefault: "Doğru araçları kullanarak kayayı sepete atmak.",
    outro: "Unutmayın; fizik, matematik ve mekanik her zaman hayatımızdadır."
  },
  en: {
    intro: "This is an engineering blueprint desk; the mechanism will not move until you complete the right drawings.",
    taskLabel: "YOUR MISSION THIS LEVEL:",
    taskDefault: "Use the right tools to launch the stone into the basket.",
    outro: "Remember; physics, mathematics, and mechanics are always part of our lives."
  }
};

function wrapCanvasLines(text, maxWidth) {
  const words = (text || "").split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? cur + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawParchmentMissionNote() {
  const dict = NOTE_I18N[LANG] || NOTE_I18N.tr;
  const taskTxt = (LANG === "en" ? S.L.task_en : S.L.task) || S.L.task || dict.taskDefault;
  const cx = 1358;
  const maxW = 266;
  let y = 316;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // 1) Sabit Giriş Cümlesi
  ctx.font = "italic 600 13.5px 'Lora', Georgia, serif";
  ctx.fillStyle = "#4a270b";
  ctx.globalAlpha = 0.90;
  for (const ln of wrapCanvasLines(dict.intro, maxW)) {
    ctx.fillText(ln, cx, y);
    y += 16.5;
  }

  // İnce mürekkep ayraç çizgisi
  y += 4;
  ctx.strokeStyle = "rgba(74, 39, 11, 0.38)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - 85, y);
  ctx.lineTo(cx + 85, y);
  ctx.stroke();
  y += 6;

  // 2) Bölüme Özel Görev Başlığı ve Metni
  ctx.font = "800 12px 'Cinzel', Georgia, serif";
  ctx.fillStyle = "#6e3209";
  ctx.globalAlpha = 0.95;
  ctx.fillText(dict.taskLabel, cx, y);
  y += 15.5;

  ctx.font = "700 14px 'Lora', Georgia, serif";
  ctx.fillStyle = "#261203";
  ctx.globalAlpha = 0.96;
  for (const ln of wrapCanvasLines(taskTxt, maxW)) {
    ctx.fillText(ln, cx, y);
    y += 17;
  }

  // İnce mürekkep ayraç çizgisi
  y += 4;
  ctx.beginPath();
  ctx.moveTo(cx - 85, y);
  ctx.lineTo(cx + 85, y);
  ctx.stroke();
  y += 6;

  // 3) Sabit Kapanış Özdeyişi
  ctx.font = "italic 600 13px 'Lora', Georgia, serif";
  ctx.fillStyle = "#542d0e";
  ctx.globalAlpha = 0.88;
  for (const ln of wrapCanvasLines(dict.outro, maxW)) {
    ctx.fillText(ln, cx, y);
    y += 16;
  }

  ctx.restore();
}

function inkLine(pts, w = 3, col = INK) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round";
  for (let pass = 0; pass < 2; pass++) {
    ctx.globalAlpha = pass ? 0.35 : 0.88; ctx.beginPath();
    pts.forEach(([x, y], i) => { const j = pass ? 1.4 : 0; i ? ctx.lineTo(x + j, y - j) : ctx.moveTo(x + j, y + j); });
    ctx.stroke();
  }
  ctx.restore();
}

function drawDecor() {
  inkLine([[280, FLOOR_Y], [1180, FLOOR_Y]], 4);

  for (const d of S.L.decor) {
    switch (d.t) {
      case "line": inkLine(d.p, 3); break;
      case "shelf": inkLine([[d.x - d.w / 2, d.y], [d.x + d.w / 2, d.y]], 5); break;
      case "trap":
        inkLine([[d.x - 50, d.y - 32], [d.x + 50, d.y - 32]], 4);
        inkLine([[d.x - 34, d.y - 32], [d.x - 34, d.y - 8]], 2);
        inkLine([[d.x + 34, d.y - 32], [d.x + 34, d.y - 8]], 2);
        break;
      case "spout": drawSpout(d.x, d.y); break;
      case "pulley": drawPulley(d.x, d.y, d.r); break;
      case "basket": drawBasket(d.x, d.y); break;
      case "sled": drawSled(d.x, d.y); break;
      case "well": drawWell(d.x, d.y); break;
      case "temple_pillars": drawTemplePillars(d.x, d.y, d.s); break;
      case "conveyor": drawConveyor(d.x1, d.x2, d.y); break;
      case "factory": drawFactory(d.x, d.y); break;
    }
  }
  if (S.L.goal) drawGoalGlow(S.L.goal.x, S.L.goal.y);
}

// Çarkların ve dişlilerin ÜSTÜNE çizilen bağlantılar (deri kayış kasnakları ve krank kolu havada kalmasın, çarkların göbeğine üstten tam otursun!)
function drawFrontLinkages() {
  for (const d of S.L.decor) {
    if (d.t === "belt") drawBelt(d.a, d.b);
    else if (d.t === "crank") drawCrank(d.a, d.b);
  }
}

function drawGoalGlow(x, y) {
  const pulse = 0.5 + 0.5 * Math.sin(globalT * 3);
  const g = ctx.createRadialGradient(x, y, 8, x, y, 85);
  g.addColorStop(0, `rgba(255,215,100,${0.32 + pulse * 0.2})`); g.addColorStop(1, "rgba(255,200,80,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 85, 0, Math.PI * 2); ctx.fill();
}
function drawBasket(x, y) {
  const im = IMG.sk_basket;
  if (im) {
    const b = fitBox(im, 128);
    ctx.drawImage(im, x - b.w / 2, y - b.h / 2, b.w, b.h);
  } else {
    inkLine([[x - 56, y - 40], [x - 46, y + 42], [x + 46, y + 42], [x + 56, y - 40]], 4);
  }
}
function drawSled(x, y) {
  const im = IMG.sk_sled;
  if (im) {
    const b = fitBox(im, 185);
    ctx.drawImage(im, x - b.w / 2, y - b.h / 2, b.w, b.h);
  } else {
    inkLine([[x - 75, y + 15], [x + 75, y + 15], [x + 75, y - 10]], 4);
  }
}
function drawWell(x, y) {
  const im = IMG.sk_well;
  if (im) {
    const b = fitBox(im, 175);
    ctx.drawImage(im, x - b.w / 2, y - b.h / 2, b.w, b.h);
  } else {
    inkLine([[x - 65, y], [x + 65, y]], 5);
  }
}
function drawTemplePillars(x, y, s = 230) {
  const im = IMG.sk_temple_pillars;
  if (im) {
    const b = fitBox(im, s);
    ctx.drawImage(im, x - b.w / 2, y - b.h / 2, b.w, b.h);
  }
}
// Kaya sepetin veya kuyunun içine düştüğünde ön kenar kayanın önünde dursun (içine girmiş/düşmüş görünsün!)
function drawBasketsFront() {
  const im = IMG.sk_basket;
  if (im) {
    for (const d of S.L.decor) {
      if (d.t !== "basket") continue;
      const x = d.x, y = d.y, b = fitBox(im, 128);
      ctx.save();
      // Sepetin sadece ön V-ağzının altındaki ön yüz poligonunu (alt raf çizgisine taşmadan!) kırp
      ctx.beginPath();
      ctx.moveTo(x - b.w * 0.43, y - b.h * 0.25);
      ctx.lineTo(x + b.w * 0.03, y - b.h * 0.08);
      ctx.lineTo(x + b.w * 0.43, y - b.h * 0.30);
      ctx.lineTo(x + b.w * 0.42, y + b.h * 0.16);
      ctx.lineTo(x + b.w * 0.03, y + b.h * 0.45);
      ctx.lineTo(x - b.w * 0.42, y + b.h * 0.22);
      ctx.closePath();
      ctx.clip();
      const bgIm = IMG.bg;
      if (bgIm) {
        const sc = Math.max(W / bgIm.width, H / bgIm.height);
        ctx.drawImage(bgIm, (W - bgIm.width * sc) / 2, (H - bgIm.height * sc) / 2, bgIm.width * sc, bgIm.height * sc);
      }
      ctx.drawImage(im, x - b.w / 2, y - b.h / 2, b.w, b.h);
      ctx.restore();
    }
  }
  const wIm = IMG.sk_well;
  if (wIm) {
    for (const d of S.L.decor) {
      if (d.t !== "well") continue;
      const x = d.x, y = d.y, b = fitBox(wIm, 175);
      ctx.save();
      // Kuyunun alt/ön ahşap-taş çerçevesi kayayı örtsün ki kaya kuyunun derinliğine düşüp kaybolsun!
      ctx.beginPath();
      ctx.rect(x - b.w / 2, y + b.h * 0.12, b.w, b.h * 0.85);
      ctx.clip();
      const bgIm = IMG.bg;
      if (bgIm) {
        const sc = Math.max(W / bgIm.width, H / bgIm.height);
        ctx.drawImage(bgIm, (W - bgIm.width * sc) / 2, (H - bgIm.height * sc) / 2, bgIm.width * sc, bgIm.height * sc);
      }
      ctx.drawImage(wIm, x - b.w / 2, y - b.h / 2, b.w, b.h);
      ctx.restore();
    }
  }
}
function drawSpout(x, y) {
  inkLine([[x - 90, y - 24], [x - 8, y - 24], [x + 14, y + 5]], 5);
  inkLine([[x - 90, y - 5], [x - 14, y - 5], [x - 3, y + 12]], 3);
  const L = S.L.water;
  if (!L) return;
  if (S.waterOn) {
    ctx.save();
    ctx.strokeStyle = "rgba(75,135,190,0.75)"; ctx.lineWidth = 14; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(L.x + 3, L.y0 + 8); ctx.lineTo(L.x, L.y1); ctx.stroke();
    ctx.restore();
  } else {
    ctx.save(); ctx.setLineDash([6, 8]); inkLine([[L.x, L.y0 + 14], [L.x, L.y1]], 2, "#4a6580"); ctx.restore();
  }
}
function drawPulley(x, y, r) {
  ctx.save();
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fillStyle = INK; ctx.fill();
  ctx.restore();
}

function getSlotOrPlacedPos(slotId) {
  const sl = S.L.slots.find(s => s.id === slotId);
  const placed = S.boardPieces.find(p => p.matchedSlotId === slotId) ||
                 (sl && S.boardPieces.find(p => p.type === sl.accepts));
  return placed || sl;
}

function drawBelt(aId, bId) {
  const a = getSlotOrPlacedPos(aId), b = getSlotOrPlacedPos(bId);
  if (!a || !b) return;
  const hasBoth = S.boardPieces.some(p => p.type === S.L.slots.find(s => s.id === aId).accepts) &&
                  S.boardPieces.some(p => p.type === S.L.slots.find(s => s.id === bId).accepts);
  if (!hasBoth) return;
  const ra = a.size * 0.14, rb = b.size * 0.15;
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let pass = 0; pass < 2; pass++) {
    const j = pass ? 1.1 : 0;
    ctx.globalAlpha = pass ? 0.38 : 0.92;
    // 1) Sol çarkın (Su Çarkı) göbeğindeki deri kayış kasnağı ve sağ dişlinin kasnağı
    ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.arc(a.x + j, a.y - j, ra, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(b.x + j, b.y - j, rb, 0, Math.PI * 2); ctx.stroke();
    // 2) İki kasnağın dış teğetlerini saran ve etrafından tam dolanan çift katmanlı deri kayış!
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.arc(a.x + j, a.y - j, ra, Math.PI * 0.5, Math.PI * 1.5, false);
    ctx.lineTo(b.x + j, b.y - rb - j);
    ctx.arc(b.x + j, b.y - j, rb, -Math.PI * 0.5, Math.PI * 0.5, false);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}
function drawCrank(aId, bId) {
  const a = getSlotOrPlacedPos(aId), b = getSlotOrPlacedPos(bId);
  const hasBoth = S.boardPieces.some(p => p.type === S.L.slots.find(s => s.id === aId).accepts) &&
                  S.boardPieces.some(p => p.type === S.L.slots.find(s => s.id === bId).accepts);
  if (!hasBoth) return;
  const ang = a.ang || 0, r = a.size * 0.28;
  const px = a.x + Math.cos(ang) * r, py = a.y + Math.sin(ang) * r;
  const push = b.push || 0;
  const rodEnd = [b.x - b.size * 0.42 + push * 32, b.y];
  inkLine([[px, py], rodEnd], 3);
}
function drawConveyor(x1, x2, y) {
  inkLine([[x1, y - 32], [x2, y - 32]], 3);
  inkLine([[x1, y - 10], [x2, y - 10]], 3);
  for (let x = x1 + 18; x < x2; x += 44) {
    ctx.beginPath(); ctx.arc(x, y - 21, 9, 0, 7); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  }
}
function drawFactory(x, y) {
  const w = 115, h = 155, bx = x - w / 2 + 12, by = y - h / 2;
  inkLine([[bx, by + h], [bx, by], [bx + w, by], [bx + w, by + h]], 3.5);
  inkLine([[bx + 15, by + h], [bx + 15, y - 20], [bx + w / 2, y - 45], [bx + w - 15, y - 20], [bx + w - 15, by + h]], 2.5);
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function drawHintGhosts() {
  if (hintTimer <= 0 || S.mode !== "build") return;
  for (const s of S.L.slots) {
    ctx.save();
    ctx.setLineDash([8, 6]); ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#b86b00";
    ctx.fillStyle = "rgba(255, 215, 90, 0.18)";
    const b = partBox(s.accepts, s.size);
    roundRect(s.x - b.w / 2, s.y - b.h / 2, b.w, b.h, 14);
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }
}

// ------------------------------------------------------------ ALTTAKİ ÇİZİM MASASI (PAD) VE SOLUNDAKİ ÇİZİM KONTROLLERİ (▶ ve ↺)
function drawSketchControls() {
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 0) EN SOLDAKİ MÜZİK SİMGESİ (♪) — Dönem müziğini aç/kapat (yazısız el çizimi!)
  ctx.save();
  ctx.translate(MUSIC_BTN.x, MUSIC_BTN.y);
  for (let pass = 0; pass < 2; pass++) {
    const j = pass ? 1.1 : 0;
    ctx.globalAlpha = (pass ? 0.35 : 0.86) * (BGM.muted ? 0.45 : 1);
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(j, -j, MUSIC_BTN.r, 0, Math.PI * 2);
    ctx.stroke();
    // El çizimi sekizlik nota (♪)
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.ellipse(-4 + j, 7 - j, 6.5, 4.8, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(1.5 + j, 6 - j);
    ctx.lineTo(1.5 + j, -13 - j);
    ctx.quadraticCurveTo(11 + j, -9 - j, 9 + j, -1 - j);
    ctx.stroke();
    // Kapalıysa üstüne çapraz mürekkep çizgisi
    if (BGM.muted) {
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(-16 + j, 16 - j);
      ctx.lineTo(16 + j, -16 - j);
      ctx.stroke();
    }
  }
  ctx.restore();

  // 0B) İPUCU / BİLGİ SİMGESİ (i) — O aşamada gereken aracı ve küçük fizik ipucunu gösterir!
  ctx.save();
  ctx.translate(INFO_BTN.x, INFO_BTN.y);
  for (let pass = 0; pass < 2; pass++) {
    const j = pass ? 1.1 : 0;
    ctx.globalAlpha = pass ? 0.35 : 0.88;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(j, -j, INFO_BTN.r, 0, Math.PI * 2);
    ctx.stroke();
    // Da Vinci parşömen kaligrafik "i" harfi (noktası ve serifli gövdesi)
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(j, -11 - j, 3.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-4 + j, -4 - j);
    ctx.lineTo(1 + j, -4 - j);
    ctx.lineTo(1 + j, 11 - j);
    ctx.moveTo(-5 + j, 11 - j);
    ctx.lineTo(6 + j, 11 - j);
    ctx.stroke();
  }
  ctx.restore();

  // 1) SOLDAKİ SIFIRLA SİMGESİ (↺) — Sadece el çizimi mürekkep simgesi, yazı yok!
  ctx.save();
  ctx.translate(RESET_BTN.x, RESET_BTN.y);
  for (let pass = 0; pass < 2; pass++) {
    const j = pass ? 1.2 : 0;
    ctx.globalAlpha = pass ? 0.35 : 0.88;
    // Dış el çizimi halka
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(j, -j, RESET_BTN.r, 0, Math.PI * 2);
    ctx.stroke();
    // İçteki geri dönüş oku (↺)
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(j, -j, 15, -Math.PI * 0.72, Math.PI * 0.82, false);
    ctx.stroke();
    // Ok ucu
    const ax = 15 * Math.cos(-Math.PI * 0.72) + j;
    const ay = 15 * Math.sin(-Math.PI * 0.72) - j;
    ctx.beginPath();
    ctx.moveTo(ax - 2, ay - 9);
    ctx.lineTo(ax - 3, ay + 2);
    ctx.lineTo(ax + 8, ay + 1);
    ctx.stroke();
  }
  ctx.restore();

  // 2) SAĞINDAKİ ÇALIŞTIR SİMGESİ (▶ ÜÇGEN) — Sadece el çizimi mürekkep üçgeni, yazı yok!
  ctx.save();
  ctx.translate(RUN_BTN.x, RUN_BTN.y);
  const canRun = S.mode === "build";
  for (let pass = 0; pass < 2; pass++) {
    const j = pass ? 1.3 : 0;
    ctx.globalAlpha = (pass ? 0.35 : 0.92) * (canRun ? 1 : 0.4);
    // Dış el çizimi halka
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(j, -j, RUN_BTN.r, 0, Math.PI * 2);
    ctx.stroke();
    // İçteki el çizimi üçgen (▶) + Da Vinci çapraz tarama (cross-hatching) çizgileri
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-11 + j, -17 - j);
    ctx.lineTo(19 + j, 0 - j);
    ctx.lineTo(-11 + j, 17 - j);
    ctx.closePath();
    ctx.stroke();
    if (!pass) {
      // Eskiz taraması (üçgenin içinde ince kalem tarama çizgileri)
      ctx.save();
      ctx.clip();
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = canRun ? 0.42 : 0.18;
      for (let h = -22; h <= 22; h += 4.5) {
        ctx.beginPath();
        ctx.moveTo(-18, h - 8);
        ctx.lineTo(22, h + 12);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  ctx.restore();

  // 3) PLAY TUŞUNUN ALTINDAKİ BÖLÜM GERİ (◀) VE İLERİ (▶) EL ÇİZİMİ OKLARI
  for (const [btn, dir] of [[PREV_BTN, -1], [NEXT_BTN, 1]]) {
    const active = dir < 0 ? levelIndex > 0 : levelIndex < LEVELS.length - 1;
    ctx.save();
    ctx.translate(btn.x, btn.y);
    for (let pass = 0; pass < 2; pass++) {
      const j = pass ? 1.0 : 0;
      ctx.globalAlpha = (pass ? 0.35 : 0.88) * (active ? 1 : 0.32);
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(j, -j, btn.r, 0, Math.PI * 2);
      ctx.stroke();
      // Ok (◀ veya ▶)
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(8 * dir + j, 0 - j);
      ctx.lineTo(-6 * dir + j, -9 - j);
      ctx.lineTo(-6 * dir + j, 9 - j);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.globalAlpha *= 0.25;
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
}

function drawDrawingPad() {
  drawSketchControls();
}

// Parçanın üstünde çıkan el çizimi yön değiştirme oku (⇄ — yazısız, saf mürekkep çizim!)
function drawSketchFlipArrow(p) {
  if (S.mode !== "build" || !PARTS[p.type].canFlip || p.drawT < 1) return;
  const fp = flipIconPos(p);
  ctx.save();
  ctx.translate(fp.x, fp.y);
  // Parşömen yuvarlak düğme
  ctx.fillStyle = "rgba(245, 228, 192, 0.88)";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.arc(0, 0, fp.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Üst sağa ok (→) ve alt sola ok (←) el çizimi tarzında
  ctx.beginPath();
  ctx.moveTo(-10, -4); ctx.lineTo(10, -4);
  ctx.moveTo(5, -9); ctx.lineTo(10, -4); ctx.lineTo(5, 1);
  ctx.moveTo(10, 5); ctx.lineTo(-10, 5);
  ctx.moveTo(-5, 0); ctx.lineTo(-10, 5); ctx.lineTo(-5, 10);
  ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------ PARÇA ÇİZİMİ (SAF ESKİZ!)
function drawSinglePart(cx, cy, p, customSize = null) {
  const def = PARTS[p.type], size = customSize || p.size;
  ctx.save();
  ctx.translate(cx, cy);
  if (p.flip) ctx.scale(-1, 1);

  const half = size / 2;
  const dt = p.drawT !== undefined ? p.drawT : 1;
  if (dt < 1) {
    const edge = -half + dt * size;
    ctx.beginPath(); ctx.moveTo(-half - 5, -half - 5);
    for (let y = -half; y <= half; y += 12) ctx.lineTo(edge + Math.sin(y * 0.09 + dt * 20) * 14, y);
    ctx.lineTo(-half - 5, half + 5); ctx.closePath(); ctx.clip();
  }

  const im = IMG[def.sk];
  if (p.type === "lever" && IMG.sk_lever_base && IMG.sk_lever_beam) {
    // Kaldıraç: Ayrılmış alt üçgen dayanak sabit durur, üst ahşap kalas dayanak noktası etrafında pürüzsüz döner!
    const b = fitBox(im, size);
    const pivY = -0.05 * b.h;
    ctx.drawImage(IMG.sk_lever_base, -b.w / 2, -b.h / 2, b.w, b.h);
    ctx.save();
    ctx.translate(0, pivY);
    ctx.rotate(p.rot || 0);
    ctx.translate(0, -pivY);
    ctx.drawImage(IMG.sk_lever_beam, -b.w / 2, -b.h / 2, b.w, b.h);
    ctx.restore();
  } else if (p.type === "aeolipile" && IMG.sk_aeolipile_base && IMG.sk_aeolipile_sphere) {
    // Heron'un Buhar Küresi: Alt kazan sabit durur, üstteki buhar küresi delik merkezi (0,0) etrafında fırıl fırıl döner!
    const b = fitBox(im, size);
    const offY = 0.155 * b.h;
    ctx.drawImage(IMG.sk_aeolipile_base, -b.w / 2, -b.h / 2 + offY, b.w, b.h);
    ctx.save();
    ctx.rotate((p.rot || 0) + (p.ang || 0));
    ctx.drawImage(IMG.sk_aeolipile_sphere, -b.w / 2, -b.h / 2 + offY, b.w, b.h);
    ctx.restore();
  } else {
    ctx.rotate((p.rot || 0) + (p.ang || 0));
    if (def.proc === "rope") drawRopeCoilSketch(size);
    else if (def.proc) drawPistonSketch(size, p.push || 0);
    else if (im) {
      const b = fitBox(im, size);
      ctx.drawImage(im, -b.w / 2, -b.h / 2, b.w, b.h);
    } else {
      drawFallbackSketch(p.type, size);
    }
  }
  // Aletin tam orta noktasında (merkezinde) panodaki kara delikle eşleşen siyah montaj pim yuvası (⚫)
  ctx.save();
  ctx.fillStyle = "rgba(28, 14, 4, 0.85)";
  ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#f2dfc0";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  ctx.restore();

  if (p.pushOn) p.push = 0.5 + 0.5 * Math.sin(globalT * 6.5);
}

function drawPenFor(p) {
  if (p.drawT >= 1) return;
  const b = partBox(p.type, p.size);
  const x = p.x - b.w / 2 + p.drawT * b.w + Math.sin(p.drawT * 40) * 8;
  const y = p.y + Math.sin(p.drawT * 31) * b.h * 0.28;
  drawPen(x, y);
  if (Math.random() < 0.5) spark(x, y, false);
}

function drawPen(x, y) {
  const im = IMG.pen;
  ctx.save();
  if (im) {
    const h = 195, w = h * im.width / im.height;
    ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 10; ctx.shadowOffsetX = 8; ctx.shadowOffsetY = 12;
    ctx.drawImage(im, x - w * 0.04, y - h * 0.96, w, h);
  }
  ctx.restore();
}

function drawPistonSketch(size, push) {
  const w = size * 0.8, h = size * 0.3, x = -w / 2;
  ctx.strokeStyle = INK; ctx.lineWidth = 3; roundRect(x, -h / 2, w * 0.6, h, 10); ctx.stroke();
  const rx = x + w * 0.6, rl = w * 0.25 + push * size * 0.18;
  ctx.lineWidth = 2.5; ctx.strokeRect(rx, -h / 5, rl, h * 0.4); ctx.strokeRect(rx + rl, -h / 1.6, size * 0.1, h * 1.25);
}
function drawRopeCoilSketch(size) {
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const r0 = size * 0.16, r1 = size * 0.36;
  // Sarılı kenevir halat kangalı halkaları
  for (let r = r0; r <= r1; r += (r1 - r0) / 3.2) {
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    // Halat burgu çentikleri
    ctx.lineWidth = 1.4;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * (r - 3), Math.sin(a) * (r - 3));
      ctx.lineTo(Math.cos(a + 0.18) * (r + 3), Math.sin(a + 0.18) * (r + 3));
      ctx.stroke();
    }
  }
  // Sağ alttan sarkan demir kancalı halat ucu
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(r1 * 0.7, r1 * 0.7);
  ctx.quadraticCurveTo(r1 * 1.05, r1 * 1.0, r1 * 0.75, r1 * 1.28);
  ctx.stroke();
  ctx.restore();
}
function gearPath(r, teeth) {
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const a = i / (teeth * 2) * Math.PI * 2, rr = i % 2 ? r * 0.86 : r;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
}
function drawFallbackSketch(type, size) {
  const r = size * 0.42; ctx.strokeStyle = INK; ctx.lineWidth = 3;
  gearPath(r, 16); ctx.stroke();
}

// ------------------------------------------------------------ AKTÖRLER & OYUNCUNUN ÇEKTİĞİ HALAT BAĞLARI!
function resolveLiveNodePos(n) {
  if (n.slotId) {
    const sl = S.L.slots.find(s => s.id === n.slotId);
    const p = S.boardPieces.find(bp => bp.matchedSlotId === n.slotId || (sl && Math.hypot(bp.x - sl.x, bp.y - sl.y) < 65));
    if (p) {
      if (p.type === "lever") {
        const arm = -p.size * 0.42;
        const rot = p.rot || 0;
        return { x: p.x + Math.cos(rot) * arm, y: p.y + Math.sin(rot) * arm - 8 };
      }
      return { x: p.x, y: p.y };
    }
    return { x: n.x, y: n.y };
  }
  if (n.piece) {
    // Pano üzerindeki güncel parçayı bul
    const p = S.boardPieces.find(bp => bp.uid === n.piece.uid) || n.piece;
    if (n.kind === "lever") {
      const arm = p.size * 0.42 * (n.arm || -1);
      const rot = p.rot || 0;
      return { x: p.x + Math.cos(rot) * arm, y: p.y + Math.sin(rot) * arm - 8 };
    }
    return { x: p.x, y: p.y };
  }
  if (n.actorKey && S.actors[n.actorKey]) {
    const a = S.actors[n.actorKey];
    if (a.unhookedPos) return a.unhookedPos;
    if (a.kind === "ship") return { x: a.x + 42, y: a.y - 48 };
    if (a.kind === "gate") return { x: a.x + 6, y: a.y - (a.s || 225) * 0.34 };
    const offY = a.kind === "anvil" ? 30 : (a.s ? a.s * 0.38 : 24);
    return { x: a.x, y: a.y - offY };
  }
  return { x: n.x, y: n.y };
}

function drawActors() {
  for (const [k, a] of Object.entries(S.actors)) {
    if (a.hidden) continue;
    ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.ang || 0);
    if (a.kind === "stone" || a.kind === "crate") {
      const im = IMG.sk_stone, s = a.s * 1.25;
      if (im) {
        const b = fitBox(im, s);
        ctx.drawImage(im, -b.w / 2, -b.h / 2, b.w, b.h);
      }
    } else if (a.kind === "anvil" || a.kind === "ball") {
      const im = IMG.sk_anvil, sz = (a.r || 34) * 2.75;
      if (im) {
        const b = fitBox(im, sz);
        ctx.drawImage(im, -b.w / 2, -b.h / 2, b.w, b.h);
        // Eğer örs makaraya halatla bağlanan bir karşı ağırlıksa, üstüne el çizimi demir halka ekle!
        const isRopeAnvil = S.L.rope && (S.L.rope.actor === k || (S.L.rope.actors && S.L.rope.actors.includes(k)));
        if (isRopeAnvil) {
          ctx.save();
          ctx.strokeStyle = INK;
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          ctx.arc(0, -30, 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = INK;
          ctx.fillRect(-3, -22, 6, 5);
          ctx.restore();
        }
      }
    } else if (a.kind === "ship") {
      const im = IMG.sk_ship, sz = (a.s || 220);
      if (im) {
        const b = fitBox(im, sz);
        ctx.drawImage(im, -b.w / 2, -b.h / 2, b.w, b.h);
      }
    } else if (a.kind === "gate") {
      const im = IMG.sk_temple_gate, sz = (a.s || 225);
      if (im) {
        const b = fitBox(im, sz);
        ctx.drawImage(im, -b.w / 2, -b.h / 2, b.w, b.h);
      }
    }
    ctx.restore();
  }
}

// EN ÜST KATMAN: Oyuncunun çektiği tüm halat bağları ve canlı ip önizlemesi (Hiçbir resmin altında kalmaz, %100 görünür!)
function drawLiveRopeOverlay() {
  if (S.ropeLinks && S.ropeLinks.length > 0) {
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const l of S.ropeLinks) {
      const p1 = resolveLiveNodePos(l.a);
      const p2 = resolveLiveNodePos(l.b);
      for (let pass = 0; pass < 2; pass++) {
        const j = pass ? 1.2 : 0;
        ctx.globalAlpha = pass ? 0.42 : 0.96;
        ctx.beginPath();
        ctx.moveTo(p1.x + j, p1.y - j);
        ctx.lineTo(p2.x + j, p2.y - j);
        ctx.stroke();
      }
      ctx.fillStyle = INK;
      ctx.beginPath(); ctx.arc(p1.x, p1.y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(p2.x, p2.y, 6, 0, Math.PI * 2); ctx.fill();
      // İnşa modunda her halatın tam ortasında tek tıkla sadece o ipi çözen küçük parşömen (✕) düğmesi!
      if (S.mode === "build") {
        const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
        ctx.save();
        ctx.fillStyle = "rgba(245, 228, 192, 0.92)";
        ctx.strokeStyle = INK;
        ctx.lineWidth = 2.0;
        ctx.beginPath(); ctx.arc(mx, my, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(mx - 4.5, my - 4.5); ctx.lineTo(mx + 4.5, my + 4.5);
        ctx.moveTo(mx + 4.5, my - 4.5); ctx.lineTo(mx - 4.5, my + 4.5);
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  if (S.mode === "build" && (S.ropeMode || (drag && drag.source === "rope_draw"))) {
    ctx.save();
    for (const n of getRopeNodes()) {
      const isSelected = S.ropeStart && S.ropeStart.id === n.id;
      ctx.strokeStyle = isSelected ? "#d97706" : "#9c5414";
      ctx.lineWidth = isSelected ? 3.8 : 2.5;
      ctx.setLineDash(isSelected ? [] : [5, 4]);
      ctx.beginPath(); ctx.arc(n.x, n.y, 18, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.setLineDash([]);
    if (drag && drag.source === "rope_draw") {
      const p1 = drag.fromNode ? resolveLiveNodePos(drag.fromNode) : { x: drag.sx, y: drag.sy };
      ctx.strokeStyle = "#8a3b08";
      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(drag.x, drag.y);
      ctx.stroke();
    } else if (S.ropeStart) {
      const p1 = resolveLiveNodePos(S.ropeStart);
      ctx.strokeStyle = "#8a3b08";
      ctx.lineWidth = 3.5;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(pointer.x, pointer.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }
}

function drawParticles() {
  ctx.save();
  for (const p of particles) {
    const k = 1 - p.t / p.life;
    if (p.water) {
      ctx.fillStyle = `rgba(120,175,220,${k})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      continue;
    }
    if (p.steam) {
      const rr = p.r * (1 + (1 - k) * 1.35);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr);
      g.addColorStop(0, `rgba(255, 250, 240, ${k * 0.72})`);
      g.addColorStop(0.6, `rgba(235, 224, 205, ${k * 0.38})`);
      g.addColorStop(1, "rgba(220, 205, 180, 0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, 7); ctx.fill();
      continue;
    }
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const mult = p.fire ? 2.4 : 3.5;
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * mult);
    g.addColorStop(0, `hsla(${p.hue},100%,${p.fire ? 70 : 80}%,${k})`);
    g.addColorStop(1, `hsla(${p.hue},100%,45%,0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r * mult, 0, 7); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawTray() {
  if (S.mode !== "build") return;
  ctx.save();
  for (const r of trayRects()) {
    const def = PARTS[r.c.type];
    const isRopeActive = r.c.type === "rope_coil" && S.ropeMode;
    const isHintedTool = !r.c.used && hintToolTimer > 0 && r.c.type === hintToolType;
    const pulse = isHintedTool ? (0.5 + 0.5 * Math.sin(globalT * 7)) : 0;
    ctx.globalAlpha = r.c.used ? 0.28 : 1;
    // Parşömenle uyumlu kare kart (yazı yok, sadece dev eskiz şekil!)
    ctx.fillStyle = isRopeActive
      ? "rgba(255, 224, 150, 0.96)"
      : (isHintedTool ? `rgba(255, ${225 + Math.round(pulse * 22)}, 130, 0.96)` : "rgba(244, 227, 188, 0.86)");
    ctx.strokeStyle = isRopeActive ? "#b85d00" : (isHintedTool ? "#c25e00" : "#5a3a1c");
    ctx.lineWidth = isRopeActive ? 4.2 : (isHintedTool ? 3.8 + pulse * 2.0 : 2.6);
    roundRect(r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.stroke();

    // Karenin içine tam ortalanmış büyük eskiz çizimi
    ctx.save();
    ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
    const iconSz = (r.w * 0.84) * (r.c.type === "gear_s" ? 0.65 : 1);
    if (def.proc === "rope") drawRopeCoilSketch(iconSz);
    else if (def.proc) drawPistonSketch(iconSz, 0);
    else {
      const im = IMG[def.sk];
      if (im) {
        const b = fitBox(im, iconSz);
        ctx.drawImage(im, -b.w / 2, -b.h / 2, b.w, b.h);
      } else drawFallbackSketch(r.c.type, iconSz);
    }
    ctx.restore();
  }
  ctx.restore();
}

function drawDrag() {
  if (!drag || !drag.moved || !drag.type) return;
  const sz = getSizeForType(drag.type);
  ctx.save();
  ctx.globalAlpha = 0.85;
  drawSinglePart(drag.x, drag.y, { type: drag.type, size: sz, flip: drag.flip, drawT: 1 }, sz);
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, W, H);
  drawBg();
  drawDecor();
  drawHintGhosts();
  for (const p of S.boardPieces) {
    drawSinglePart(p.x, p.y, p);
  }
  drawFrontLinkages();
  drawActors();
  for (const p of S.boardPieces) {
    drawSketchFlipArrow(p);
  }
  drawBasketsFront();
  drawParticles();
  for (const p of S.boardPieces) drawPenFor(p);
  drawDrawingPad();
  drawTray();
  drawDrag();
  drawLiveRopeOverlay();
}

function loop(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  if (S) { update(dt); render(); }
  requestAnimationFrame(loop);
}

// ------------------------------------------------------------ BAŞLAT
async function boot() {
  await Promise.all(Object.entries(ASSETS).map(([k, v]) => loadOne(k, v)));
  if (REMOTE_LEVELS_URL) {
    try { const r = await fetch(REMOTE_LEVELS_URL, { cache: "no-store" }); if (r.ok) { const j = await r.json(); if (Array.isArray(j) && j.length) LEVELS = j; } } catch (e) {}
  }
  $("loading").style.display = "none";
  const q = new URLSearchParams(location.search).get("level");
  startLevel(q ? parseInt(q, 10) - 1 : loadProgress());

  const auto = new URLSearchParams(location.search).get("auto");
  if (auto) {
    for (const s of S.L.slots) {
      const card = S.tray.find(t => t.type === s.accepts && !t.used);
      if (card) card.used = true;
      mountOnPegboard({ type: s.accepts, trayK: card ? card.k : 0, flip: !!s.flip }, s.x, s.y, false);
    }
    if (auto === "2") setTimeout(() => triggerRun(), 300);
  }
  requestAnimationFrame(loop);
}
boot();
})();
