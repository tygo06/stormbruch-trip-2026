import {auth, db } from "./firebase.js";
import { loadWeather } from "./modules/weather.js";

import {
  openLightbox,
  closeLightbox,
  nextImage,
  prevImage
} from "./modules/lightbox.js";

import {
  initMapSystem,
  startLocationTracking,
  setLocationEnabled
} from "./modules/map.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  increment 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";



const paths = {
  packing: collection(db, "trips", "stormbruch-2026", "packing"),
  privatePacking: collection(db, "trips", "stormbruch-2026", "private-packing"), // 👈 DEZE
  gallery: collection(db, "trips", "stormbruch-2026", "gallery"),
  posts: collection(db, "trips", "stormbruch-2026", "posts"),
  crew: collection(db, "trips", "stormbruch-2026", "crew")
};

const DEFAULT_CREW = [
  { id: "tygo", name: "Tygo", nickname: "" },
  { id: "jurjen", name: "Jurjen", nickname: "" },
  { id: "nario", name: "Nario", nickname: "" }
];

const PROFILE_BY_EMAIL = {
  "tygovonder66@gmail.com": "tygo",
  "jurjenvanakkeren@gmail.com": "jurjen",
  "nariotencate@gmail.com": "nario"
};

const els = {
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
  themeToggle: document.getElementById("themeToggle"), // 👈 NIEUW
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
  profileModal: document.getElementById("profileModal"),
  profileChoices: document.getElementById("profileChoices"),
  authModal: document.getElementById("authModal"),
  authForm: document.getElementById("authForm"),
  authEmail: document.getElementById("authEmail"),
  authPassword: document.getElementById("authPassword"),
  authError: document.getElementById("authError"),
  settingsModal: document.getElementById("settingsModal")

  


  
};

const openSettingsBtn = document.getElementById("openSettings");
const savePasswordBtn = document.getElementById("savePassword");

openSettingsBtn.addEventListener("click", () => {
  els.settingsModal.classList.remove("hidden");
});

els.settingsModal.addEventListener("click", (e) => {
  if (e.target === els.settingsModal) {
    els.settingsModal.classList.add("hidden");
  }
});

const TRIP_START = new Date(2026, 6, 6);

let activeDate = new Date();
let packingItems = [];
let galleryImages = [];
let posts = [];
let crew = DEFAULT_CREW;
let countdownTimer = null;
let forcedTripMode = false;
let currentUser = null;
let currentProfileId = "";
let unsubscribes = [];
let currentLightboxIndex = 0;
let currentLightboxList = [];
let packingMode = "shared"; // "shared" | "private"
let privatePackingItems = [];
let editingItem = null;
let selectedPriority = "1";
let selectedVideos = new Set();
let selectMode = false;
let selectedImages = new Set();
let imageSelectMode = false;




const selectBtn = document.getElementById("selectToggle");
const downloadBtn = document.getElementById("downloadSelected");

// DAN PAS
downloadBtn.addEventListener("click", () => {
  selectedVideos.forEach((video) => {
    const a = document.createElement("a");
    a.href = video;
    a.download = "video.mp4";
    a.click();
  });
});

function makeId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sameOrAfterTripStart(date) {
  const dayOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return dayOnly >= TRIP_START;
}

function setMode(date = new Date()) {
  activeDate = date;
  const isTripMode = forcedTripMode || sameOrAfterTripStart(activeDate);

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

  renderCountdown();
  renderPosts();
}

async function trackVisit() {
  const today = new Date().toISOString().slice(0, 10);

  const ref = doc(db, "analytics", today);

  await setDoc(ref, {
    views: increment(1)
  }, { merge: true });
}

savePasswordBtn.addEventListener("click", async () => {
  const current = document.getElementById("currentPass").value;
  const newPass = document.getElementById("newPass").value;
  const confirm = document.getElementById("confirmPass").value;
  const errorEl = document.getElementById("settingsError");

  errorEl.textContent = "";

  if (!current || !newPass || !confirm) {
    errorEl.textContent = "Vul alles in";
    return;
  }

  if (newPass !== confirm) {
    errorEl.textContent = "Nieuwe wachtwoorden komen niet overeen";
    return;
  }

  if (newPass.length < 6) {
    errorEl.textContent = "Minimaal 6 karakters";
    return;
  }

  const user = auth.currentUser;

  try {
    // 🔐 stap 1: opnieuw inloggen (veiligheid)
    const credential = EmailAuthProvider.credential(
      user.email,
      current
    );

    await reauthenticateWithCredential(user, credential);

    // 🔐 stap 2: wachtwoord veranderen
    await updatePassword(user, newPass);

    errorEl.style.color = "green";
    errorEl.textContent = "Wachtwoord gewijzigd 🔐";

    // reset inputs
    document.getElementById("currentPass").value = "";
    document.getElementById("newPass").value = "";
    document.getElementById("confirmPass").value = "";

    setTimeout(() => {
      els.settingsModal.classList.add("hidden");
      errorEl.textContent = "";
      errorEl.style.color = "";
    }, 3000);

  } catch (err) {
    console.error(err);

    if (err.code === "auth/wrong-password") {
      errorEl.textContent = "Huidig wachtwoord klopt niet";
    } else if (err.code === "auth/too-many-requests") {
      errorEl.textContent = "Te vaak geprobeerd, probeer later opnieuw";
    } else {
      errorEl.textContent = "Er ging iets mis";
    }
  }
});



