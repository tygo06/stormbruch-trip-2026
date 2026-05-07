import { sameOrAfterTripStart, TRIP_START } from "./utils.js";

export function getElements() {
  return {
    body: document.body,
    preTrip: document.getElementById("preTrip"),
    tripMode: document.getElementById("tripMode"),
    banner: document.getElementById("modeBanner"),
    modeKicker: document.getElementById("modeKicker"),
    modeTitle: document.getElementById("modeTitle"),
    modeDescription: document.getElementById("modeDescription"),
    currentProfileButton: document.getElementById("currentProfileButton"),
    currentProfileAvatar: document.getElementById("currentProfileAvatar"),
    currentProfileName: document.getElementById("currentProfileName"),
    logoutButton: document.getElementById("logoutButton"),
    themeToggle: document.getElementById("themeToggle"),
    secretModeToggle: document.getElementById("secretModeToggle"),
    countdown: document.getElementById("countdown"),
    crewList: document.getElementById("crewList"),
    packForm: document.getElementById("packForm"),
    packInput: document.getElementById("packInput"),
    packList: document.getElementById("packList"),
    clearPackedButton: document.getElementById("clearPackedButton"),
    imageInput: document.getElementById("imageInput"),
    gallery: document.getElementById("gallery"),
    clearGalleryButton: document.getElementById("clearGalleryButton"),
    postForm: document.getElementById("postForm"),
    postText: document.getElementById("postText"),
    postImage: document.getElementById("postImage"),
    timeline: document.getElementById("timeline"),
    clearPostsButton: document.getElementById("clearPostsButton"),
    lightbox: document.getElementById("lightbox"),
    lightboxImage: document.getElementById("lightboxImage"),
    lightboxCaption: document.getElementById("lightboxCaption"),
    lightboxDownload: document.getElementById("lightboxDownload"),
    lightboxClose: document.getElementById("lightboxClose"),
    lightboxPrev: document.getElementById("prevBtn"),
    lightboxNext: document.getElementById("nextBtn"),
    profileModal: document.getElementById("profileModal"),
    authModal: document.getElementById("authModal"),
    authForm: document.getElementById("authForm"),
    authEmail: document.getElementById("authEmail"),
    authPassword: document.getElementById("authPassword"),
    authError: document.getElementById("authError"),
    settingsModal: document.getElementById("settingsModal")
  };
}

export function initTripMode({ els, state }) {
  function setMode(date = new Date()) {
    state.activeDate = date;
    const isTripMode = state.forcedTripMode || sameOrAfterTripStart(state.activeDate);

    els.body.classList.toggle("trip-active", isTripMode);
    els.preTrip.classList.toggle("hidden", isTripMode);
    els.tripMode.classList.toggle("hidden", !isTripMode);

    if (isTripMode) {
      els.banner.textContent = "Tripmodus geactiveerd";
      els.modeKicker.textContent = "Dagboekmodus";
      els.modeTitle.textContent = "De trip is live.";
      els.modeDescription.textContent = "Leg de domme quotes, late aankomsten, beste maaltijden en kleine momenten vast voordat alles door elkaar gaat lopen.";
    } else {
      els.banner.textContent = "Planningsmodus";
      els.modeKicker.textContent = "Voorbereiding";
      els.modeTitle.textContent = "Maak de trip klaar.";
      els.modeDescription.textContent = "Aftellen, wie er meegaan, paklijst en memevoer in een klein dashboard.";
    }

    renderCountdown(els.countdown, state.activeDate);
  }

  els.secretModeToggle.addEventListener("click", () => {
    state.forcedTripMode = !state.forcedTripMode;
    els.secretModeToggle.classList.toggle("is-active", state.forcedTripMode);
    setMode(new Date());
  });

  setMode(state.activeDate);
  const countdownTimer = window.setInterval(() => setMode(new Date()), 1000);

  return {
    setMode,
    countdownTimer
  };
}

export function renderCountdown(countdown, activeDate) {
  const diff = TRIP_START.getTime() - activeDate.getTime();
  const seconds = Math.max(0, Math.floor(diff / 1000));
  const values = [
    [Math.floor(seconds / 86400), "dagen"],
    [Math.floor((seconds % 86400) / 3600), "uur"],
    [Math.floor((seconds % 3600) / 60), "minuten"],
    [seconds % 60, "seconden"]
  ];

  countdown.innerHTML = "";
  values.forEach(([value, label]) => appendTimeBox(countdown, String(value), label));
}

function appendTimeBox(parent, value, label) {
  const box = document.createElement("div");
  box.className = "time-box";

  const inner = document.createElement("div");
  const strong = document.createElement("strong");
  const span = document.createElement("span");

  strong.textContent = value;
  span.textContent = label;
  inner.append(strong, span);
  box.append(inner);
  parent.append(box);
}

export function initTheme() {
  function updateThemeIcon() {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;

    const isDark = document.body.classList.contains("dark-mode");
    btn.textContent = isDark ? "☀" : "🌙";
  }

  function setTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);
    localStorage.setItem("theme", theme);
    updateThemeIcon();
  }

  const themeBtn = document.getElementById("themeToggle");
  setTheme(localStorage.getItem("theme") || "light");
  themeBtn?.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-mode");
    setTheme(isDark ? "light" : "dark");
  });
}

