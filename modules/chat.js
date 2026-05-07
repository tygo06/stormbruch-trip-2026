import { db } from "../firebase.js";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

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

export function initChat(options) {

  getCurrentProfile = options.getCurrentProfile;
  getCurrentUser = options.currentUser;

  initMessages();
  initTyping();
  initSendMessage();
}