function renderCountdown() {
  const diff = TRIP_START.getTime() - activeDate.getTime();

  if (diff <= 0) {
    els.countdown.innerHTML = "";
    appendTimeBox(els.countdown, "0", "dagen");
    appendTimeBox(els.countdown, "0", "uur");
    appendTimeBox(els.countdown, "0", "minuten");
    appendTimeBox(els.countdown, "0", "seconden");
    return;
  }

  const seconds = Math.floor(diff / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  els.countdown.innerHTML = "";
  appendTimeBox(els.countdown, String(days), "dagen");
  appendTimeBox(els.countdown, String(hours), "uur");
  appendTimeBox(els.countdown, String(minutes), "minuten");
  appendTimeBox(els.countdown, String(remainingSeconds), "seconden");
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

async function seedCrewIfNeeded() {
  await Promise.all(DEFAULT_CREW.map(async (person) => {
    const ref = doc(paths.crew, person.id);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) {
      await setDoc(ref, person);
    }
  }));
}



function startFirestoreListeners() {
  stopFirestoreListeners();

  onSnapshot(query(paths.privatePacking, orderBy("createdAt")), (snapshot) => {
  const allPrivate = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const profile = getCurrentProfile();
  if (!profile) return;

  privatePackingItems = allPrivate.filter(item => item.ownerId === profile.id);

  renderPackingList();
})

  unsubscribes = [
    onSnapshot(query(paths.crew, orderBy("name")), (snapshot) => {
    const liveCrew = snapshot.docs.map((crewDoc) => ({ id: crewDoc.id, ...crewDoc.data() }));
crew = DEFAULT_CREW.map((person) => {
  const match = liveCrew.find((entry) => entry.id === person.id || entry.name === person.name);

  return match ? {
    ...person,
    nickname: match.nickname || "",
    avatar: match.avatar || "", // 👈 HIER zit je key
  } : person;
});
    currentProfileId = getProfileIdForCurrentUser();
    renderCrew();
    renderProfileControls();
  }, showFirestoreError),

  

  

    onSnapshot(query(paths.packing, orderBy("createdAt")), (snapshot) => {
    packingItems = snapshot.docs.map((packingDoc) => ({ id: packingDoc.id, ...packingDoc.data() }));
    renderPackingList();
  }, showFirestoreError),

    onSnapshot(query(paths.gallery, orderBy("createdAt", "desc")), (snapshot) => {
    
    galleryImages = snapshot.docs.map((galleryDoc) => ({ id: galleryDoc.id, ...galleryDoc.data() }));
    renderGallery();
    renderStats();
  }, showFirestoreError),

    onSnapshot(query(paths.posts, orderBy("createdAt", "desc")), (snapshot) => {
    posts = snapshot.docs.map((postDoc) => ({ id: postDoc.id, ...postDoc.data() }));
    renderPosts();
    renderStats();
  }, showFirestoreError)
  ];

}


function stopFirestoreListeners() {
  unsubscribes.forEach((unsubscribe) => unsubscribe());
  unsubscribes = [];
}

function showFirestoreError(error) {
  console.error(error);
  els.banner.textContent = "Firebase rechten checken";
}

function renderCrew() {
  els.crewList.innerHTML = "";

  crew.forEach((person) => {
    const li = document.createElement("li");
    li.className = "crew-member";

    const avatarContainer = document.createElement("div");
    avatarContainer.className = "avatar-container";

    const avatarWrap = document.createElement("label");
    avatarWrap.className = "avatar-upload";
    avatarWrap.setAttribute("aria-label", `Profielfoto voor ${person.name} aanpassen`);

    const avatar = createAvatar(person, "avatar-circle large");
    const avatarInput = document.createElement("input");
    avatarInput.type = "file";
    avatarInput.accept = "image/*";
    avatarInput.disabled = !canEditProfile(person);
    avatarInput.addEventListener("change", () => updateAvatar(person.id, avatarInput.files[0]));
    avatarWrap.append(avatar, avatarInput);

    avatarContainer.append(avatarWrap);

    if (canEditProfile(person) && person.avatar) {
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "remove-avatar-btn";
      removeBtn.innerHTML = "&times;";
      removeBtn.setAttribute("aria-label", "Profielfoto verwijderen");
      removeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeAvatar(person.id);
      });
      avatarContainer.append(removeBtn);
    }

    const details = document.createElement("div");
    details.className = "crew-details";

    const name = document.createElement("span");
    name.textContent = person.name;

    const input = document.createElement("input");
    input.type = "text";
    input.value = person.nickname;
    input.placeholder = "Bijnaam invullen...";
    input.disabled = !canEditProfile(person);
    input.setAttribute("aria-label", `Bijnaam voor ${person.name}`);
    input.addEventListener("change", () => updateNickname(person.id, input.value));

    details.append(name, input);
    li.append(avatarContainer, details);
    els.crewList.append(li);
  });
}

