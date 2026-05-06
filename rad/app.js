import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCNUQezBo6Ppxb6vq8FYGbuLObrpaFuIhE",
  authDomain: "stormbruchtrip.firebaseapp.com",
  projectId: "stormbruchtrip",
  storageBucket: "stormbruchtrip.firebasestorage.app",
  messagingSenderId: "650327927334",
  appId: "1:650327927334:web:e9e160e51028cdc40c14e7",
  measurementId: "G-82N93VPX5Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categories = [
  { name: "Drank", color: "#2dd4bf" },
  { name: "Social", color: "#6fd1c7" },
  { name: "Chaos", color: "#ff6fae" },
  { name: "Camping", color: "#ffd166" },
  { name: "Risky", color: "#8b5cf6" },
  { name: "Random", color: "#7dd3fc" }
];



const defaultPunishmentTexts = [
  "Neem 2 slokken",
  "Neem 5 slokken",
  "Ad je drankje voor 5 seconden",
  "Iedereen behalve jij drinkt",
  "Jij kiest iemand die moet drinken",
  "Doe alsof je dronken bent voor 2 minuten",
  "Praat 10 minuten met Duits accent",
  "Praat alsof je een nieuwsreporter bent",
  "Doe een dier na tot iemand het raadt",
  "Doe een NPC wandeling over de camping",
  "Ga buiten staan en schreeuw 'ICH LIEBE DEUTSCHLAND'",
  "Doe 10 squats",
  "Doe 20 jumping jacks",
  "Loop een rondje om de tent",
  "Ga 2 minuten in het gras zitten nadenken over je leven",
  "Laat je laatste 5 foto's zien",
  "Laat je meest gebruikte emoji zien",
  "Lees je laatste WhatsApp bericht hardop voor",
  "Stuur een voice memo naar je laatste contact",
  "Stuur 'ik mis je' naar iemand random",
  "Post een cursed selfie",
  "Laat iemand een caption voor jouw story bedenken",
  "Zet een rare profielfoto voor 10 minuten",
  "Bel iemand en zeg alleen 'het is gebeurd'",
  "Doe een TikTok dance",
  "Laat iemand jouw volgende drankje kiezen",
  "Je mag 1 ronde niet praten",
  "Praat alleen in vragen voor 5 minuten",
  "Je moet iedereen 'chef' noemen",
  "Je bent nu de bartender",
  "Je moet de volgende ronde serveren",
  "Jij haalt snacks",
  "Doe alsof je een camping influencer bent",
  "Vertel je meest gênante verhaal",
  "Vertel je slechtste date verhaal",
  "Vertel een geheim",
  "Truth or dare",
  "Doe alsof je beroemd bent",
  "Flirt met een boom",
  "Geef iedereen een bijnaam",
  "Maak een motivational speech",
  "Doe een freestyle rap",
  "Zing een lied alsof je in The Voice zit",
  "Doe alsof je livestreamt",
  "Doe een natuurdocumentaire voice-over",
  "Maak een pickup line voor iemand in de groep",
  "Laat iemand jouw telefoon 1 minuut gebruiken",
  "Laat iemand een bericht typen maar niet versturen",
  "Doe een runway walk",
  "Je moet nu overdreven Engels praten",
  "Doe alsof je verdwaald bent",
  "Maak een kampvuur speech",
  "Ga dramatisch naar de wc alsof het een film scène is",
  "Doe alsof je een Duitser bent die voor het eerst frikandel eet",
  "Doe een slowmotion scène",
  "Maak oogcontact met iemand voor 30 seconden",
  "Praat als robot tot je volgende beurt",
  "Gebruik alleen dierengeluiden voor 2 minuten",
  "Laat iemand jouw zoekgeschiedenis kiezen om te bekijken",
  "Noem 3 red flags van jezelf",
  "Noem je grootste green flag",
  "Je moet nu iedereen complimenten geven",
  "Doe alsof je een fitness coach bent",
  "Je bent de DJ van de avond",
  "Kies iemand die een dubbele straf krijgt",
  "Iedereen stemt wie het meest chaos is",
  "Je moet je drankje vasthouden als een wijnkenner",
  "Doe alsof je een NPC bent",
  "Ga op de grond zitten tot je volgende beurt",
  "Je moet iemand carryen in een spelletje steen papier schaar",
  "Doe alsof je in een horrorfilm zit",
  "Vertel een complottheorie alsof je erin gelooft",
  "Je moet de volgende 5 minuten fluisteren",
  "Praat alsof je net wakker bent",
  "Je bent tijdelijk camping beveiliging",
  "Doe alsof je een Duitse tourguide bent",
  "Zing alles wat je zegt voor 2 minuten",
  "Laat de groep een bijnaam voor jou kiezen",
  "Doe een fake proposal naar iemand",
  "Loop alsof je op een catwalk bent",
  "Maak een dramatische exit en kom terug",
  "Je moet iemand aankijken terwijl je drinkt",
  "Je hebt nu villain energy",
  "Iedereen geeft jou een opdracht",
  "Doe alsof je internet influencer bent",
  "Doe alsof je moeder meekijkt",
  "Praat alsof je 80 jaar oud bent",
  "Je bent nu de camping mascotte",
  "Maak een fake reclame voor bier",
  "Doe een interview met jezelf",
  "Doe alsof je een Minecraft villager bent",
  "Maak een motivational edit speech",
  "Noem je meest random aankoop ooit",
  "Laat iemand jouw Spotify kiezen",
  "Doe alsof je een celebrity bent op een rode loper",
  "Je moet de volgende straf introduceren alsof het een sportwedstrijd is",
  "Schreeuw 'LET'S GOOOO' alsof je de Champions League wint",
  "Ga 1 minuut in plank positie",
  "Doe alsof je wifi kwijt bent",
  "Iedereen mag jou een challenge geven",
  "Drink met je niet-dominante hand",
  "Je moet je volgende zin rijmend zeggen",
  "Maak een rare handshake met iemand",
  "Doe alsof je een game NPC bent die dezelfde zin herhaalt",
  "Noem je meest cursed gedachte",
  "Laat de groep jouw bijnaam bepalen voor de rest van de avond",
  "Vertel je meest genante verhaal."
];

