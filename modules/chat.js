import { db } from "../firebase.js";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export function initChat(options) {

  const getCurrentProfile = options.getCurrentProfile;
  const getCurrentUser = options.currentUser;

  const messagesRef = collection(db, "messages");
  const typingRef = collection(db, "typing");

  const chatMessages =
    document.getElementById("chatMessages");

  const chatForm =
    document.getElementById("chatForm");

  const chatInput =
    document.getElementById("chatInput");

  const typingIndicator =
    document.getElementById("typingIndicator");

  // ========================
  // MESSAGES
  // ========================

  onSnapshot(messagesRef, (snapshot) => {

    if (!getCurrentUser()) return;

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

      const isOwn =
        data.authorUid === getCurrentUser().uid;

      div.className =
        isOwn
          ? "message own"
          : "message other";

      const time = data.createdAt?.toDate
        ? data.createdAt.toDate()
        : new Date();

      div.innerHTML = `
        <div class="bubble">

          ${
            !isOwn
              ? `<div class="message-name">${data.authorName}</div>`
              : ""
          }

          <span class="text">
            ${data.text}
          </span>

          <small class="time">
            ${time.toLocaleTimeString()}
          </small>

        </div>
      `;

      chatMessages.appendChild(div);
    });

    chatMessages.scrollTop =
      chatMessages.scrollHeight;
  });

  // ========================
  // TYPING
  // ========================

  onSnapshot(collection(db, "typing"), (snapshot) => {

    const profile = getCurrentProfile();

    if (!profile) return;

    const typingUsers = [];

    snapshot.forEach(doc => {

      const data = doc.data();

      if (
        doc.id !== profile.id &&
        data.isTyping
      ) {
        typingUsers.push(data.name);
      }
    });

    if (typingUsers.length === 0) {
      typingIndicator.textContent = "";

    } else if (typingUsers.length === 1) {

      typingIndicator.textContent =
        `${typingUsers[0]} is typing...`;

    } else {

      typingIndicator.textContent =
        `${typingUsers.join(", ")} zijn typing...`;
    }
  });

  // ========================
  // SEND MESSAGE
  // ========================

  let typingTimeout;

  chatInput.addEventListener(
    "input",
    debounce(async () => {

      const profile = getCurrentProfile();

      if (!profile) return;

      await setDoc(doc(typingRef, profile.id), {
        isTyping: true,
        name: profile.name
      });

      clearTimeout(typingTimeout);

      typingTimeout = setTimeout(async () => {

        await setDoc(doc(typingRef, profile.id), {
          isTyping: false,
          name: profile.name
        });

      }, 3000);

    }, 500)
  );

  chatForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const text = chatInput.value.trim();

    if (!text) return;

    const profile = getCurrentProfile();

    if (!profile) return;

    await addDoc(messagesRef, {
      text,
      authorId: profile.id,
      authorUid: getCurrentUser().uid,
      authorName: profile.name,
      createdAt: serverTimestamp()
    });

    chatInput.value = "";
  });
}

function debounce(fn, delay) {

  let timeout;

  return (...args) => {

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}