async function updateNickname(id, nickname) {
  const person = crew.find((entry) => entry.id === id);
  if (!canEditProfile(person)) {
    return;
  }

  await setDoc(doc(paths.crew, id), { nickname }, { merge: true });
}

async function updateAvatar(id, file) {
  const person = crew.find((entry) => entry.id === id);
  if (!canEditProfile(person)) {
    return;
  }

  if (!file || !file.type.startsWith("image/")) {
    return;
  }

  const avatar = await compressImage(file, 240, 0.76);
  await setDoc(doc(paths.crew, id), { avatar }, { merge: true });
}

async function removeAvatar(id) {
  const person = crew.find((entry) => entry.id === id);
  if (!canEditProfile(person)) {
    return;
  }

  await setDoc(doc(paths.crew, id), { avatar: "" }, { merge: true });
}

function renderProfileControls() {
  const current = getCurrentProfile();

  if (current) {
    els.currentProfileAvatar.replaceChildren(createAvatar(current, "avatar-circle"));
    els.currentProfileName.textContent = current.nickname || current.name;
    els.logoutButton.classList.remove("hidden");
    els.profileModal.classList.add("hidden");
  } else {
    els.currentProfileAvatar.textContent = "?";
    els.currentProfileName.textContent = currentUser ? "Onbekend account" : "Inloggen";
    els.logoutButton.classList.toggle("hidden", !currentUser);
    els.profileModal.classList.add("hidden");
  }

  els.profileChoices.innerHTML = "";
}

function getCurrentProfile() {
  return crew.find((person) => person.id === currentProfileId) || null;
}

function getProfileIdForCurrentUser() {
  if (!currentUser) {
    return "";
  }

  return PROFILE_BY_EMAIL[currentUser.email?.toLowerCase()] || "";
}

function canEditProfile(person) {
  return Boolean(person && currentUser && person.id === getProfileIdForCurrentUser());
}

function getDisplayName(person) {
  return person.nickname || person.name || "Onbekend";
}

function getAuthor(authorId, fallbackName = "Onbekend", fallbackAvatar = "") {
  const person = crew.find((entry) => entry.id === authorId);
  if (person) {
    return person;
  }

  return {
    id: authorId || "unknown",
    name: fallbackName,
    nickname: "",
    avatar: fallbackAvatar
  };
}

function requireProfile() {
  if (!currentUser) {
    els.authModal.classList.remove("hidden");
    return null;
  }

  const profile = getCurrentProfile();
  if (profile) {
    return profile;
  }

  els.authError.textContent = "Dit account is niet gekoppeld aan Tygo, Jurjen of Nario.";
  return null;
}

function createAvatar(person, className) {
  if (person.avatar) {
    const img = document.createElement("img");
    img.className = className;
    img.src = person.avatar;
    img.alt = person.name;
    return img;
  }

  const span = document.createElement("span");
  span.className = className;
  span.textContent = person.name.slice(0, 1);
  return span;
}

function renderPackingList() {
  els.packList.innerHTML = "";

  const profile = getCurrentProfile();

  let list;

  if (packingMode === "shared") {
    list = packingItems;
  } else {
    // 🔥 combine: private + jouw shared items
    list = [
      ...privatePackingItems,
      ...packingItems.filter(item => item.authorId === profile?.id)
    ];
  }

  if (!list.length) {
    els.packList.append(
      emptyState(
        packingMode === "shared"
          ? "Nog niks op de paklijst."
          : "Je privé paklijst is leeg."
      )
    );
    return;
  }

  list.forEach((item) => {
    const li = document.createElement("li");
    li.className = item.done ? "done" : "";

    const author = getAuthor(item.authorId, item.authorName, item.authorAvatar);

    // 👇 CONTENT WRAPPER (BELANGRIJK)
    const content = document.createElement("div");
content.className = "packing-content";

// ✅ LABEL + CHECKBOX (deze miste)
const label = document.createElement("label");
label.className = "check-row";

const checkbox = document.createElement("input");
checkbox.type = "checkbox";
checkbox.checked = Boolean(item.done);
checkbox.addEventListener("change", () =>
  togglePackingItem(item.id, !item.done)
);

// ✅ jouw nieuwe text + description
const textWrap = document.createElement("div");
textWrap.className = "item-text";

const title = document.createElement("span");
title.className = "item-title";
title.textContent = item.text;

// priority
if (item.priority) {
  title.textContent =
    (item.priority === "3" ? "!!! " :
     item.priority === "2" ? "!! " :
     item.priority === "1" ? "! " : "") +
    title.textContent;
}

// description
if (item.description) {
  const desc = document.createElement("small");
  desc.className = "item-desc";
  desc.textContent = item.description;
  textWrap.append(title, desc);
} else {
  textWrap.append(title);
}

// ✅ samenvoegen
label.append(checkbox, textWrap);
content.append(label);  

    // 🔥 LABEL (alleen in private mode)
if (packingMode === "private") {
  const tag = document.createElement("small");
  tag.className = "item-tag";

  if (item.ownerId) {
    tag.textContent = "👤 privé";
  } else {
    tag.textContent = "👥 gedeeld";
  }

  content.append(tag);
}

    // 👇 ALLEEN BIJ GEZAMENLIJK tonen
    if (packingMode === "shared") {
      const addedBy = document.createElement("small");
      addedBy.className = "added-by";

      addedBy.append(
        createAvatar(author, "avatar-circle tiny"),
        document.createTextNode(`Toegevoegd door ${getDisplayName(author)}`)
      );

      content.append(addedBy);
    }

    const optionsBtn = document.createElement("button");
optionsBtn.type = "button";
optionsBtn.className = "icon-button";
optionsBtn.textContent = "⚙️";

optionsBtn.addEventListener("click", () => openItemOptions(item));

    // ❌ remove knop
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "icon-button";
    remove.textContent = "x";
    remove.addEventListener("click", () => {
      const collectionRef =
        packingMode === "shared"
          ? paths.packing
          : paths.privatePacking;

      deleteDoc(doc(collectionRef, item.id));
    });

    li.append(content, optionsBtn, remove);
    els.packList.append(li);
  });
}