const quotes = [
  "Geen kampvuur, wel karakterontwikkeling.",
  "Wat in Duitsland gebeurt, staat morgen alsnog in de groepsapp.",
  "Vier vrienden, nul planning, maximaal verhaal.",
  "De tent staat scheef maar de vibe staat recht.",
  "Hydrateer. Of doe alsof.",
  "Camping etiquette is optioneel na middernacht."
];

const soundHooks = [
  "airhorn.mp3 ready",
  "dramatic-boom.mp3 ready",
  "campfire-pop.mp3 ready",
  "crowd-cheer.mp3 ready"
];

const achievementsCatalog = [
  { id: "first_spin", title: "Rad ingewijd", test: (s) => s.totalSpins >= 1 },
  { id: "chaos_agent", title: "Chaos agent", test: (s) => s.categoryCounts.Chaos >= 3 },
  { id: "social_liability", title: "Social liability", test: (s) => s.categoryCounts.Social >= 3 },
  { id: "streaky", title: "Verdachte streak", test: (s) => s.currentStreak.count >= 2 },
  { id: "ten_spins", title: "Tent veteran", test: (s) => s.totalSpins >= 10 }
];

const storageKey = "camping-punishment-wheel-v1";
const defaultPlayers = ["Jurjen", "Nario", "Tygo"];

const state = loadState();
onSnapshot(doc(db, "games", "campWheel"), (snapshot) => {
  const data = snapshot.data();

  if (!data) return;

  Object.assign(state, data);

  renderAll();
});
const wheel = {
  rotation: 0,
  targetRotation: 0,
  spinning: false,
  start: 0,
  duration: 0,
  startRotation: 0
};

const canvas = document.querySelector("#wheelCanvas");
const ctx = canvas.getContext("2d");
const confettiCanvas = document.querySelector("#confettiCanvas");
const confettiCtx = confettiCanvas.getContext("2d");

