let currentLightboxIndex = 0;
let currentLightboxList = [];

export function openLightbox(
  els,
  body,
  src,
  filename,
  caption = "",
  index = 0,
  list = []
) {
  currentLightboxIndex = index;
  currentLightboxList = list;

  updateLightbox(els);

  els.lightbox.classList.remove("hidden");
  body.classList.add("no-scroll");
}

export function closeLightbox(els, body) {
  els.lightbox.classList.add("hidden");

  els.lightboxImage.removeAttribute("src");
  els.lightboxCaption.textContent = "";
  els.lightboxDownload.removeAttribute("href");

  body.classList.remove("no-scroll");
}

export function nextImage(els) {
  if (!currentLightboxList.length) return;

  currentLightboxIndex =
    (currentLightboxIndex + 1) % currentLightboxList.length;

  updateLightbox(els);
}

export function prevImage(els) {
  if (!currentLightboxList.length) return;

  currentLightboxIndex =
    (currentLightboxIndex - 1 + currentLightboxList.length)
    % currentLightboxList.length;

  updateLightbox(els);
}

function updateLightbox(els) {
  const item = currentLightboxList[currentLightboxIndex];

  if (!item) return;

  els.lightboxImage.src = item.src;
  els.lightboxCaption.textContent = item.caption || "";
  els.lightboxDownload.href = item.src;

  els.lightboxDownload.download =
    getDownloadName(item.name || "stormbruch");
}

function getDownloadName(filename) {
  const clean = filename
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9-]+/gi, "-")
    .replace(/^-|-$/g, "");

  return `${clean || "stormbruch-foto"}.jpg`;
}