async function addPackingItem(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  amiJump();
amiSpeak("hmm...");

  

  

  const profile = requireProfile();
  if (!profile) return;

  const data = {
    text: trimmed,
    done: false,
    authorUid: currentUser.uid,
    authorId: profile.id,
    authorName: profile.name,
    authorAvatar: profile.avatar || "",
    createdAt: serverTimestamp()
  };

  if (packingMode === "shared") {
    await addDoc(paths.packing, data);
  } else {
    await addDoc(paths.privatePacking, {
      ...data,
      ownerId: profile.id
    });
  }
}

async function loadAnalyticsChart() {
  const snapshot = await getDocs(collection(db, "analytics"));

  const labels = [];
  const data = [];

  snapshot.forEach(doc => {
    labels.push(doc.id); // datum
    data.push(doc.data().views || 0);
  });

  // sort op datum
  const sorted = labels
    .map((label, i) => ({ label, value: data[i] }))
    .sort((a, b) => new Date(a.label) - new Date(b.label));

const ctx = document.getElementById("analyticsChart");

if (!ctx) return;

new Chart(ctx, {
    type: "line",
    data: {
      labels: sorted.map(i => i.label),
      datasets: [{
        label: "Bezoekers",
        data: sorted.map(i => i.value),
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

loadAnalyticsChart();



async function togglePackingItem(id, done) {
  const collectionRef =
    packingMode === "shared"
      ? paths.packing
      : paths.privatePacking;

      if (done) {
  amiJump();
  amiSpeak("nice");
}

  await updateDoc(doc(collectionRef, id), { done });
}

async function clearPackedItems() {
  await Promise.all(
    packingItems
      .filter((item) => item.done)
      .map((item) => deleteDoc(doc(paths.packing, item.id)))
  );
}

function renderGallery() {
  els.gallery.innerHTML = "";

  if (!galleryImages.length) {
    els.gallery.append(
      emptyState("Zet hier memes, AI beelden en chaotische previews neer.")
    );
    return;
  }

  galleryImages.forEach((image, index) => {
    const item = document.createElement("div");
    item.className = "gallery-item";

    const author = getAuthor(
      image.authorId,
      image.authorName,
      image.authorAvatar
    );

    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.name || "Tripfoto";

    // ✅ select mode checkbox
    if (imageSelectMode) {
      const checkbox = document.createElement("input");

      checkbox.type = "checkbox";
      checkbox.className = "image-select";

      checkbox.checked = selectedImages.has(image.src);

      checkbox.onchange = () => {
        if (checkbox.checked) {
          selectedImages.add(image.src);
        } else {
          selectedImages.delete(image.src);
        }
      };

      item.appendChild(checkbox);
    }

    // ✅ lightbox
    img.addEventListener("click", () => {
      if (imageSelectMode) return;

      const list = galleryImages.map((img) => ({
        src: img.src,
        name: img.name,
        caption: `Geupload door ${getDisplayName(
          getAuthor(
            img.authorId,
            img.authorName,
            img.authorAvatar
          )
        )}`
      }));

      openLightbox(
        els,
        document.body,
        image.src,
        image.name,
        `Geupload door ${getDisplayName(author)}`,
        index,
        list
      );
    });

    const badge = document.createElement("div");
    badge.className = "gallery-author";

    badge.append(
      createAvatar(author, "avatar-circle tiny"),
      document.createTextNode(getDisplayName(author))
    );

    const remove = document.createElement("button");

    remove.type = "button";
    remove.className = "icon-button";
    remove.textContent = "x";

    remove.setAttribute("aria-label", "Foto verwijderen");

    remove.addEventListener("click", () => {
      deleteDoc(doc(paths.gallery, image.id));
    });

    item.append(img, badge, remove);

    els.gallery.append(item);
  });
}

async function addGalleryImage(file) {
  if (!file || !file.type.startsWith("image/")) {
    return;
  }

  const profile = requireProfile();
  if (!profile) {
    return;
  }

  const src = await compressImage(file);
  await addDoc(paths.gallery, {
    name: file.name,
    src,
    authorUid: currentUser.uid,
    authorId: profile.id,
    authorName: profile.name,
    authorAvatar: profile.avatar || "",
    createdAt: serverTimestamp()
  });
  els.imageInput.value = "";
}

async function createPost(text, file, videoFile) {
  const trimmed = text.trim();
  if (!trimmed && !file && !videoFile) return;

  const profile = requireProfile();
  if (!profile) return;

  const image = file ? await compressImage(file) : null;

  let video = null;

  if (videoFile) {
    video = await compressVideo(videoFile); // 👈 nieuwe functie
  }

  await addDoc(paths.posts, {
    text: trimmed,
    image,
    video,
    authorUid: currentUser.uid,
    authorId: profile.id,
    authorName: profile.name,
    authorAvatar: profile.avatar || "",
    createdAt: serverTimestamp()
  });

  els.postForm.reset();
}

function compressVideo(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function renderPosts() {
  els.timeline.innerHTML = "";

  if (!posts.length) {
    els.timeline.append(emptyState("Nog geen dagboekposts."));
    return;
  }

  posts.forEach((post) => {
    const card = document.createElement("article");
    card.className = "post-card";

    const author = getAuthor(
      post.authorId,
      post.authorName,
      post.authorAvatar
    );

    if (post.video) {
  const wrapper = document.createElement("div");
  wrapper.className = "video-wrapper";

  const placeholder = document.createElement("div");
  placeholder.className = "video-placeholder";
  placeholder.textContent = "🎥 Bekijk video";

  placeholder.onclick = () => openVideoLightbox(post.video);

  wrapper.append(placeholder);

  // ✅ SELECT MODE
  if (selectMode) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "video-select";

    checkbox.checked = selectedVideos.has(post.video);

    checkbox.onchange = () => {
      if (checkbox.checked) {
        selectedVideos.add(post.video);
      } else {
        selectedVideos.delete(post.video);
      }
    };

    wrapper.append(checkbox);
  }

  card.append(wrapper);
}

const header = document.createElement("div");
header.className = "post-header";

const name = document.createElement("span");
name.textContent = getDisplayName(author);

const meta = document.createElement("small");
meta.className = "post-meta";

// 🔥 HIER gebeurt de magie
const date = formatTimestamp(post.createdAt);
const day = getTripDayLabel(post.createdAt);

meta.textContent = `📅 ${date} • ${day}`;

header.append(
  createAvatar(author, "avatar-circle tiny"),
  name,
  meta
);
    card.append(header);

    // TEXT
    if (post.text) {
      const text = document.createElement("p");
      text.textContent = post.text;
      card.append(text);
    }

    // IMAGE
    if (post.image) {
      const image = document.createElement("img");
      image.src = post.image;
      image.className = "post-image";
      card.append(image);
    }


    els.timeline.append(card);
  });
}

async function updateItem(item, text, description, priority) {
  const collectionRef =
    packingMode === "shared"
      ? paths.packing
      : paths.privatePacking;

  await updateDoc(doc(collectionRef, item.id), {
    text,
    description,
    priority
  });
}

function openVideoLightbox(videoSrc) {
  const lightbox = document.createElement("div");
  lightbox.className = "video-lightbox";

  const video = document.createElement("video"); // 🔥 DEZE ONTBRAK

  video.src = videoSrc;
  video.controls = true;
  video.autoplay = true;
  video.playsInline = true;
  video.className = "video-lightbox-player";

  const download = document.createElement("a");
  download.href = videoSrc;
  download.download = "stormbruch-video.mp4";
  download.textContent = "⬇️ Download";
  download.className = "video-download-btn";

  const close = document.createElement("button");
  close.innerHTML = "✕";
  close.className = "video-lightbox-close";

  close.onclick = () => {
    video.pause();
    lightbox.remove();
    document.body.classList.remove("no-scroll");
  };

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      video.pause();
      lightbox.remove();
      document.body.classList.remove("no-scroll");
    }
  });

  lightbox.append(video, download, close);
  document.body.append(lightbox);
  document.body.classList.add("no-scroll");
}

selectBtn.addEventListener("click", () => {
  selectMode = !selectMode;
  selectedVideos.clear();

  downloadBtn.classList.toggle("hidden", !selectMode);

  renderPosts(); // 🔥 refresh UI
});

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const typingRef = collection(db, "typing");

let typingTimeout;

chatInput.addEventListener("input", debounce(async () => {
  const profile = getCurrentProfile();
  if (!profile) return;

  // 👇 zet typing true
  await setDoc(doc(typingRef, profile.id), {
    isTyping: true,
    name: profile.name
  });

  // reset timeout
  clearTimeout(typingTimeout);

  typingTimeout = setTimeout(async () => {
    await setDoc(doc(typingRef, profile.id), {
      isTyping: false,
      name: profile.name
    });
  }, 3000); // stopt na 1.5 sec niet typen
  
}, 500));
function debounce(fn, delay) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

const messagesRef = collection(db, "messages");

onSnapshot(messagesRef, (snapshot) => {

  if (!currentUser) return;

  chatMessages.innerHTML = "";

  const docs = snapshot.docs
    .map(doc => doc.data())
    .sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return aTime - bTime;
    });

  docs.forEach(data => {

    const div = document.createElement("div");

    const isOwn = data.authorUid === currentUser.uid;

    div.className = isOwn
      ? "message own"
      : "message other";

    const time = data.createdAt?.toDate
      ? data.createdAt.toDate()
      : new Date();

    const formattedTime = time.toLocaleTimeString();

div.innerHTML = `
  <div class="bubble">
    ${
      !div.classList.contains("own")
        ? `<div class="message-name">${data.authorName}</div>`
        : ""
    }

    <span class="text">${data.text}</span>

    <small class="time">${formattedTime}</small>
  </div>
`;
    chatMessages.appendChild(div);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;
});

  // auto scroll
  chatMessages.scrollTop = chatMessages.scrollHeight;

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  console.log("SEND CLICKED"); // 👈 debug

  const text = chatInput.value.trim();
  if (!text) return;

  const profile = getCurrentProfile();
  console.log("PROFILE:", profile); // 👈 debug

  if (!profile) return;

  try {
await addDoc(messagesRef, {
  text,
  authorId: profile.id,
  authorUid: currentUser.uid,
  authorName: profile.name,
  createdAt: serverTimestamp()
});

    console.log("MESSAGE SENT ✅");

    chatInput.value = "";
  } catch (err) {
    console.error("SEND ERROR ❌", err);
  }
});

const typingIndicator = document.getElementById("typingIndicator");

onSnapshot(collection(db, "typing"), (snapshot) => {
  const profile = getCurrentProfile();
  if (!profile) return;

  const typingUsers = [];

  snapshot.forEach(doc => {
    const data = doc.data();

    if (doc.id !== profile.id && data.isTyping) {
      typingUsers.push(data.name);
    }
  });

  if (typingUsers.length === 0) {
    typingIndicator.textContent = "";
  } else if (typingUsers.length === 1) {
    typingIndicator.textContent = `${typingUsers[0]} is typing...`;
  } else {
    typingIndicator.textContent = `${typingUsers.join(", ")} zijn typing...`;
  }
});

async function clearPosts() {
  await Promise.all(posts.map((post) => deleteDoc(doc(paths.posts, post.id))));
}

async function clearGallery() {
  await Promise.all(galleryImages.map((image) => deleteDoc(doc(paths.gallery, image.id))));
}

function compressImage(file, maxSize = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("error", reject);
    reader.addEventListener("load", () => {
      const img = new Image();
      img.addEventListener("error", reject);
      img.addEventListener("load", () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      });
      img.src = reader.result;
    });
    reader.readAsDataURL(file);
  });
}