const els = {
  loadingScreen: document.querySelector("#loadingScreen"),
  spinBtn: document.querySelector("#spinBtn"),
  mobileSpinBtn: document.querySelector("#mobileSpinBtn"),
  playerForm: document.querySelector("#playerForm"),
  playerName: document.querySelector("#playerName"),
  playersList: document.querySelector("#playersList"),
  randomPlayerBtn: document.querySelector("#randomPlayerBtn"),
  mobileRandomBtn: document.querySelector("#mobileRandomBtn"),
  punishmentForm: document.querySelector("#punishmentForm"),
  punishmentText: document.querySelector("#punishmentText"),
  categorySelect: document.querySelector("#categorySelect"),
  punishmentCount: document.querySelector("#punishmentCount"),
  totalSpins: document.querySelector("#totalSpins"),
  topCategory: document.querySelector("#topCategory"),
  streak: document.querySelector("#streak"),
  lossBoard: document.querySelector("#lossBoard"),
  historyList: document.querySelector("#historyList"),
  clearHistoryBtn: document.querySelector("#clearHistoryBtn"),
  achievements: document.querySelector("#achievements"),
  achievementCount: document.querySelector("#achievementCount"),
  resultModal: document.querySelector("#resultModal"),
  resultCategory: document.querySelector("#resultCategory"),
  resultPlayer: document.querySelector("#resultPlayer"),
  resultPunishment: document.querySelector("#resultPunishment"),
  closeModal: document.querySelector("#closeModal"),
  spinAgainBtn: document.querySelector("#spinAgainBtn"),
  copyResultBtn: document.querySelector("#copyResultBtn"),
  campingMode: document.querySelector("#campingMode"),
  chaosMode: document.querySelector("#chaosMode"),
  soundBtn: document.querySelector("#soundBtn"),
  panicBtn: document.querySelector("#panicBtn"),
  fullscreenBtn: document.querySelector("#fullscreenBtn"),
  quoteBtn: document.querySelector("#quoteBtn"),
  campingQuote: document.querySelector("#campingQuote"),
  toastStack: document.querySelector("#toastStack")
};

function loadState() {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
  const defaultPunishments = defaultPunishmentTexts.map((text, index) => ({
    id: createId(),
    text,
    category: categories[index % categories.length].name,
    custom: false
  }));

  const base = {
    players: defaultPlayers.map((name) => ({ id: createId(), name, losses: 0 })),
    punishments: defaultPunishments,
    totalSpins: 0,
    categoryCounts: Object.fromEntries(categories.map((cat) => [cat.name, 0])),
    history: [],
    currentStreak: { playerId: null, count: 0 },
    highlightedPlayerId: null,
    achievements: [],
    lastResult: null,
    modes: { camping: false, chaos: false }
  };

  if (!saved) return base;

  return {
    ...base,
    ...saved,
    categoryCounts: { ...base.categoryCounts, ...(saved.categoryCounts || {}) },
    modes: { ...base.modes, ...(saved.modes || {}) }
  };
}

