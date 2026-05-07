import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
  createAvatar,
  DEFAULT_CREW,
  getDisplayName
} from "./utils.js";

export function initCrew({
  els,
  paths,
  state,
  canEditProfile,
  compressImage
}) {
  async function seedCrewIfNeeded() {
    await Promise.all(DEFAULT_CREW.map(async (person) => {
      const ref = doc(paths.crew, person.id);
      const snapshot = await getDoc(ref);
      if (!snapshot.exists()) {
        await setDoc(ref, person);
      }
    }));
  }

  function renderProfileControls() {
    const current = state.getCurrentProfile();

    if (!current) {
      els.currentProfileAvatar.textContent = "?";
      els.currentProfileName.textContent = "Inloggen";
      return;
    }

    els.currentProfileAvatar.replaceChildren(
      createAvatar(current, "avatar-circle")
    );
    els.currentProfileName.textContent = getDisplayName(current);
  }

  function renderCrew() {
    els.crewList.innerHTML = "";

    state.crew.forEach((person) => {
      const li = document.createElement("li");
      li.className = "crew-member";

      const avatarContainer = document.createElement("div");
      avatarContainer.className = "avatar-container";

      const avatarWrap = document.createElement("label");
      avatarWrap.className = "avatar-upload";
      avatarWrap.setAttribute("aria-label", `Profielfoto voor ${person.name} aanpassen`);

      const avatarInput = document.createElement("input");
      avatarInput.type = "file";
      avatarInput.accept = "image/*";
      avatarInput.disabled = !canEditProfile(person);
      avatarInput.addEventListener("change", () => updateAvatar(person.id, avatarInput.files[0]));

      avatarWrap.append(createAvatar(person, "avatar-circle large"), avatarInput);
      avatarContainer.append(avatarWrap);

      if (canEditProfile(person) && person.avatar) {
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "remove-avatar-btn";
        removeBtn.innerHTML = "&times;";
        removeBtn.setAttribute("aria-label", "Profielfoto verwijderen");
        removeBtn.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
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
      input.value = person.nickname || "";
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
    const person = state.crew.find((entry) => entry.id === id);
    if (!canEditProfile(person)) return;

    await setDoc(doc(paths.crew, id), { nickname }, { merge: true });
  }

  async function updateAvatar(id, file) {
    const person = state.crew.find((entry) => entry.id === id);
    if (!canEditProfile(person) || !file || !file.type.startsWith("image/")) {
      return;
    }

    const avatar = await compressImage(file, 240, 0.76);
    await setDoc(doc(paths.crew, id), { avatar }, { merge: true });
  }

  async function removeAvatar(id) {
    const person = state.crew.find((entry) => entry.id === id);
    if (!canEditProfile(person)) return;

    await setDoc(doc(paths.crew, id), { avatar: "" }, { merge: true });
  }

  return {
    renderCrew,
    renderProfileControls,
    seedCrewIfNeeded
  };
}