function getTripDayLabel(createdAt) {
  const created = new Date(createdAt);
  const tripDay = new Date(created.getFullYear(), created.getMonth(), created.getDate());
  const diff = tripDay.getTime() - TRIP_START.getTime();
  const day = Math.max(1, Math.floor(diff / 86400000) + 1);
  return `Dag ${day}`;
}

function formatTimestamp(createdAt) {
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(createdAt));
}

function emptyState(text) {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = text;
  return empty;
}

function closeItemModal() {
  document.getElementById("itemModal").classList.add("hidden");
  editingItem = null;
}

function openItemOptions(item) {
  editingItem = item;

  document.getElementById("itemModal").classList.remove("hidden");

  document.getElementById("itemName").value = item.text || "";
  document.getElementById("itemDesc").value = item.description || "";

  selectedPriority = item.priority || "1";

  document.querySelectorAll(".priority-buttons button").forEach(btn => {
    btn.classList.toggle(
      "active",
      btn.dataset.value === selectedPriority
    );
  });
}

// PRIORITY BUTTONS
document.querySelectorAll(".priority-buttons button").forEach(btn => {
  btn.addEventListener("click", () => {

    selectedPriority = btn.dataset.value;

    document.querySelectorAll(".priority-buttons button").forEach(b => {
      b.classList.remove("active");
    });

    btn.classList.add("active");
  });
});

