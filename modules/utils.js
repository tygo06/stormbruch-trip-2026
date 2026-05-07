import { collection } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export const TRIP_START = new Date(2026, 6, 6);

export const DEFAULT_CREW = [
  { id: "tygo", name: "Tygo", nickname: "" },
  { id: "jurjen", name: "Jurjen", nickname: "" },
  { id: "nario", name: "Nario", nickname: "" }
];

export const PROFILE_BY_EMAIL = {
  "tygovonder66@gmail.com": "tygo",
  "jurjenvanakkeren@gmail.com": "jurjen",
  "nariotencate@gmail.com": "nario"
};

export function createPaths(db) {
  return {
    packing: collection(db, "trips", "stormbruch-2026", "packing"),
    privatePacking: collection(db, "trips", "stormbruch-2026", "private-packing"),
    gallery: collection(db, "trips", "stormbruch-2026", "gallery"),
    posts: collection(db, "trips", "stormbruch-2026", "posts"),
    crew: collection(db, "trips", "stormbruch-2026", "crew")
  };
}

export function getProfileIdForUser(user) {
  if (!user) return "";
  return PROFILE_BY_EMAIL[user.email?.toLowerCase()] || "";
}

export function sameOrAfterTripStart(date) {
  const dayOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return dayOnly >= TRIP_START;
}

export function getDisplayName(person) {
  return person?.nickname || person?.name || "Onbekend";
}

export function getAuthor(crew, authorId, fallbackName = "Onbekend", fallbackAvatar = "") {
  const person = crew.find((entry) => entry.id === authorId);
  if (person) return person;

  return {
    id: authorId || "unknown",
    name: fallbackName,
    nickname: "",
    avatar: fallbackAvatar
  };
}

export function createAvatar(person, className) {
  if (person?.avatar) {
    const img = document.createElement("img");
    img.className = className;
    img.src = person.avatar;
    img.alt = person.name;
    return img;
  }

  const span = document.createElement("span");
  span.className = className;
  span.textContent = (person?.name || "?").slice(0, 1);
  return span;
}

export function emptyState(text) {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = text;
  return empty;
}

export function compressImage(file, maxSize = 900, quality = 0.72) {
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
