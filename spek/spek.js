import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyCNUQezBo6Ppxb6vq8FYGbuLObrpaFuIhE",
  authDomain: "stormbruchtrip.firebaseapp.com",
  projectId: "stormbruchtrip",
  storageBucket: "stormbruchtrip.firebasestorage.app",
  messagingSenderId: "650327927334",
  appId: "1:650327927334:web:e9e160e51028cdc40c14e7",
  measurementId: "G-82N93VPX5Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let playerName = "unknown";
let spek = 0;
let spekPerSecond = 0;
let orbitCount = 0;
let gameLoaded = false;
let currentSkin = "default";
let ownedSkins = ["default"];

const skins = {
  default: {
  displayName: "Default",
    image: "img/skins/bacon-default.png",
    unlock: 0,
    category: "normal"

  },

  burned: {
  displayName: "Burned",
    image: "img/skins/bacon-burned.png",
    unlock: 250,
    category: "normal"
  },

  gold: {
  displayName: "Gold",
    image: "img/skins/bacon-gold.png",
    unlock: 10000,
    category: "normal"
  },
    frozen: {
    displayName: "Frozen",
    image: "img/skins/bacon-frozen.png",
    unlock: 50000,
    category: "normal"
  },
      radioactive: {
    displayName: "Radioactive",
    image: "img/skins/bacon-radioactive.png",
    unlock: 15000,
    category: "normal"

  },
        rainbow: {
    displayName: "Rainbow",
    image: "img/skins/bacon-rainbow.png",
    unlock: 50000,
    category: "normal"
  },
          lightning: {
    displayName: "Lightning",
    image: "img/skins/bacon-lightning.png",
    unlock: 125000,
      category: "normal"

  },
            diamond: {
    displayName: "Diamond",
    image: "img/skins/bacon-diamond.png",
    unlock: 350000,
    category: "normal"
  },
              galaxy: {
    displayName: "Galaxy",
    image: "img/skins/bacon-galaxy.png",
    unlock: 1000000,
    category: "normal"
  },
                nerd: {
    displayName: "Nerd",
    image: "img/skins/bacon-nerd.png",
    unlock: 500,
      category: "meme"
  },
                  sigaret: {
    displayName: "Cigarette",
    image: "img/skins/bacon-cigarette.png",
    unlock: 8000,
    category: "meme"
  },
                    dronken: {
    displayName: "Drunk",
    image: "img/skins/bacon-drunk.png",
    unlock: 20000,
    category: "meme"
  },
                      skater: {
    displayName: "Skater",
    image: "img/skins/bacon-skater.png",
    unlock: 35000,
    category: "meme"
  },
     mcdonalds: {
    displayName: "McDonalds",
    image: "img/skins/bacon-mcdonalds.png",
    unlock: 75000,
    category: "meme"
  },
    kfc: {
    displayName: "KFC",
    image: "img/skins/bacon-kfc.png",
    unlock: 90000,
    category: "meme"
  },
                            duivel: {
    displayName: "Devil",
    image: "img/skins/bacon-devil.png",
    unlock: 75000,
    category: "meme"
  },
};

const spekEl = document.getElementById("spekCount");
const spsEl = document.getElementById("sps");
const spekBtn = document.getElementById("spekBtn");
const mainBacon = document.getElementById("mainBacon");
const clickSound = new Audio("click.mp3");