// SAVE BUTTON
document.getElementById("saveItem").addEventListener("click", async () => {

  if (!editingItem) return;

  const text = document.getElementById("itemName").value;
  const description = document.getElementById("itemDesc").value;

  await updateItem(
    editingItem,
    text,
    description,
    selectedPriority
  );

  closeItemModal();
});

// CANCEL BUTTON
document.getElementById("cancelItem").addEventListener("click", closeItemModal);

// CLICK OUTSIDE
document.getElementById("itemModal").addEventListener("click", (e) => {

  if (e.target.id === "itemModal") {
    closeItemModal();
  }
});

async function handleLogin(event) {
  event.preventDefault();
  els.authError.textContent = "";

  try {
    await signInWithEmailAndPassword(auth, els.authEmail.value.trim(), els.authPassword.value);
    els.authForm.reset();
  } catch {
    els.authError.textContent = "Inloggen lukt niet. Check je email en wachtwoord.";
  }
}

async function handleAuthState(user) {
  currentUser = user;

  if (!user) {
    stopFirestoreListeners();
    currentProfileId = "";
    packingItems = [];
    galleryImages = [];
    posts = [];
    crew = DEFAULT_CREW;

    els.authModal.classList.remove("hidden");
    els.profileModal.classList.add("hidden");

    renderCrew();
    renderProfileControls();
    renderPackingList();
    renderGallery();
    renderPosts();

    return;
  }

  const profileId = PROFILE_BY_EMAIL[user.email?.toLowerCase()];
  if (!profileId) {
    els.authModal.classList.remove("hidden");
    els.authError.textContent = "Dit account is niet gekoppeld aan deze trip.";
    await signOut(auth);
    return;
  }

  currentProfileId = profileId;
  els.authModal.classList.add("hidden");

  await seedCrewIfNeeded();

  await setDoc(doc(paths.crew, profileId), {
    ownerUid: user.uid,
    ownerEmail: user.email
  }, { merge: true });

startFirestoreListeners();

initMapSystem({
  getCrew: () => crew,
  getCurrentProfile
});

}
els.secretModeToggle.addEventListener("click", () => {
  forcedTripMode = !forcedTripMode;
  els.secretModeToggle.classList.toggle("is-active", forcedTripMode);
  setMode(new Date());
});
els.currentProfileButton.addEventListener("click", () => {
  if (!currentUser) {
    els.authModal.classList.remove("hidden");
  }
});