function createId() {
  return globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function saveState() {
  await setDoc(
    doc(db, "games", "campWheel"),
    JSON.parse(JSON.stringify(state))
  );
}
function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function categoryMeta(name) {
  return categories.find((cat) => cat.name === name) || categories.at(-1);
}

function visibleSegments() {
  return state.players.length ? state.players : [{ id: "empty", name: "Voeg spelers toe", losses: 0 }];
}

function drawWheel() {
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.46;
  const players = visibleSegments();
  const slice = (Math.PI * 2) / players.length;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(wheel.rotation);

  players.forEach((player, index) => {
    const start = index * slice - Math.PI / 2;
    const end = start + slice;
    const gradient = ctx.createRadialGradient(0, 0, radius * 0.15, 0, 0, radius);
    const cat = categories[index % categories.length];
    gradient.addColorStop(0, "rgba(255,255,255,0.94)");
    gradient.addColorStop(0.18, cat.color);
    gradient.addColorStop(1, shadeColor(cat.color, -34));

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "rgba(3,20,18,0.62)";
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.save();
    ctx.rotate(start + slice / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#041412";
    ctx.font = "900 34px Inter, sans-serif";
    ctx.shadowColor = "rgba(255,255,255,0.38)";
    ctx.shadowBlur = 6;
    ctx.fillText(player.name, radius - 34, 12);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(3,20,18,0.82)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#6fd1c7";
  ctx.font = "900 28px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("CAMP", 0, -4);
  ctx.fillText("RAD", 0, 30);
  ctx.restore();
}

function shadeColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (num & 255) + amt));
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}

function spinWheel() {
  if (wheel.spinning || state.players.length === 0) {
    if (!state.players.length) toast("Voeg eerst spelers toe.");
    return;
  }

  playSpinSound();
  const players = visibleSegments();
  const winnerIndex = Math.floor(Math.random() * players.length);
  const slice = (Math.PI * 2) / players.length;
const winnerCenter =
  winnerIndex * slice +
  slice / 2 -
  Math.PI / 2;

const fullSpins =
  (state.modes.chaos ? 8 : 5) +
  Math.floor(Math.random() * 4);

const target =
  fullSpins * Math.PI * 2 -
  winnerCenter;

  wheel.spinning = true;
  wheel.start = performance.now();
  wheel.duration = state.modes.chaos ? 5200 : 4100;
  wheel.startRotation = wheel.rotation;
  wheel.targetRotation = wheel.rotation + target;
  els.spinBtn.classList.add("is-spinning");

  requestAnimationFrame((now) => animateSpin(now, players[winnerIndex]));
}

function animateSpin(now, winner) {
  const progress = Math.min((now - wheel.start) / wheel.duration, 1);
  const eased = 1 - Math.pow(1 - progress, 4);
  wheel.rotation = wheel.startRotation + (wheel.targetRotation - wheel.startRotation) * eased;
  drawWheel();

  if (progress < 1) {
    requestAnimationFrame((next) => animateSpin(next, winner));
    return;
  }

  wheel.spinning = false;
  wheel.rotation %= Math.PI * 2;
  els.spinBtn.classList.remove("is-spinning");
  finishSpin(winner);
}

function finishSpin(player) {
  const punishment = randomItem(state.punishments);
  const playerRecord = state.players.find((item) => item.id === player.id);
  if (!playerRecord) return;

  playerRecord.losses += 1;
  state.highlightedPlayerId = player.id;
  state.totalSpins += 1;
  state.categoryCounts[punishment.category] = (state.categoryCounts[punishment.category] || 0) + 1;

  if (state.currentStreak.playerId === player.id) {
    state.currentStreak.count += 1;
  } else {
    state.currentStreak = { playerId: player.id, count: 1 };
  }

  const result = {
    id: createId(),
    playerId: player.id,
    player: player.name,
    punishment: punishment.text,
    category: punishment.category,
    time: new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
  };

  state.lastResult = result;
  state.history.unshift(result);
  state.history = state.history.slice(0, 8);
  unlockAchievements();
  saveState();
  renderAll();
  openResult(result);
  launchConfetti();
}

function unlockAchievements() {
  achievementsCatalog.forEach((achievement) => {
    if (!state.achievements.includes(achievement.id) && achievement.test(state)) {
      state.achievements.push(achievement.id);
      toast(`Achievement unlocked: ${achievement.title}`);
    }
  });
}

function openResult(result) {
  els.resultCategory.textContent = result.category;
  els.resultCategory.style.color = categoryMeta(result.category).color;
  els.resultPlayer.textContent = result.player;
  els.resultPunishment.textContent = result.punishment;
  els.resultModal.showModal();
}

function renderAll() {
  renderPlayers();
  renderCategories();
  renderStats();
  renderHistory();
  renderAchievements();
  drawWheel();
  document.body.classList.toggle("camping-mode", state.modes.camping);
  els.campingMode.checked = state.modes.camping;
  els.chaosMode.checked = state.modes.chaos;
  els.punishmentCount.textContent = `${state.punishments.length}`;
}

function renderPlayers() {
  els.playersList.innerHTML = state.players.map((player) => `
    <div class="player-card ${state.highlightedPlayerId === player.id ? "active" : ""}">
      <div class="avatar">${initials(player.name)}</div>
      <div class="player-info">
        <strong>${escapeHtml(player.name)}</strong>
        <span>${player.losses} losses</span>
      </div>
      <button class="remove-btn" data-remove-player="${player.id}" aria-label="${escapeHtml(player.name)} verwijderen">×</button>
    </div>
  `).join("");
}

function renderCategories() {
  els.categorySelect.innerHTML = categories.map((cat) => `<option value="${cat.name}">${cat.name}</option>`).join("");
}

function renderStats() {
  els.totalSpins.textContent = `${state.totalSpins} spins`;
  const top = Object.entries(state.categoryCounts).sort((a, b) => b[1] - a[1])[0];
  els.topCategory.textContent = top && top[1] > 0 ? top[0] : "-";
  const streakPlayer = state.players.find((player) => player.id === state.currentStreak.playerId);
  els.streak.textContent = streakPlayer ? `${streakPlayer.name} x${state.currentStreak.count}` : "-";
  els.lossBoard.innerHTML = [...state.players]
    .sort((a, b) => b.losses - a.losses)
    .map((player) => `
      <div class="loss-row">
        <strong>${escapeHtml(player.name)}</strong>
        <span>${player.losses} verloren</span>
      </div>
    `).join("");
}

function renderHistory() {
  els.historyList.innerHTML = state.history.length
    ? state.history.map((item) => `
      <div class="history-item">
        <div>
          <strong>${escapeHtml(item.player)} • ${escapeHtml(item.category)}</strong>
          <span>${escapeHtml(item.punishment)}</span>
        </div>
        <span>${item.time}</span>
      </div>
    `).join("")
    : `<div class="history-item"><span>Nog geen straffen. Verdacht rustig.</span></div>`;
}

function renderAchievements() {
  const unlocked = achievementsCatalog.filter((item) => state.achievements.includes(item.id));
  els.achievementCount.textContent = `${unlocked.length}/${achievementsCatalog.length}`;
  els.achievements.innerHTML = achievementsCatalog.map((item) => {
    const isUnlocked = state.achievements.includes(item.id);
    return `
      <div class="achievement" style="opacity:${isUnlocked ? 1 : 0.48}">
        <strong>${isUnlocked ? "✓" : "?"} ${item.title}</strong>
        <span>${isUnlocked ? "unlocked" : "locked"}</span>
      </div>
    `;
  }).join("");
}

function initials(name) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char]);
}