clickSound.volume = 0.3;
function applySkin() {

  mainBacon.src = skins[currentSkin].image;

  document.querySelectorAll(".orbit-bacon").forEach(bacon => {
    bacon.src = skins[currentSkin].image;
  });

  document.querySelectorAll(".skin-btn").forEach(btn => {
    btn.classList.remove("active");

    if (btn.dataset.skin === currentSkin) {
      btn.classList.add("active");
    }
  });

}
function updateSkinLocks() {

  document.querySelectorAll(".skin-btn").forEach(btn => {

    const skin = btn.dataset.skin;

    const required = skins[skin].unlock;

    // gekocht
    if (ownedSkins.includes(skin)) {

      btn.classList.remove("locked");

      btn.textContent =
        skins[skin].displayName

    } else {

      btn.classList.add("locked");

      btn.textContent =
        `${skins[skin].displayName} 🔒 (${required})`;

    }

  });
}
document.addEventListener("click", async (e) => {

  const btn = e.target.closest(".skin-btn");

  if (!btn) return;

  const skin = btn.dataset.skin;

  // al gekocht
  if (ownedSkins.includes(skin)) {

    currentSkin = skin;

    applySkin();

    await saveToLeaderboard();

    return;
  }

  const price = skins[skin].unlock;

  // niet genoeg spek
  if (spek < price) {

    showAlert(
      "🔒 Niet genoeg spek",
      `Nog ${price - spek} spek nodig`
    );

    return;
  }

  // kopen
  spek -= price;

  ownedSkins.push(skin);

  currentSkin = skin;

  updateUI();
  applySkin();

  showAlert(
    "🔥 Skin gekocht",
    `${skins[skin].displayName} unlocked`
  );

  await saveToLeaderboard();

});
function renderSkins() {

  const normalContainer =
    document.getElementById("normalSkins");

  const memeContainer =
    document.getElementById("memeSkins");

  normalContainer.innerHTML = "";
  memeContainer.innerHTML = "";

  Object.entries(skins).forEach(([key, skin]) => {

    const btn = document.createElement("button");

    btn.className = "skin-btn";
    btn.dataset.skin = key;

    btn.innerHTML = `
      <img src="${skin.image}">
      <span>${skin.displayName}</span>
    `;

    if (skin.category === "meme") {
      memeContainer.appendChild(btn);
    } else {
      normalContainer.appendChild(btn);
    }

  });

}

function showAlert(title, text) {

  const alert = document.getElementById("customAlert");

  document.getElementById("alertTitle").textContent = title;
  document.getElementById("alertText").textContent = text;

  alert.classList.add("active");

  setTimeout(() => {
    alert.classList.remove("active");
  }, 2200);
}

function isSkinUnlocked(skin) {
  return ownedSkins.includes(skin);
}

const buySound = new Audio("buy.mp3");
buySound.volume = 0.4;

const upgrades = [
  { name: "McDonalds", emoji: "🍟", sps: 1, cost: 50, owned: 0 },
  { name: "KFC", emoji: "🍗", sps: 3, cost: 150, owned: 0 },
  { name: "Roken", emoji: "🚬", sps: 6, cost: 400, owned: 0 },
  { name: "Zuipen", emoji: "🍺", sps: 12, cost: 900, owned: 0 },
  { name: "Skaten", emoji: "🛹", sps: 20, cost: 2000, owned: 0 },

  { name: "Koud", emoji: "🧊", sps: 35, cost: 4000, owned: 0 },
{ name: "Volkspark", emoji: "🌳", sps: 60, cost: 9000, owned: 0 },
{ name: "Starbucks", emoji: "☕", sps: 90, cost: 14000, owned: 0 },
{ name: "Enschede", emoji: "🏙️", sps: 120, cost: 20000, owned: 0 },

  { name: "Autisme", emoji: "🧠", sps: 300, cost: 60000, owned: 0 },
  { name: "Meneer Wissink", emoji: "🧓", sps: 1000, cost: 150000, owned: 0 },

  // 🔥 ENDGAME
  { name: "Afterparty", emoji: "🎉", sps: 2500, cost: 400000, owned: 0 },
  { name: "Festival Mode", emoji: "🎪", sps: 6000, cost: 1000000, owned: 0 },
  { name: "Spek God", emoji: "👑", sps: 15000, cost: 3000000, owned: 0 }
];

