import {
  collection,
  onSnapshot,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { db } from "../firebase.js";

let map;
let markers = {};
let locationWatcher = null;
let locationEnabled = false;
let liveLocations = {};

let getCrew = null;
let getCurrentProfile = null;

export function initMapSystem(options) {

  getCrew = options.getCrew;
  getCurrentProfile = options.getCurrentProfile;

  initMap();

  listenToLocations();
}

function initMap() {
map = L.map("map").setView([51.35, 8.67], 13);

setTimeout(() => {
map.invalidateSize();
}, 100);

L.tileLayer(
"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
{
attribution: "Tiles © Esri"
}
).addTo(map);
}

function createAvatarIcon(avatar, name) {

  return L.divIcon({
    className: "custom-marker",
    html: avatar
      ? `<img src="${avatar}" class="map-avatar">`
      : `<div class="map-avatar-fallback">${name[0]}</div>`,
    iconSize: [40, 40]
  });
}


function getAvatarById(id) {

  const person = getCrew().find(p => p.id === id);

  return person?.avatar || "";
}

function openUserCard(id, data) {

  const existing =
    document.getElementById("userCard");

  if (existing) {
    existing.remove();
  }

const person =
  getCrew().find(p => p.id === id);

  const card =
    document.createElement("div");

  card.id = "userCard";

  card.className = "user-card";

  card.innerHTML = `
    <div class="user-card-top">
      <strong>
        📍 ${person?.name || id}
      </strong>

      <button id="closeUserCard">
        ✕
      </button>
    </div>

    <div class="user-card-content">

      <div>
        🌍 Latitude:
        ${data.lat.toFixed(5)}
      </div>

      <div>
        🧭 Longitude:
        ${data.lng.toFixed(5)}
      </div>

      <div>
        🕒 Laatste update:
        ${new Date(
          data.updatedAt
        ).toLocaleTimeString()}
      </div>

    </div>
  `;

  document.body.append(card);

  document
    .getElementById("closeUserCard")
    .onclick = () => {
      card.remove();
    };
}

function renderMapUserList(locations) {

  const list = document.getElementById("mapUserList");

  if (!list) return;

  list.innerHTML = "";

  Object.entries(locations).forEach(([id, data]) => {

    const person = getCrew().find(p => p.id === id);

    const div = document.createElement("div");

    div.className = "map-user";

    div.innerHTML = `
      <span>📍 ${person?.name || id}</span>
    `;

    div.addEventListener("click", () => {

      // smooth fly
      map.flyTo(
        [data.lat, data.lng],
        17,
        {
          duration: 1.6
        }
      );

      openUserCard(id, data);
    });

    list.append(div);
  });
}

function listenToLocations() {

  onSnapshot(collection(db, "locations"), (snapshot) => {

    if (!map) return;

    liveLocations = {};

    snapshot.forEach((docSnap) => {

      const data = docSnap.data();

      liveLocations[docSnap.id] = data;

      const avatar = getAvatarById(docSnap.id);

const person = getCrew().find(
  p => p.id === docSnap.id
);

      if (!markers[docSnap.id]) {

        markers[docSnap.id] = L.marker(
          [data.lat, data.lng],
          {
            icon: createAvatarIcon(
              avatar,
              person?.name || "?"
            )
          }
        ).addTo(map);

        markers[docSnap.id].on("click", () => {
          openUserCard(docSnap.id, data);
        });

      } else {

        markers[docSnap.id].setLatLng([
          data.lat,
          data.lng
        ]);

        markers[docSnap.id].setIcon(
          createAvatarIcon(
            avatar,
            person?.name || "?"
          )
        );
      }
    });

    renderMapUserList(liveLocations);

  });
}

function startLocationTracking() {

  if (!navigator.geolocation) return;

  if (locationWatcher) return;

  locationWatcher = navigator.geolocation.watchPosition(

    async (pos) => {

      const { latitude, longitude } = pos.coords;

      const profile = getCurrentProfile();

      if (!profile) return;

      await setDoc(
        doc(db, "locations", profile.id),
        {
          lat: latitude,
          lng: longitude,
          updatedAt: new Date().toISOString()
        }
      );

    },

    (err) => {
      console.error("location error", err);
    },

    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    }
  );
}

function stopLocationTracking() {

  if (locationWatcher !== null) {

    navigator.geolocation.clearWatch(locationWatcher);

    locationWatcher = null;
  }
}

function setLocationEnabled(enabled) {

  locationEnabled = enabled;

  localStorage.setItem(
    "locationEnabled",
    enabled
  );

  if (enabled) {
    startLocationTracking();
  } else {
    stopLocationTracking();
  }
}

export {
startLocationTracking,
stopLocationTracking,
setLocationEnabled
};