function addPlayer(name) {
  const clean = name.trim();
  if (!clean) return;
  state.players.push({ id: createId(), name: clean, losses: 0 });
  saveState();
  renderAll();
  toast(`${clean} zit in de tent.`);
}

function addPunishment(text, category) {
  const clean = text.trim();
  if (!clean) return;
  state.punishments.push({ id: createId(), text: clean, category, custom: true });
  saveState();
  renderAll();
  toast("Nieuwe straf live op het rad.");
}

function selectRandomPlayer() {
  if (!state.players.length) return toast("Geen spelers om te kiezen.");
  const player = randomItem(state.players);
  state.highlightedPlayerId = player.id;
  saveState();
  renderPlayers();
  toast(`Random speler: ${player.name}`);
}

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  els.toastStack.append(node);
  setTimeout(() => node.remove(), 3200);
}

function playSpinSound() {
  // Hook point: swap this for real Audio objects when sound files are added.
  console.info("spin sound hook ready");
}

function triggerSoundboard() {
  toast(`Sound hook: ${randomItem(soundHooks)}`);
}

function panic() {
  const warnings = [
    "WARNING: camping security has detected suspicious vibes.",
    "ALERT: iemand zei 'nog eentje dan'.",
    "SYSTEM: tent haringen emotioneel instabiel.",
    "CRISIS: Bluetooth speaker zoekt identiteit."
  ];
  toast(randomItem(warnings));
}