function updateUI() {
  spekEl.textContent = spek;
  spsEl.textContent = spekPerSecond;

  updateSkinLocks();
}

spekBtn.onclick = () => {

spekBtn.style.transform = "translate(-50%, -50%) scale(0.82) rotate(-4deg)";

setTimeout(() => {
  spekBtn.style.transform = "translate(-50%, -50%) scale(1.04) rotate(2deg)";
}, 100);

setTimeout(() => {
  spekBtn.style.transform = "translate(-50%, -50%) scale(1)";
}, 180);

  spek++;

  clickSound.currentTime = 0;
  clickSound.play();

  const pop = document.createElement("div");
  pop.textContent = "+1";
  pop.style.position = "absolute";
  pop.style.color = "#2dd4bf";
  pop.style.fontWeight = "bold";
  pop.style.left = "50%";
  pop.style.top = "50%";
  pop.style.transform = "translate(-50%, -50%)";
  pop.style.animation = "floatUp 0.6s ease forwards";

  document.querySelector(".spek-wrapper").appendChild(pop);

  setTimeout(() => pop.remove(), 500);

  updateUI();
};
// SHOP
function renderShop() {
  const shop = document.getElementById("shop");
  const shopPanel = document.getElementById("shopPanelContent");

  shop.innerHTML = "";
  shopPanel.innerHTML = "";

  upgrades.forEach((u, i) => {
    const item = createShopItem(u, i);
    shop.appendChild(item);

    const item2 = createShopItem(u, i);
    shopPanel.appendChild(item2);
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    playerName =
      user.displayName ||
      user.email.split("@")[0];

    loadCloudSave();
  }
});

async function loadLeaderboard() {

  const snapshot =
    await getDocs(collection(db, "players"));

  const players = [];

  snapshot.forEach(doc => {
    players.push({
      name: doc.id,
      ...doc.data()
    });
  });

  players.sort((a, b) => b.spek - a.spek);

  renderLeaderboard(players);
}
  const players = [];

  snapshot.forEach(doc => {
    players.push({
      name: doc.id,
      ...doc.data()
    });
  });

  players.sort((a, b) => b.spek - a.spek);

  renderLeaderboard(players);

function renderLeaderboard(players) {
  const el = document.getElementById("leaderboard");

  el.innerHTML = `
    <div class="leaderboard-title">🏆 Leaderboard</div>
  `;

  players.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "leaderboard-item";

    const crown = i === 0 ? "👑 " : "";

    div.innerHTML = `
      <span>${crown}${i + 1}. ${p.name}</span>
      <span>${p.spek}</span>
    `;

    // 👇 jouw naam highlight
    if (p.name === playerName) {
      div.style.background = "rgba(45, 212, 191, 0.2)";
      div.style.borderRadius = "6px";
    }

    el.appendChild(div);
  });
}



function createShopItem(u, i) {
  const div = document.createElement("div");
  div.className = "shop-item";

  div.innerHTML = `
    <span>${u.emoji} ${u.name}</span>
    <button class="shop-buy">${u.cost}</button>
  `;

  div.querySelector("button").onclick = () => buyUpgrade(i);

  return div;
}

// BUY
function buyUpgrade(i) {
  const u = upgrades[i];

  if (spek >= u.cost) {
    spek -= u.cost;

const s = new Audio("buy.mp3");
s.volume = 0.4;
s.play();

    u.owned++;
    orbitCount++;
    spekPerSecond += u.sps;

    u.cost = Math.floor(u.cost * (1.25 + u.owned * 0.02));

    spawnOrbit(60 + orbitCount * 3, 0.5 + orbitCount * 0.05);

    renderShop();
    renderInventory();
    updateUI();
  }
}
function spawnOrbit(radius = 80, speed = 1) {
  const wrapper = document.querySelector(".spek-wrapper");

  const orbit = document.createElement("div");
  orbit.className = "orbit";

const el = document.createElement("img");

el.src = skins[currentSkin].image;

el.className = "orbit-bacon";

  orbit.appendChild(el);
  wrapper.appendChild(orbit);

  let angle = Math.random() * 360;

  function animate() {
    angle += speed;

    orbit.style.transform =
      `translate(-50%, -50%) rotate(${angle}deg) translateX(${radius}px)`;

    requestAnimationFrame(animate);
  }

  animate();
}