els.logoutButton.addEventListener("click", () => signOut(auth));
els.authForm.addEventListener("submit", handleLogin);

els.packForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await addPackingItem(els.packInput.value);
  els.packInput.value = "";
  els.packInput.focus();

  
});

els.clearPackedButton.addEventListener("click", clearPackedItems);
els.imageInput.addEventListener("change", () => addGalleryImage(els.imageInput.files[0]));
els.clearGalleryButton.addEventListener("click", clearGallery);
els.postForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const videoFile = document.getElementById("postVideo")?.files[0];

  await createPost(
    els.postText.value,
    els.postImage.files[0],
    videoFile
  );
});
els.clearPostsButton.addEventListener("click", clearPosts);
els.lightboxClose.addEventListener("click", () => {
  closeLightbox(els, document.body);
});
els.profileModal.addEventListener("click", (event) => {
  if (event.target === els.profileModal) {
    els.profileModal.classList.add("hidden");
  }
});
window.addEventListener("keydown", (event) => {
  if (!els.lightbox.classList.contains("hidden")) {

    if (event.key === "ArrowRight") {
      nextImage(els);
    }

    if (event.key === "ArrowLeft") {
      prevImage(els);
    }

    if (event.key === "Escape") {
      closeLightbox(els, document.body);
    }
  }
});

renderCrew();
renderProfileControls();
renderPackingList();
renderGallery();
renderPosts();
setMode(activeDate);
onAuthStateChanged(auth, handleAuthState);

countdownTimer = window.setInterval(() => {
  activeDate = new Date();
  setMode(activeDate);
}, 1000);

// 🌙 THEME SYSTEM (altijd onderaan laten staan)

function setTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  localStorage.setItem("theme", theme);
  updateThemeIcon();
}

function toggleTheme() {
  const isDark = document.body.classList.contains("dark-mode");
  setTheme(isDark ? "light" : "dark");
}

function updateThemeIcon() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const isDark = document.body.classList.contains("dark-mode");
  btn.textContent = isDark ? "☀️" : "🌙";
}

document.getElementById("tabShared").addEventListener("click", () => {
  packingMode = "shared";
  updatePackingTabs();
  renderPackingList();
  renderStats();
});

document.getElementById("tabPrivate").addEventListener("click", () => {
  packingMode = "private";
  updatePackingTabs();
  renderPackingList();
  renderStats();
});

function updatePackingTabs() {
  document.getElementById("tabShared").classList.toggle("active", packingMode === "shared");
  document.getElementById("tabPrivate").classList.toggle("active", packingMode === "private");
}

// safe init
let savedTheme = localStorage.getItem("theme") || "light";
setTheme(savedTheme);

// safe event listener (BELANGRIJK)
const themeBtn = document.getElementById("themeToggle");
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    toggleTheme();
  });
}
const panicBtn = document.getElementById("panicBtn");
const panicModal = document.getElementById("panicModal");
const panicYes = document.getElementById("panicYes");
const panicNo = document.getElementById("panicNo");

if (panicBtn && panicModal && panicYes && panicNo) {
  panicBtn.addEventListener("click", () => {
    panicModal.classList.remove("hidden");
  });

  panicNo.addEventListener("click", () => {
    panicModal.classList.add("hidden");
  });

  panicYes.addEventListener("click", () => {
    window.location.href = "wholesome.html";
  });

  panicModal.addEventListener("click", (e) => {
    if (e.target === panicModal) {
      panicModal.classList.add("hidden");
    }
  });
}

window.addEventListener("load", () => {
  const splash = document.getElementById("splash");

  setTimeout(() => {
    splash.style.opacity = "0";

    setTimeout(() => {
      splash.remove();
    }, 500);
  }, 1200);
});

const ami = document.getElementById("ami");
const amiSpeech = document.getElementById("amiSpeech");

let amiMood = "idle";
let amiTimer = null;

function amiJump() {
  ami.classList.add("ami-jump");
  setTimeout(() => ami.classList.remove("ami-jump"), 300);
}

function amiSpeak(text) {
  amiSpeech.textContent = text;
  amiSpeech.classList.remove("hidden");

  setTimeout(() => {
    amiSpeech.classList.add("hidden");
  }, 2000);
}

