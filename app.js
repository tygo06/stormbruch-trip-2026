import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { loadAnalyticsChart, trackVisit } from "./modules/analytics.js";
import { initAuth } from "./modules/auth.js";
import { initChat } from "./modules/chat.js";
import { initCrew } from "./modules/crew.js";
import { initGallery } from "./modules/gallery.js";
import {
  closeLightbox,
  nextImage,
  openLightbox,
  prevImage
} from "./modules/lightbox.js";
import { initMapSystem, setLocationEnabled } from "./modules/map.js";
import { initPacking } from "./modules/packing.js";
import { initPosts } from "./modules/posts.js";
import {
  getElements,
  initAmi,
  initLightboxControls,
  initMapSettings,
  initPanicModal,
  initPasswordVisibility,
  initPostPreview,
  initSplash,
  initTheme,
  initTripMode,
  renderStats
} from "./modules/ui.js";
import {
  compressImage,
  createAvatar,
  createPaths,
  DEFAULT_CREW,
  getAuthor,
  getDisplayName,
  getProfileIdForUser
} from "./modules/utils.js";
import { loadWeather } from "./modules/weather.js";

const els = getElements();
const paths = createPaths(db);

const state = {
  activeDate: new Date(),
  currentUser: null,
  currentProfileId: "",
  forcedTripMode: false,
  crew: [...DEFAULT_CREW],
  packingItems: [],
  privatePackingItems: [],
  galleryImages: [],
  posts: [],
  getCurrentProfile() {
    return state.crew.find((person) => person.id === state.currentProfileId) || null;
  }
};

let unsubscribes = [];
let chatStarted = false;
let postsStarted = false;
let mapStarted = false;

function canEditProfile(person) {
  return Boolean(
    person &&
    state.currentUser &&
    person.id === state.currentProfileId
  );
}

function requireProfile() {
  const profile = state.getCurrentProfile();

  if (!profile) {
    els.authModal.classList.remove("hidden");
    return null;
  }

  return profile;
}

function showFirestoreError(error) {
  console.error(error);
  els.banner.textContent = "Firebase rechten checken";
}

function updateStats() {
  renderStats({
    galleryImages: state.galleryImages,
    posts: state.posts,
    packingItems: state.packingItems
  });
}

const tripMode = initTripMode({ els, state });
const ami = initAmi();

const crewFeature = initCrew({
  els,
  paths,
  state,
  canEditProfile,
  compressImage
});

const packingFeature = initPacking({
  els,
  paths,
  state,
  requireProfile,
  onStatsChange: updateStats,
  ami
});

const galleryFeature = initGallery({
  els,
  paths,
  state,
  requireProfile,
  compressImage,
  openLightbox
});

function startFirestoreListeners() {
  stopFirestoreListeners();

  unsubscribes = [
    onSnapshot(query(paths.privatePacking, orderBy("createdAt")), (snapshot) => {
      const profile = state.getCurrentProfile();
      const allPrivate = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));

      state.privatePackingItems = profile
        ? allPrivate.filter((item) => item.ownerId === profile.id)
        : [];

      packingFeature.renderPackingList();
    }, showFirestoreError),

    onSnapshot(query(paths.crew, orderBy("name")), (snapshot) => {
      const liveCrew = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));

      state.crew = DEFAULT_CREW.map((person) => {
        const match = liveCrew.find(
          (entry) => entry.id === person.id || entry.name === person.name
        );

        return match
          ? {
              ...person,
              nickname: match.nickname || "",
              avatar: match.avatar || ""
            }
          : person;
      });

      state.currentProfileId = getProfileIdForUser(state.currentUser);
      crewFeature.renderCrew();
      crewFeature.renderProfileControls();
      packingFeature.renderPackingList();
    }, showFirestoreError),

    onSnapshot(query(paths.packing, orderBy("createdAt")), (snapshot) => {
      state.packingItems = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
      packingFeature.renderPackingList();
      updateStats();
    }, showFirestoreError),

    onSnapshot(query(paths.gallery, orderBy("createdAt", "desc")), (snapshot) => {
      state.galleryImages = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
      galleryFeature.renderGallery();
      updateStats();
    }, showFirestoreError)
  ];
}

function stopFirestoreListeners() {
  unsubscribes.forEach((unsubscribe) => unsubscribe());
  unsubscribes = [];
}

function resetAuthenticatedState() {
  stopFirestoreListeners();
  state.currentProfileId = "";
  state.packingItems = [];
  state.privatePackingItems = [];
  state.galleryImages = [];
  state.posts = [];
  state.crew = [...DEFAULT_CREW];

  els.authModal.classList.remove("hidden");
  els.profileModal.classList.add("hidden");

  crewFeature.renderCrew();
  crewFeature.renderProfileControls();
  packingFeature.renderPackingList();
  galleryFeature.renderGallery();
  updateStats();
  tripMode.setMode(state.activeDate);
}

async function handleAuthState(user) {
  state.currentUser = user;

  if (!user) {
    resetAuthenticatedState();
    return;
  }

  const profileId = getProfileIdForUser(user);
  if (!profileId) {
    els.authModal.classList.remove("hidden");
    els.authError.textContent = "Dit account is niet gekoppeld aan deze trip.";
    await signOut(auth);
    return;
  }

  state.currentProfileId = profileId;
  els.authModal.classList.add("hidden");

  await crewFeature.seedCrewIfNeeded();
  await setDoc(doc(paths.crew, profileId), {
    ownerUid: user.uid,
    ownerEmail: user.email
  }, { merge: true });

  startFirestoreListeners();
  startUserModules();
}

function startUserModules() {
  if (!chatStarted) {
    initChat({
      currentUser: () => state.currentUser,
      getCurrentProfile: () => state.getCurrentProfile()
    });
    chatStarted = true;
  }

  if (!postsStarted) {
    initPosts({
      currentUser: () => state.currentUser,
      getCurrentProfile: () => state.getCurrentProfile(),
      getAuthor: (authorId, fallbackName, fallbackAvatar) =>
        getAuthor(state.crew, authorId, fallbackName, fallbackAvatar),
      getDisplayName,
      createAvatar,
      compressImage,
      requireProfile,
      openLightbox,
      els,
      paths,
      db,
      onPostsChange(posts) {
        state.posts = [...posts];
        updateStats();
      }
    });
    postsStarted = true;
  }

  if (!mapStarted) {
    initMapSystem({
      getCrew: () => state.crew,
      getCurrentProfile: () => state.getCurrentProfile()
    });
    mapStarted = true;
  }
}

els.currentProfileButton.addEventListener("click", () => {
  if (!state.currentUser) {
    els.authModal.classList.remove("hidden");
  }
});

els.profileModal.addEventListener("click", (event) => {
  if (event.target === els.profileModal) {
    els.profileModal.classList.add("hidden");
  }
});

initAuth({ els, onAuthState: handleAuthState });
initTheme();
initPanicModal();
initSplash();
initPostPreview(els);
initPasswordVisibility();
initLightboxControls({ els, closeLightbox, nextImage, prevImage });
initMapSettings(setLocationEnabled);

crewFeature.renderCrew();
crewFeature.renderProfileControls();
packingFeature.renderPackingList();
galleryFeature.renderGallery();
updateStats();

trackVisit(db).catch(console.error);
loadAnalyticsChart(db).catch(console.error);
loadWeather();
setInterval(loadWeather, 600000);