// INVENTORY
function renderInventory() {
  const inv = document.getElementById("inventory");
  const invPanel = document.getElementById("inventoryPanelContent");

  inv.innerHTML = "";
  invPanel.innerHTML = "";

  upgrades.forEach(u => {
    const div = document.createElement("div");
    div.className = "inventory-item";
    div.innerHTML = `${u.emoji} ${u.name} <span>x${u.owned}</span>`;

    inv.appendChild(div);
    invPanel.appendChild(div.cloneNode(true));
  });
}

// PANELS
window.openPanel = function(type) {
  closePanels();
  document.getElementById(type + "Panel").classList.add("active");
}

window.closePanels = function() {
  document.getElementById("inventoryPanel").classList.remove("active");
  document.getElementById("shopPanel").classList.remove("active");
}

const resetBtn = document.getElementById("resetGame");
const modal = document.getElementById("resetModal");

resetBtn.onclick = () => {
  modal.classList.add("active");
};

document.getElementById("cancelReset").onclick = () => {
  modal.classList.remove("active");
};

document.getElementById("confirmReset").onclick = async () => {

  // reset waardes
  spek = 0;
  spekPerSecond = 0;
  orbitCount = 0;

  upgrades.forEach(u => {
    u.owned = 0;
  });

  // firebase reset
try {

  await setDoc(doc(db, "players", playerName), {
    spek: 0,
    sps: 0,
    updated: Date.now()
  });

} catch (err) {
  console.log(err);
}

setInterval(() => {
  if (!gameLoaded) return; // 🔥 dit fixt je probleem

  saveToLeaderboard();
}, 120000);

async function saveToLeaderboard() {
  if (spek <= 0) return;

await setDoc(doc(db, "players", playerName), {
  spek: spek,
  sps: spekPerSecond,
  currentSkin: currentSkin,
  ownedSkins: ownedSkins,

    upgrades: upgrades.map(u => ({
      owned: u.owned,
      cost: u.cost
    })),

    updated: Date.now()
  });
}



async function loadCloudSave() {
  const docRef = doc(db, "players", playerName);
  const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  const data = docSnap.data();

  ownedSkins = data.ownedSkins || ["default"];

    spek = data.spek || 0;
    spekPerSecond = data.sps || 0;
    orbitCount = data.orbitCount || 0;

    if (data.upgrades) {
      data.upgrades.forEach((saved, i) => {
        upgrades[i].owned = saved.owned;
        upgrades[i].cost = saved.cost;
      });
    }
  }

  for (let i = 0; i < orbitCount; i++) {
    spawnOrbit(60 + i * 3, 0.5 + i * 0.05);
  }

  updateUI();
  renderShop();
renderInventory();

applySkin();

gameLoaded = true;
}

for (let i = 0; i < orbitCount; i++) {
  spawnOrbit(60 + i * 3, 0.5 + i * 0.05);
}
// LOOP
setInterval(() => {
  spek += spekPerSecond;
  updateUI();
}, 1000);

// INIT
renderShop();
renderInventory();

renderSkins();

updateUI();
updateSkinLocks();
applySkin();

const skinsMenu =
  document.getElementById("skinsMenu");

document
  .getElementById("openSkinsBtn")
  .onclick = () => {

    skinsMenu.classList.add("active");

};

document
  .getElementById("closeSkinsBtn")
  .onclick = () => {

    skinsMenu.classList.remove("active");

};

loadLeaderboard();

setInterval(() => {
  loadLeaderboard();
}, 15000)};