// ============================================================
//  BÖLÜMLER (levels) — 1 + 1 + 1 Kümülatif Öğrenme & Serbest Delikli Pano
//  Delikli Pano (Pegboard) Sınırları: X = 321..1127 (23 Sütun), Y = 282..586 (10 Satır)
//  Pano Alt Zemini (Ahşap Çerçeve): Y = 612
// ============================================================
window.LEVELS = [
  // ---------------------------------------------------------- 1
  {
    id: 1,
    era: 1,
    title: "Arşimet'in İlk Sınavı",
    task: "Doğru araçları kullanarak kayayı sepete atmak.",
    task_en: "Use the right tools to launch the stone into the basket.",
    // 1 gerçek alet (lever) + 2 şaşırtmaca alet = 3 alet
    tray: ["ramp", "lever", "pulley"],
    slots: [
      { id: "kaldirac", accepts: "lever", label: "Kaldıraç", x: 690, y: 554, size: 310, tol: 72 }
    ],
    actors: {
      crate: { kind: "stone", x: 560, y: 515, s: 68 },
      ball:  { kind: "anvil", x: 810, y: 235, r: 32 }
    },
    goal: { x: 359, y: 340 },
    decor: [
      { t: "shelf", x: 359, y: 382, w: 155 },
      { t: "basket", x: 359, y: 340 }
    ],
    steps: [
      { dur: 0.55, move: [{ a: "ball", to: [810, 485], ease: "in" }], sound: "whoosh" },
      { dur: 0.10, need: "kaldirac", rot: { kaldirac: [0, 0.25] },
        move: [{ a: "ball", to: [812, 515], ease: "out" }, { a: "crate", to: [563, 483], ease: "out" }], sound: "thud" },
      { dur: 0.85, move: [{ a: "crate", to: [359, 342], arc: 195, ease: "lin", spin: -6.283 }], sound: "whoosh" }
    ],
    secret: "💡 Biliyor muydun? Arşimet \"Bana bir dayanak noktası verin, Dünya'yı yerinden oynatayım!\" demiş. Dayanak noktası yüke ne kadar yakınsa, o kadar az kuvvetle o kadar ağır yük kaldırırsın!"
  },

  // ---------------------------------------------------------- 2
  {
    id: 2,
    era: 1,
    title: "Kuyu ve Süzülen Kaya",
    task: "Doğru araçları kullanarak kayayı fırlatıp rampadan kuyuya indirmek.",
    task_en: "Launch the stone onto the ramp and guide it into the well.",
    // 2 gerçek alet (lever, ramp) + 2 şaşırtmaca alet = 4 alet
    tray: ["pulley", "ramp", "rope_coil", "lever"],
    slots: [
      { id: "kaldirac", accepts: "lever", label: "Kaldıraç", x: 471, y: 554, size: 310, tol: 75 },
      { id: "rampa", accepts: "ramp", label: "Eğik Rampa", flip: true, x: 836, y: 554, size: 245, tol: 78 }
    ],
    actors: {
      crate: { kind: "stone", x: 341, y: 515, s: 68 },
      ball:  { kind: "anvil", x: 591, y: 235, r: 32 }
    },
    goal: { x: 1068, y: 565 },
    decor: [
      { t: "well", x: 1068, y: 565 }
    ],
    steps: [
      { dur: 0.55, move: [{ a: "ball", to: [591, 485], ease: "in" }], sound: "whoosh" },
      { dur: 0.10, need: "kaldirac", rot: { kaldirac: [0, 0.25] },
        move: [{ a: "ball", to: [593, 515], ease: "out" }, { a: "crate", to: [344, 483], ease: "out" }], sound: "thud" },
      { dur: 0.80, move: [{ a: "crate", to: [740, 492], arc: 175, ease: "lin", spin: 6.72 }], sound: "whoosh" },
      { dur: 0.70, need: "rampa", move: [{ a: "crate", to: [948, 578], ease: "in" }], sound: "slide" },
      { dur: 0.38, move: [{ a: "crate", to: [1068, 578], ease: "lin", spin: 1.13 }] },
      { dur: 0.35, move: [{ a: "crate", to: [1068, 638], ease: "in", spin: 0.8 }], hide: "crate", sound: "thud" }
    ],
    secret: "💡 Biliyor muydun? Mısırlılar piramitlerin dev taşlarını kaldırmak için uzun eğik rampalar kullandı. Rampa doğru yöne eğildiğinde yerçekimi yükü senin yerine taşır!"
  },

  // ---------------------------------------------------------- 3
  {
    id: 3,
    era: 1,
    title: "Yüksek İvme ve Karşı Sepet",
    task: "Örsü rampadan hızlandırıp kaldıraçla kayayı sepete atmak.",
    task_en: "Accelerate the anvil down the ramp to launch the stone into the basket.",
    // 2 gerçek alet (ramp, lever) + 2 şaşırtmaca alet = 4 alet
    tray: ["pulley", "lever", "rope_coil", "ramp"],
    slots: [
      { id: "rampa", accepts: "ramp", label: "Eğik Rampa", flip: false, x: 945, y: 383, size: 245, tol: 75 },
      { id: "kaldirac", accepts: "lever", label: "Kaldıraç", x: 690, y: 554, size: 310, tol: 75 }
    ],
    actors: {
      ball:  { kind: "anvil", x: 1005, y: 292, r: 32, ang: -0.45 },
      crate: { kind: "stone", x: 560, y: 515, s: 68 }
    },
    goal: { x: 359, y: 340 },
    decor: [
      { t: "shelf", x: 359, y: 382, w: 155 },
      { t: "basket", x: 359, y: 340 }
    ],
    steps: [
      { dur: 0.65, need: "rampa", move: [{ a: "ball", to: [828, 404], ease: "in" }], sound: "slide" },
      { dur: 0.25, move: [{ a: "ball", to: [810, 485], ease: "in", spin: 0.45 }] },
      { dur: 0.10, need: "kaldirac", rot: { kaldirac: [0, 0.25] },
        move: [{ a: "ball", to: [812, 515], ease: "out" }, { a: "crate", to: [563, 483], ease: "out" }], sound: "thud" },
      { dur: 0.85, move: [{ a: "crate", to: [359, 342], arc: 195, ease: "lin", spin: -6.283 }], sound: "whoosh" }
    ],
    secret: "💡 Biliyor muydun? Eğik düzlemden kayan bir cisim potansiyel enerjisini kinetik enerjiye (hıza) çevirir; kaldıraca çarptığında bu hız çok daha güçlü bir fırlatma sağlar!"
  },

  // ---------------------------------------------------------- 4
  {
    id: 4,
    era: 1,
    title: "Askıdaki Kaya ve Kuyu",
    task: "Makara ve halatla askıdaki kayayı kurtarıp kuyuya ulaştırmak.",
    task_en: "Use the pulley and rope to release the hanging stone into the well.",
    // 3 pano aleti (kaldirac, makara, rampa) + 1 Halat Bağlama Aracı (rope_coil) + 2 şaşırtmaca alet = 6 alet
    tray: ["lever", "pulley", "rope_coil", "ramp", "waterwheel", "gear_s"],
    slots: [
      { id: "kaldirac", accepts: "lever", label: "Kaldıraç", x: 507, y: 554, size: 310, tol: 75 },
      { id: "makara", accepts: "pulley", label: "Makara", x: 873, y: 215, size: 110, tol: 75 },
      { id: "rampa", accepts: "ramp", label: "Eğik Rampa", flip: true, x: 945, y: 519, size: 225, tol: 78 }
    ],
    actors: {
      ball:  { kind: "anvil", x: 387, y: 185, r: 32 },
      crate: { kind: "stone", x: 873, y: 365, s: 66 }
    },
    goal: { x: 1110, y: 565 },
    rope: { fromSlot: "kaldirac", leverArm: "left", viaSlot: "makara", needLinks: 2, r: 22, actor: "crate", homeX: 873, releaseY: 310 },
    decor: [
      { t: "well", x: 1110, y: 565 }
    ],
    steps: [
      { dur: 0.55, move: [{ a: "ball", to: [387, 485], ease: "in" }], sound: "whoosh" },
      { dur: 0.16, need: ["kaldirac", "makara"], needRope: true, rot: { kaldirac: [0, -0.25] },
        move: [{ a: "ball", to: [385, 515], ease: "out" }, { a: "crate", to: [873, 305], ease: "out" }], sound: "thud" },
      { dur: 0.28, unhook: "crate", move: [{ a: "crate", to: [873, 442], ease: "in", spin: 0.45 }], sound: "thud" },
      { dur: 0.72, need: "rampa", move: [{ a: "crate", to: [1045, 558], ease: "in" }], sound: "slide" },
      { dur: 0.35, move: [{ a: "crate", to: [1110, 558], ease: "lin", spin: 1.1 }] },
      { dur: 0.35, move: [{ a: "crate", to: [1110, 638], ease: "in", spin: 0.9 }], hide: "crate", sound: "thud" }
    ],
    secret: "💡 Biliyor muydun? Sabit makara kuvvetin yönünü değiştirir: Kaldıracın ucunu aşağı bastırdığında, makaradan geçen halat diğer uçtaki ağır yükü yukarı kaldırır!"
  },

  // ---------------------------------------------------------- 5 (ARŞİMET ÜSTAT BOSS SINAVI!)
  {
    id: 5,
    era: 1,
    isBoss: true,
    masterName: "Arşimet",
    masterYears: "M.Ö. 287 – 212 · Siraküza",
    masterWork: "🏛️ Tarihi Eser: Arşimet Pençesi (Siraküza Gemi Kaldıran Dev Palanga)",
    title: "👑 Üstat Sınavı: Arşimet Pençesi",
    task: "Arşimet Pençesi palangasını kurarak düşman gemisini havaya kaldırmak.",
    task_en: "Build the Claw of Archimedes pulley system to lift the warship.",
    // 4 pano aleti + 1 Halat Bağlama Aracı + 5 şaşırtmaca alet = 10 alet (altlı üstlü 2 sıra!)
    tray: ["ramp", "gear_s", "lever", "waterwheel", "pulley", "rope_coil", "gear_l", "pulley", "piston", "ramp"],
    slots: [
      { id: "rampa", accepts: "ramp", label: "Eğik Rampa", flip: true, x: 397, y: 383, size: 235, tol: 75 },
      { id: "kaldirac", accepts: "lever", label: "Kaldıraç", x: 617, y: 554, size: 310, tol: 75 },
      { id: "makara1", accepts: "pulley", label: "1. Makara", x: 763, y: 215, size: 110, tol: 75 },
      { id: "makara2", accepts: "pulley", label: "2. Makara", x: 982, y: 215, size: 110, tol: 75 }
    ],
    actors: {
      ball: { kind: "anvil", x: 308, y: 292, r: 34, ang: 0.45 },
      ship: { kind: "ship", x: 960, y: 540, s: 255, ang: 0 }
    },
    goal: { x: 960, y: 395 },
    rope: { fromSlot: "kaldirac", leverArm: "left", viaSlot: "makara1", viaSlot2: "makara2", needLinks: 3, r: 22, actor: "ship", homeX: 960, releaseY: 220 },
    decor: [],
    steps: [
      { dur: 0.55, need: "rampa", move: [{ a: "ball", to: [495, 404], ease: "in" }], sound: "slide" },
      { dur: 0.16, move: [{ a: "ball", to: [495, 485], ease: "in", spin: -0.45 }] },
      { dur: 0.70, need: ["kaldirac", "makara1", "makara2"], needRope: true, rot: { kaldirac: [0, -0.25] },
        move: [{ a: "ball", to: [493, 515], ease: "out" }, { a: "ship", to: [960, 395], ease: "out", spin: -0.22 }], sound: "thud" }
    ],
    secret: "M.Ö. 213 yılında Roma donanması Siraküza surlarına dayandığında, 75 yaşındaki Arşimet surların arkasına dev kaldıraçlar ve bileşik makaralar (Palanga) kurdu. 'Arşimet Pençesi' adı verilen bu mekanizma, düşman kadırgalarını burnundan yakalayıp havaya kaldırarak tarihin en büyük fizik zaferini yazdı!"
  },

  // ==========================================================
  //  2. ÜSTAT: İSKENDERİYELİ HERON (M.S. 10 – 70) — BÖLÜM 6..10
  //  Otomatik Tapınak Kapısı, Buhar Küresi (Aeolipile), Su Çarkı ve Karşı Ağırlık Deneyleri
  // ==========================================================

  // ---------------------------------------------------------- 6
  {
    id: 6,
    era: 1,
    masterKey: "sk_heron",
    masterSign: "Heron",
    masterYears: "M.S. 10 – 70",
    title: "Heron'un Tapınak Kapısı",
    task: "Su çarkı ve makaraları halatla bağlayarak tapınak kapısını açmak.",
    task_en: "Connect the waterwheel and pulleys with rope to open the temple gate.",
    // 4 pano aleti (waterwheel + 3x pulley) + 1 Halat Bağlama Aracı (rope_coil) + 3 şaşırtmaca alet = 8 alet
    tray: ["waterwheel", "pulley", "pulley", "pulley", "rope_coil", "lever", "ramp", "gear_s"],
    slots: [
      { id: "cark", accepts: "waterwheel", label: "Su Çarkı", x: 397, y: 416, size: 225, tol: 75 },
      { id: "makara1", accepts: "pulley", label: "1. Makara", x: 617, y: 215, size: 110, tol: 75 },
      { id: "makara2", accepts: "pulley", label: "2. Makara", x: 800, y: 282, size: 110, tol: 75 },
      { id: "makara3", accepts: "pulley", label: "3. Makara", x: 1018, y: 215, size: 110, tol: 75 }
    ],
    water: { x: 319, y0: 210, y1: 484 },
    actors: {
      gate: { kind: "gate", x: 1018, y: 500, s: 235 }
    },
    goal: { x: 1018, y: 385 },
    rope: { fromSlot: "cark", viaSlot: "makara1", viaSlot2: "makara3", needLinks: 4, r: 22, actor: "gate" },
    decor: [
      { t: "spout", x: 307, y: 204 },
      { t: "temple_pillars", x: 1018, y: 500, s: 235 }
    ],
    steps: [
      { dur: 0.40, water: true, need: "cark", spin: { cark: -3.2 }, sound: "water" },
      { dur: 0.90, need: ["makara1", "makara2", "makara3"], needRope: true, move: [{ a: "gate", to: [1018, 385], ease: "out" }], sound: "crank" }
    ],
    secret: "💡 Biliyor muydun? İskenderiyeli Heron tapınak kapılarını insan eli değmeden açmak için su gücüyle dönen tamburlar ve çoklu makara palangaları kullandı; halat gerildiğinde ağır bronz kapı iki taş sütunun arasından dikey olarak yükselirdi!"
  },

  // ---------------------------------------------------------- 7
  {
    id: 7,
    era: 1,
    masterKey: "sk_heron",
    masterSign: "Heron",
    masterYears: "M.S. 10 – 70",
    title: "Buhar Küresi (Aeolipile) Deneyi",
    task: "Buhar Küresi gücüyle askıdaki kayayı çekip kuyuya indirmek.",
    task_en: "Use the steam power of the Aeolipile to pull and guide the stone into the well.",
    // 4 pano aleti (aeolipile, 2x pulley, ramp) + 1 Halat Bağlama Aracı (rope_coil) + 3 şaşırtmaca alet = 8 alet
    tray: ["aeolipile", "pulley", "pulley", "ramp", "rope_coil", "waterwheel", "lever", "gear_l"],
    slots: [
      { id: "buhar", accepts: "aeolipile", label: "Buhar Küresi", x: 434, y: 416, size: 215, tol: 75 },
      { id: "makara1", accepts: "pulley", label: "1. Makara", x: 653, y: 215, size: 110, tol: 75 },
      { id: "makara2", accepts: "pulley", label: "2. Makara", x: 873, y: 215, size: 110, tol: 75 },
      { id: "rampa", accepts: "ramp", label: "Eğik Rampa", flip: true, x: 945, y: 519, size: 225, tol: 75 }
    ],
    actors: {
      crate: { kind: "stone", x: 873, y: 365, s: 66 }
    },
    goal: { x: 1110, y: 565 },
    rope: { fromSlot: "buhar", viaSlot: "makara1", viaSlot2: "makara2", needLinks: 3, r: 22, actor: "crate" },
    decor: [
      { t: "well", x: 1110, y: 565 }
    ],
    steps: [
      { dur: 0.35, need: "buhar", spin: { buhar: 5.5 }, sound: "whoosh" },
      { dur: 0.45, need: ["makara1", "makara2"], needRope: true, move: [{ a: "crate", to: [873, 305], ease: "out" }], sound: "crank" },
      { dur: 0.26, unhook: "crate", move: [{ a: "crate", to: [873, 442], ease: "in", spin: 0.45 }], sound: "thud" },
      { dur: 0.72, need: "rampa", move: [{ a: "crate", to: [1045, 558], ease: "in" }], sound: "slide" },
      { dur: 0.35, move: [{ a: "crate", to: [1110, 558], ease: "lin", spin: 1.1 }] },
      { dur: 0.35, move: [{ a: "crate", to: [1110, 638], ease: "in", spin: 0.9 }], hide: "crate", sound: "thud" }
    ],
    secret: "💡 Biliyor muydun? Heron'un M.S. 1. yüzyılda icat ettiği 'Aeolipile' (Buhar Küresi), kaynayan kazandan çıkan buharın iki ters borudan fışkırmasıyla hızla dönen tarihin ilk buhar türbinidir!"
  },

  // ---------------------------------------------------------- 8
  {
    id: 8,
    era: 1,
    masterKey: "sk_heron",
    masterSign: "Heron",
    masterYears: "M.S. 10 – 70",
    title: "Buhar Gücü ve Tapınak Kapısı",
    task: "Buhar Küresi ve üçlü makara palangasıyla tapınak kapısını kaldırmak.",
    task_en: "Lift the heavy temple gate using the Aeolipile steam sphere and triple pulleys.",
    // 4 pano aleti (aeolipile, 3x pulley) + 1 Halat Bağlama Aracı (rope_coil) + 3 şaşırtmaca alet = 8 alet
    tray: ["aeolipile", "pulley", "pulley", "pulley", "rope_coil", "waterwheel", "ramp", "lever"],
    slots: [
      { id: "buhar", accepts: "aeolipile", label: "Buhar Küresi", x: 397, y: 416, size: 215, tol: 75 },
      { id: "makara1", accepts: "pulley", label: "1. Makara", x: 580, y: 215, size: 110, tol: 75 },
      { id: "makara2", accepts: "pulley", label: "2. Makara", x: 800, y: 215, size: 110, tol: 75 },
      { id: "makara3", accepts: "pulley", label: "3. Makara", x: 1018, y: 215, size: 110, tol: 75 }
    ],
    actors: {
      gate: { kind: "gate", x: 1018, y: 500, s: 235 }
    },
    goal: { x: 1018, y: 385 },
    rope: { fromSlot: "buhar", viaSlot: "makara1", viaSlot2: "makara3", needLinks: 4, r: 22, actor: "gate" },
    decor: [
      { t: "temple_pillars", x: 1018, y: 500, s: 235 }
    ],
    steps: [
      { dur: 0.35, need: "buhar", spin: { buhar: 5.8 }, sound: "whoosh" },
      { dur: 0.90, need: ["makara1", "makara2", "makara3"], needRope: true, move: [{ a: "gate", to: [1018, 385], ease: "out" }], sound: "crank" }
    ],
    secret: "💡 Biliyor muydun? Tapınak sunağında ateş yakıldığında alt kazandaki su ısınır, buhar basıncı halat tamburunu döndürerek tapınak kapılarını kendiliğinden açardı!"
  },

  // ---------------------------------------------------------- 9
  {
    id: 9,
    era: 1,
    masterKey: "sk_heron",
    masterSign: "Heron",
    masterYears: "M.S. 10 – 70",
    title: "Su Çarkı ve Karşı Ağırlıklı Kapı",
    task: "Su çarkıyla karşı ağırlık örsünü bırakıp tapınak kapısını açmak.",
    task_en: "Release the counterweight anvil with the waterwheel to lift the temple gate.",
    // 5 pano aleti (waterwheel, 2x pulley, ramp, lever) + 1 Halat Bağlama Aracı (rope_coil) + 3 şaşırtmaca alet = 9 alet
    tray: ["waterwheel", "pulley", "pulley", "ramp", "lever", "rope_coil", "aeolipile", "gear_s", "piston"],
    slots: [
      { id: "cark", accepts: "waterwheel", label: "Su Çarkı", x: 359, y: 416, size: 225, tol: 75 },
      { id: "makara1", accepts: "pulley", label: "1. Makara", x: 506, y: 181, size: 110, tol: 75 },
      { id: "rampa", accepts: "ramp", label: "Eğik Rampa", flip: true, x: 543, y: 416, size: 215, tol: 75 },
      { id: "kaldirac", accepts: "lever", label: "Kaldıraç", x: 763, y: 554, size: 310, tol: 75 },
      { id: "makara2", accepts: "pulley", label: "2. Makara", x: 1054, y: 215, size: 110, tol: 75 }
    ],
    water: { x: 285, y0: 210, y1: 484 },
    actors: {
      ball: { kind: "anvil", x: 506, y: 310, r: 30 },
      gate: { kind: "gate", x: 1054, y: 500, s: 235 }
    },
    goal: { x: 1054, y: 385 },
    rope: { fromSlot: "cark", viaSlot: "makara1", viaSlot2: "makara2", needLinks: 3, r: 22, actor: "gate", actors: ["ball", "gate"] },
    decor: [
      { t: "spout", x: 273, y: 204 },
      { t: "temple_pillars", x: 1054, y: 500, s: 235 }
    ],
    steps: [
      { dur: 0.38, water: true, need: "cark", spin: { cark: -3.2 }, sound: "water" },
      { dur: 0.32, need: "makara1", needRope: 1, autoHookActor: "ball", move: [{ a: "ball", to: [506, 268], ease: "out" }], sound: "crank" },
      { dur: 0.22, unhook: "ball", move: [{ a: "ball", to: [506, 342], ease: "in", spin: 0.45 }], sound: "thud" },
      { dur: 0.52, need: "rampa", move: [{ a: "ball", to: [638, 428], ease: "in" }], sound: "slide" },
      { dur: 0.16, move: [{ a: "ball", to: [638, 485], ease: "in", spin: -0.45 }] },
      { dur: 0.72, need: ["kaldirac", "makara2"], needRope: 3, rot: { kaldirac: [0, -0.25] },
        move: [{ a: "ball", to: [636, 515], ease: "out" }, { a: "gate", to: [1054, 385], ease: "out" }], sound: "thud" }
    ],
    secret: "💡 Biliyor muydun? Su çarkıyla kaldırılan karşı ağırlık (örs) serbest bırakıldığında kaldıraca çarparak çok daha ağır olan tapınak kapısını tek hamlede yukarı çeker!"
  },

  // ---------------------------------------------------------- 10 (HERON ÜSTAT BOSS SINAVI!)
  {
    id: 10,
    era: 1,
    isBoss: true,
    masterKey: "sk_heron",
    masterSign: "Heron",
    masterImg: "assets/cut/sketch_heron.png",
    masterName: "İskenderiyeli Heron",
    masterYears: "M.S. 10 – 70 · İskenderiye",
    masterWork: "🏛️ Tarihi Eser: Heron'un Buhar Küresi (Aeolipile) ve Otomatik Tapınak Kapısı",
    title: "👑 Üstat Sınavı: Heron'un Büyük Tapınak Otomatı",
    task: "Buhar Küresi ve karşı ağırlık düzeneğini kurarak tapınak kapısını açmak.",
    task_en: "Build Heron's steam and counterweight automaton to open the temple gate.",
    // 5 pano aleti (aeolipile, 2x pulley, ramp, lever) + 1 Halat Bağlama Aracı + 4 şaşırtmaca alet = 10 alet (2 sıra!)
    tray: ["aeolipile", "waterwheel", "pulley", "ramp", "lever", "rope_coil", "gear_l", "piston", "pulley", "gear_s"],
    slots: [
      { id: "buhar", accepts: "aeolipile", label: "Buhar Küresi", x: 359, y: 416, size: 215, tol: 75 },
      { id: "makara1", accepts: "pulley", label: "1. Makara", x: 506, y: 181, size: 110, tol: 75 },
      { id: "rampa", accepts: "ramp", label: "Eğik Rampa", flip: true, x: 543, y: 416, size: 215, tol: 75 },
      { id: "kaldirac", accepts: "lever", label: "Kaldıraç", x: 763, y: 554, size: 310, tol: 75 },
      { id: "makara2", accepts: "pulley", label: "2. Makara", x: 1054, y: 215, size: 110, tol: 75 }
    ],
    actors: {
      ball: { kind: "anvil", x: 506, y: 310, r: 30 },
      gate: { kind: "gate", x: 1054, y: 500, s: 235 }
    },
    goal: { x: 1054, y: 385 },
    rope: { fromSlot: "buhar", viaSlot: "makara1", viaSlot2: "makara2", needLinks: 3, r: 22, actor: "gate", actors: ["ball", "gate"] },
    decor: [
      { t: "temple_pillars", x: 1054, y: 500, s: 235 }
    ],
    steps: [
      { dur: 0.35, need: "buhar", spin: { buhar: 5.8 }, sound: "whoosh" },
      { dur: 0.32, need: "makara1", needRope: 1, autoHookActor: "ball", move: [{ a: "ball", to: [506, 268], ease: "out" }], sound: "crank" },
      { dur: 0.22, unhook: "ball", move: [{ a: "ball", to: [506, 342], ease: "in", spin: 0.45 }], sound: "thud" },
      { dur: 0.52, need: "rampa", move: [{ a: "ball", to: [638, 428], ease: "in" }], sound: "slide" },
      { dur: 0.16, move: [{ a: "ball", to: [638, 485], ease: "in", spin: -0.45 }] },
      { dur: 0.72, need: ["kaldirac", "makara2"], needRope: 3, rot: { kaldirac: [0, -0.25] },
        move: [{ a: "ball", to: [636, 515], ease: "out" }, { a: "gate", to: [1054, 385], ease: "out" }], sound: "thud" }
    ],
    secret: "M.S. 1. yüzyılda İskenderiye Kütüphanesi'nin başmühendisi Heron; tarihin ilk buhar türbini olan Buhar Küresi (Aeolipile), su basıncı, makara palangaları ve karşı ağırlıklarla kendi kendine açılan tapınak kapıları inşa etti. Kurduğun bu 5 kademeli Buhar Küresi + Makara + Rampa + Kaldıraç + Tapınak Kapısı zinciri, antik dünyanın en ileri otomasyon harikasıdır!"
  }
];