function amiIdleLoop() {
  clearInterval(amiTimer);

  amiTimer = setInterval(() => {
    const rand = Math.random();

    if (rand < 0.25) {
      amiJump();
    } else if (rand < 0.45) {
      amiSpeak(randomText());
    } else if (rand < 0.6) {
      amiWalk();
    } else if (rand < 0.8) {
      amiLookAround();
    } else {
      amiChaos();
    }

  }, 2500 + Math.random() * 2000);
}

function amiWalk() {
  const direction = Math.random() > 0.5 ? 1 : -1;
  ami.style.transform = `translateX(${direction * 40}px)`;

  setTimeout(() => {
    ami.style.transform = "translateX(0)";
  }, 400);
}

function amiLookAround() {
  ami.style.transform = "scaleX(-1)";

  setTimeout(() => {
    ami.style.transform = "scaleX(1)";
  }, 800);
}

function amiChaos() {
  amiSpeak("???");
  amiJump();

  ami.style.transform = "rotate(10deg)";
  setTimeout(() => {
    ami.style.transform = "rotate(-10deg)";
  }, 150);
  setTimeout(() => {
    ami.style.transform = "rotate(0deg)";
  }, 300);
}

ami.addEventListener("click", () => {
  amiJump();

  const responses = [
    "hey",
    "stop",
    "waarom klik je",
    "ok prima",
    "ik doe niks"
  ];

  amiSpeak(responses[Math.floor(Math.random() * responses.length)]);
});
window.addEventListener("scroll", () => {
  if (Math.random() < 0.2) {
    amiSpeak("woah");
  }
});
let idleTimeout;

document.addEventListener("mousemove", () => {
  clearTimeout(idleTimeout);

  idleTimeout = setTimeout(() => {
    amiSpeak("slaap?");
  }, 10000);
});

function randomText() {
  const texts = [
    "hmm",
    "ok",
    "??",
    "waar eten",
    "dit is goed",
    "ik help"
  ];
  return texts[Math.floor(Math.random() * texts.length)];
}
amiIdleLoop();

ami.classList.add("ami-idle");

const preview = document.getElementById("postPreview");
const videoInput = document.getElementById("postVideo");

els.postImage.addEventListener("change", () => {
  const file = els.postImage.files[0];
  if (!file) return;

  preview.innerHTML = `
    <div class="preview-chip">📸 Foto toegevoegd</div>
  `;
});


videoInput.addEventListener("change", () => {
  const file = videoInput.files[0];
  if (!file) return;

  preview.innerHTML = `
    <div class="preview-chip">🎥 Video toegevoegd</div>
  `;
});

function getChaosMessage() {
  const chaosMessages = [
    "🍺 Bier smaakt vandaag extra goed",
    "🛶 Dit is survivallen boys",
    "💀 RIP tent alvast",
    "🔥 dit wordt een legendary dag",
    "🥴 iemand gaat hier spijt van krijgen"
  ];

  return chaosMessages[Math.floor(Math.random() * chaosMessages.length)];
}

const CLIENT_ID = "221ed723cfa94892aaa7ef4066739db4";
const REDIRECT_URI = "https://duitslandtrip.netlify.app";



function getCodeFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
}

function generateRandomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map(x => chars[x % chars.length])
    .join("");
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

let player;


document.addEventListener("DOMContentLoaded", () => {

  const imageSelectBtn = document.getElementById("imageSelectToggle");
  const downloadImagesBtn = document.getElementById("downloadImages");

  if (!imageSelectBtn || !downloadImagesBtn) return;

  imageSelectBtn.addEventListener("click", () => {
    imageSelectMode = !imageSelectMode;
    selectedImages.clear();

    downloadImagesBtn.classList.toggle("hidden", !imageSelectMode);

    renderGallery();
  });

  downloadImagesBtn.addEventListener("click", () => {
    selectedImages.forEach((src, index) => {
      const a = document.createElement("a");
      a.href = src;
      a.download = `stormbruch-${index}.jpg`;
      a.click();
    });
  });

});

function renderStats() {
  const statsEl = document.getElementById("tripStats");
  if (!statsEl) return;

  statsEl.innerHTML = `
    <div>📸 ${galleryImages.length} foto's</div>
    <div>📝 ${posts.length} posts</div>
    <div>🎒 ${packingItems.length} items</div>
  `;
}

trackVisit();



const settingsBtn = document.getElementById("openMapSettings");
const settingsPanel = document.getElementById("mapSettingsPanel");
const toggle = document.getElementById("locationToggle");



// open/close panel
settingsBtn.addEventListener("click", () => {
  settingsPanel.classList.toggle("hidden");
});

// toggle change
toggle.addEventListener("change", () => {
setLocationEnabled(toggle.checked);
});

document.querySelectorAll(".toggle-pass").forEach(btn => {
  btn.addEventListener("click", () => {
    const input = btn.previousElementSibling;

    if (input.type === "password") {
      input.type = "text";
      btn.textContent = "🙈";
    } else {
      input.type = "password";
      btn.textContent = "👁️";
    }
  });
});

loadWeather();
setInterval(loadWeather, 600000);

window.addEventListener("load", () => {

  const saved =
    localStorage.getItem("locationEnabled") === "true";

  toggle.checked = saved;

  setLocationEnabled(saved);
});