export function initPanicModal() {
  const panicBtn = document.getElementById("panicBtn");
  const panicModal = document.getElementById("panicModal");
  const panicYes = document.getElementById("panicYes");
  const panicNo = document.getElementById("panicNo");

  if (!panicBtn || !panicModal || !panicYes || !panicNo) return;

  panicBtn.addEventListener("click", () => panicModal.classList.remove("hidden"));
  panicNo.addEventListener("click", () => panicModal.classList.add("hidden"));
  panicYes.addEventListener("click", () => {
    window.location.href = "wholesome.html";
  });
  panicModal.addEventListener("click", (event) => {
    if (event.target === panicModal) {
      panicModal.classList.add("hidden");
    }
  });
}

export function initSplash() {
  window.addEventListener("load", () => {
    const splash = document.getElementById("splash");
    if (!splash) return;

    setTimeout(() => {
      splash.style.opacity = "0";
      setTimeout(() => splash.remove(), 500);
    }, 1200);
  });
}

export function initAmi() {
  const ami = document.getElementById("ami");
  const amiSpeech = document.getElementById("amiSpeech");

  if (!ami || !amiSpeech) {
    return { jump() {}, speak() {} };
  }

  let amiTimer = null;
  let idleTimeout = null;

  function jump() {
    ami.classList.add("ami-jump");
    setTimeout(() => ami.classList.remove("ami-jump"), 300);
  }

  function speak(text) {
    amiSpeech.textContent = text;
    amiSpeech.classList.remove("hidden");
    setTimeout(() => amiSpeech.classList.add("hidden"), 2000);
  }

  function walk() {
    const direction = Math.random() > 0.5 ? 1 : -1;
    ami.style.transform = `translateX(${direction * 40}px)`;
    setTimeout(() => {
      ami.style.transform = "translateX(0)";
    }, 400);
  }

  function lookAround() {
    ami.style.transform = "scaleX(-1)";
    setTimeout(() => {
      ami.style.transform = "scaleX(1)";
    }, 800);
  }

  function chaos() {
    speak("???");
    jump();
    ami.style.transform = "rotate(10deg)";
    setTimeout(() => {
      ami.style.transform = "rotate(-10deg)";
    }, 150);
    setTimeout(() => {
      ami.style.transform = "rotate(0deg)";
    }, 300);
  }

  function randomText() {
    const texts = ["hmm", "ok", "??", "waar eten", "dit is goed", "ik help"];
    return texts[Math.floor(Math.random() * texts.length)];
  }

  function idleLoop() {
    clearInterval(amiTimer);
    amiTimer = setInterval(() => {
      const rand = Math.random();

      if (rand < 0.25) jump();
      else if (rand < 0.45) speak(randomText());
      else if (rand < 0.6) walk();
      else if (rand < 0.8) lookAround();
      else chaos();
    }, 2500 + Math.random() * 2000);
  }

  ami.addEventListener("click", () => {
    const responses = ["hey", "stop", "waarom klik je", "ok prima", "ik doe niks"];
    jump();
    speak(responses[Math.floor(Math.random() * responses.length)]);
  });

  window.addEventListener("scroll", () => {
    if (Math.random() < 0.2) {
      speak("woah");
    }
  });

  document.addEventListener("mousemove", () => {
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => speak("slaap?"), 10000);
  });

  idleLoop();
  ami.classList.add("ami-idle");

  return { jump, speak };
}

export function initPostPreview(els) {
  const preview = document.getElementById("postPreview");
  const videoInput = document.getElementById("postVideo");

  els.postImage?.addEventListener("change", () => {
    if (!els.postImage.files[0] || !preview) return;
    preview.innerHTML = `<div class="preview-chip">Foto toegevoegd</div>`;
  });

  videoInput?.addEventListener("change", () => {
    if (!videoInput.files[0] || !preview) return;
    preview.innerHTML = `<div class="preview-chip">Video toegevoegd</div>`;
  });
}

export function initPasswordVisibility() {
  document.querySelectorAll(".toggle-pass").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.previousElementSibling;
      if (!input) return;

      if (input.type === "password") {
        input.type = "text";
        btn.textContent = "🙈";
      } else {
        input.type = "password";
        btn.textContent = "👁";
      }
    });
  });
}

export function initLightboxControls({ els, closeLightbox, nextImage, prevImage }) {
  els.lightboxClose.addEventListener("click", () => closeLightbox(els, document.body));
  els.lightboxPrev.addEventListener("click", () => prevImage(els));
  els.lightboxNext.addEventListener("click", () => nextImage(els));

  window.addEventListener("keydown", (event) => {
    if (els.lightbox.classList.contains("hidden")) return;

    if (event.key === "ArrowRight") nextImage(els);
    if (event.key === "ArrowLeft") prevImage(els);
    if (event.key === "Escape") closeLightbox(els, document.body);
  });
}

export function initMapSettings(setLocationEnabled) {
  const settingsBtn = document.getElementById("openMapSettings");
  const settingsPanel = document.getElementById("mapSettingsPanel");
  const toggle = document.getElementById("locationToggle");

  if (!settingsBtn || !settingsPanel || !toggle) return;

  settingsBtn.addEventListener("click", () => {
    settingsPanel.classList.toggle("hidden");
  });

  toggle.addEventListener("change", () => setLocationEnabled(toggle.checked));

  window.addEventListener("load", () => {
    const saved = localStorage.getItem("locationEnabled") === "true";
    toggle.checked = saved;
    setLocationEnabled(saved);
  });
}

export function renderStats({ galleryImages, posts, packingItems }) {
  const statsEl = document.getElementById("tripStats");
  if (!statsEl) return;

  statsEl.innerHTML = `
    <div>📸 ${galleryImages.length} foto's</div>
    <div>📝 ${posts.length} posts</div>
    <div>🎒 ${packingItems.length} items</div>
  `;
}
