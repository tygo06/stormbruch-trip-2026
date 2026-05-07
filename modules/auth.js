import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const PROFILE_BY_EMAIL = {
  "tygovonder66@gmail.com": "tygo",
  "jurjenvanakkeren@gmail.com": "jurjen",
  "nariotencate@gmail.com": "nario"
};
const savePasswordBtn = document.getElementById("savePassword");


let currentUser = null;
let currentProfileId = "";

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

els.logoutButton.addEventListener("click", () => signOut(auth));
els.authForm.addEventListener("submit", handleLogin);
onAuthStateChanged(auth, handleAuthState);

const openSettingsBtn = document.getElementById("openSettings");

openSettingsBtn.addEventListener("click", () => {
  els.settingsModal.classList.remove("hidden");
});

els.settingsModal.addEventListener("click", (e) => {
  if (e.target === els.settingsModal) {
    els.settingsModal.classList.add("hidden");
  }
});