function resizeConfetti() {
  confettiCanvas.width = window.innerWidth * devicePixelRatio;
  confettiCanvas.height = window.innerHeight * devicePixelRatio;
  confettiCanvas.style.width = `${window.innerWidth}px`;
  confettiCanvas.style.height = `${window.innerHeight}px`;
  confettiCtx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

function launchConfetti() {
  resizeConfetti();
  const pieces = Array.from({ length: 130 }, () => ({
    x: window.innerWidth / 2,
    y: window.innerHeight * 0.24,
    vx: (Math.random() - 0.5) * 12,
    vy: Math.random() * -8 - 3,
    size: Math.random() * 7 + 4,
    color: randomItem(["#6fd1c7", "#2dd4bf", "#ff6fae", "#ffd166", "#f4fffc"]),
    gravity: 0.25 + Math.random() * 0.1,
    rotation: Math.random() * Math.PI
  }));
  let frame = 0;

  function tick() {
    frame += 1;
    confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    pieces.forEach((piece) => {
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.vy += piece.gravity;
      piece.rotation += 0.12;
      confettiCtx.save();
      confettiCtx.translate(piece.x, piece.y);
      confettiCtx.rotate(piece.rotation);
      confettiCtx.fillStyle = piece.color;
      confettiCtx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.58);
      confettiCtx.restore();
    });

    if (frame < 170) {
      requestAnimationFrame(tick);
    } else {
      confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  tick();
}

function changeQuote() {
  els.campingQuote.textContent = randomItem(quotes);
}

els.spinBtn.addEventListener("click", spinWheel);
els.mobileSpinBtn.addEventListener("click", spinWheel);
els.spinAgainBtn.addEventListener("click", () => {
  els.resultModal.close();
  spinWheel();
});
els.closeModal.addEventListener("click", () => els.resultModal.close());
els.copyResultBtn.addEventListener("click", async () => {
  if (!state.lastResult) return;
  const text = `${state.lastResult.player}: ${state.lastResult.punishment} (${state.lastResult.category})`;
  await navigator.clipboard?.writeText(text);
  toast("Resultaat gekopieerd.");
});

els.playerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addPlayer(els.playerName.value);
  els.playerName.value = "";
});

els.playersList.addEventListener("click", (event) => {
  const id = event.target.dataset.removePlayer;
  if (!id) return;
  const removed = state.players.find((player) => player.id === id);
  state.players = state.players.filter((player) => player.id !== id);
  if (state.currentStreak.playerId === id) state.currentStreak = { playerId: null, count: 0 };
  if (state.highlightedPlayerId === id) state.highlightedPlayerId = null;
  saveState();
  renderAll();
  if (removed) toast(`${removed.name} is naar huis gestuurd.`);
});

els.punishmentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addPunishment(els.punishmentText.value, els.categorySelect.value);
  els.punishmentText.value = "";
});

els.randomPlayerBtn.addEventListener("click", selectRandomPlayer);
els.mobileRandomBtn.addEventListener("click", selectRandomPlayer);
els.clearHistoryBtn.addEventListener("click", () => {
  state.history = [];
  saveState();
  renderHistory();
});
els.campingMode.addEventListener("change", () => {
  state.modes.camping = els.campingMode.checked;
  saveState();
  renderAll();
  toast(state.modes.camping ? "Camping mode aan." : "Camping mode uit.");
});
els.chaosMode.addEventListener("change", () => {
  state.modes.chaos = els.chaosMode.checked;
  saveState();
  toast(state.modes.chaos ? "Chaos mode geladen." : "Chaos mode kalm.");
});
els.soundBtn.addEventListener("click", triggerSoundboard);
els.panicBtn.addEventListener("click", panic);
els.quoteBtn.addEventListener("click", changeQuote);
els.fullscreenBtn.addEventListener("click", async () => {
  document.body.classList.toggle("party-mode");
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen?.();
  } else {
    await document.exitFullscreen?.();
  }
});

window.addEventListener("resize", () => {
  resizeConfetti();
  drawWheel();
});

document.addEventListener("keydown", (event) => {
  if (event.target.matches("input, select, textarea")) return;
  if (event.code === "Space") {
    event.preventDefault();
    spinWheel();
  }
  if (event.key.toLowerCase() === "r") selectRandomPlayer();
  if (event.key.toLowerCase() === "p") panic();
  if (event.key.toLowerCase() === "c") {
    els.chaosMode.checked = !els.chaosMode.checked;
    els.chaosMode.dispatchEvent(new Event("change"));
  }
});

setTimeout(() => els.loadingScreen.classList.add("hide"), 950);
resizeConfetti();
changeQuote();
renderAll();
