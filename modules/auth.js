import { auth } from "../firebase.js";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

export function initAuth({
  els,
  crew,
  DEFAULT_CREW,
  paths,
  renderCrew,
  renderPackingList,
  renderGallery,
  setMode,
  activeDate,
  startFirestoreListeners,
  stopFirestoreListeners
}) {

  let currentUser = null;
  let currentProfileId = "";

  function getCurrentProfile() {
    return crew.find(
      (person) => person.id === currentProfileId
    ) || null;
  }

  function getProfileIdForCurrentUser() {
    if (!currentUser) return "";

    const PROFILE_BY_EMAIL = {
      "tygovonder66@gmail.com": "tygo",
      "jurjenvanakkeren@gmail.com": "jurjen",
      "nariotencate@gmail.com": "nario"
    };

    return PROFILE_BY_EMAIL[
      currentUser.email?.toLowerCase()
    ] || "";
  }

  async function handleLogin(event) {
    event.preventDefault();

    els.authError.textContent = "";

    try {
      await signInWithEmailAndPassword(
        auth,
        els.authEmail.value.trim(),
        els.authPassword.value
      );

      els.authForm.reset();

    } catch {
      els.authError.textContent =
        "Inloggen lukt niet.";
    }
  }

  async function handleAuthState(user) {
    currentUser = user;

    if (!user) {

      stopFirestoreListeners();

      currentProfileId = "";

      els.authModal.classList.remove("hidden");

      renderCrew();
      renderPackingList();
      renderGallery();

      setMode(activeDate);

      return;
    }

    currentProfileId =
      getProfileIdForCurrentUser();

    els.authModal.classList.add("hidden");

    startFirestoreListeners();
  }

  els.logoutButton.addEventListener(
    "click",
    () => signOut(auth)
  );

  els.authForm.addEventListener(
    "submit",
    handleLogin
  );

  onAuthStateChanged(auth, handleAuthState);

  return {
    getCurrentProfile: () => getCurrentProfile(),
    getCurrentUser: () => currentUser
  };
}