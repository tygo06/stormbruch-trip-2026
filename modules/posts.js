import { db } from "../firebase.js";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export function initPosts(options) {

  const els = options.els;
  const paths = options.paths;

  const getCurrentUser =
    options.currentUser;

  const getCurrentProfile =
    options.getCurrentProfile;

  const getAuthor =
    options.getAuthor;

  const getDisplayName =
    options.getDisplayName;

  const createAvatar =
    options.createAvatar;

  const compressImage =
    options.compressImage;

  const posts = [];

  let selectedVideos = new Set();
  let selectMode = false;

  const selectBtn =
    document.getElementById("selectToggle");

  const downloadBtn =
    document.getElementById("downloadSelected");

  // =========================
  // FIRESTORE
  // =========================

  onSnapshot(
    query(paths.posts, orderBy("createdAt", "desc")),

    (snapshot) => {

      posts.length = 0;

      snapshot.docs.forEach((postDoc) => {
        posts.push({
          id: postDoc.id,
          ...postDoc.data()
        });
      });

      renderPosts();
    }
  );

  // =========================
  // CREATE POST
  // =========================

  els.postForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const videoFile =
        document.getElementById("postVideo")?.files[0];

      await createPost(
        els.postText.value,
        els.postImage.files[0],
        videoFile
      );
    }
  );

  async function createPost(
    text,
    file,
    videoFile
  ) {

    const trimmed = text.trim();

    if (!trimmed && !file && !videoFile) {
      return;
    }

    const profile = getCurrentProfile();

    if (!profile) return;

    const image =
      file
        ? await compressImage(file)
        : null;

    let video = null;

    if (videoFile) {
      video = await compressVideo(videoFile);
    }

    await addDoc(paths.posts, {
      text: trimmed,
      image,
      video,
      authorUid: getCurrentUser().uid,
      authorId: profile.id,
      authorName: profile.name,
      authorAvatar: profile.avatar || "",
      createdAt: serverTimestamp()
    });

    els.postForm.reset();
  }

  // =========================
  // RENDER POSTS
  // =========================

  function renderPosts() {

    els.timeline.innerHTML = "";

    if (!posts.length) {

      els.timeline.innerHTML =
        `<div class="empty-state">
          Nog geen dagboekposts.
        </div>`;

      return;
    }

    posts.forEach((post) => {

      const card =
        document.createElement("article");

      card.className = "post-card";

      const author = getAuthor(
        post.authorId,
        post.authorName,
        post.authorAvatar
      );

      // VIDEO
      if (post.video) {

        const wrapper =
          document.createElement("div");

        wrapper.className =
          "video-wrapper";

        const placeholder =
          document.createElement("div");

        placeholder.className =
          "video-placeholder";

        placeholder.textContent =
          "🎥 Bekijk video";

        placeholder.onclick = () =>
          openVideoLightbox(post.video);

        wrapper.append(placeholder);

        // SELECT MODE

        if (selectMode) {

          const checkbox =
            document.createElement("input");

          checkbox.type = "checkbox";

          checkbox.className =
            "video-select";

          checkbox.checked =
            selectedVideos.has(post.video);

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

      // HEADER

      const header =
        document.createElement("div");

      header.className =
        "post-header";

      const name =
        document.createElement("span");

      name.textContent =
        getDisplayName(author);

      header.append(
        createAvatar(author, "avatar-circle tiny"),
        name
      );

      card.append(header);

      // TEXT

      if (post.text) {

        const text =
          document.createElement("p");

        text.textContent = post.text;

        card.append(text);
      }

      // IMAGE

      if (post.image) {

        const image =
          document.createElement("img");

        image.src = post.image;

        image.className =
          "post-image";

        card.append(image);
      }

      // REMOVE

      const remove =
        document.createElement("button");

      remove.className =
        "icon-button";

      remove.textContent = "x";

      remove.onclick = () => {
        deleteDoc(doc(paths.posts, post.id));
      };

      card.append(remove);

      els.timeline.append(card);
    });
  }

  // =========================
  // VIDEO LIGHTBOX
  // =========================

  function openVideoLightbox(videoSrc) {

    const lightbox =
      document.createElement("div");

    lightbox.className =
      "video-lightbox";

    const video =
      document.createElement("video");

    video.src = videoSrc;

    video.controls = true;
    video.autoplay = true;

    video.className =
      "video-lightbox-player";

    const close =
      document.createElement("button");

    close.innerHTML = "✕";

    close.className =
      "video-lightbox-close";

    close.onclick = () => {
      video.pause();
      lightbox.remove();
    };

    lightbox.append(video, close);

    document.body.append(lightbox);
  }

  // =========================
  // VIDEO COMPRESS
  // =========================

  function compressVideo(file) {

    return new Promise((resolve) => {

      const reader = new FileReader();

      reader.onload = () =>
        resolve(reader.result);

      reader.readAsDataURL(file);
    });
  }

  // =========================
  // SELECT MODE
  // =========================

  selectBtn.addEventListener("click", () => {

    selectMode = !selectMode;

    selectedVideos.clear();

    downloadBtn.classList.toggle(
      "hidden",
      !selectMode
    );

    renderPosts();
  });

  downloadBtn.addEventListener("click", () => {

    selectedVideos.forEach((video) => {

      const a =
        document.createElement("a");

      a.href = video;

      a.download = "video.mp4";

      a.click();
    });
  });

  // =========================
  // CLEAR POSTS
  // =========================

  els.clearPostsButton.addEventListener(
    "click",
    async () => {

      await Promise.all(
        posts.map((post) =>
          deleteDoc(doc(paths.posts, post.id))
        )
      );
    }
  );
}