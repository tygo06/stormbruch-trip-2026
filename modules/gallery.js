import {
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
  createAvatar,
  emptyState,
  getAuthor,
  getDisplayName
} from "./utils.js";

export function initGallery({
  els,
  paths,
  state,
  requireProfile,
  compressImage,
  openLightbox
}) {
  let selectedImages = new Set();
  let imageSelectMode = false;

  function renderGallery() {
    els.gallery.innerHTML = "";

    if (!state.galleryImages.length) {
      els.gallery.append(
        emptyState("Zet hier memes, AI beelden en chaotische previews neer.")
      );
      return;
    }

    state.galleryImages.forEach((image, index) => {
      const item = document.createElement("div");
      item.className = "gallery-item";

      const author = getAuthor(
        state.crew,
        image.authorId,
        image.authorName,
        image.authorAvatar
      );

      const img = document.createElement("img");
      img.src = image.src;
      img.alt = image.name || "Tripfoto";

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

      img.addEventListener("click", () => {
        if (imageSelectMode) return;

        const list = state.galleryImages.map((entry) => ({
          src: entry.src,
          name: entry.name,
          caption: `Geupload door ${getDisplayName(
            getAuthor(state.crew, entry.authorId, entry.authorName, entry.authorAvatar)
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
    if (!file || !file.type.startsWith("image/")) return;

    const profile = requireProfile();
    if (!profile) return;

    const src = await compressImage(file);
    await addDoc(paths.gallery, {
      name: file.name,
      src,
      authorUid: state.currentUser.uid,
      authorId: profile.id,
      authorName: profile.name,
      authorAvatar: profile.avatar || "",
      createdAt: serverTimestamp()
    });

    els.imageInput.value = "";
  }

  async function clearGallery() {
    await Promise.all(
      state.galleryImages.map((image) => deleteDoc(doc(paths.gallery, image.id)))
    );
  }

  function bindEvents() {
    els.imageInput.addEventListener("change", () => addGalleryImage(els.imageInput.files[0]));
    els.clearGalleryButton.addEventListener("click", clearGallery);

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
  }

  bindEvents();

  return {
    renderGallery
  };
}
