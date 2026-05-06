let peer;
let currentUser;
let connections = [];
let localStream;

const connectBtn = document.getElementById("connectBtn");
const talkBtn = document.getElementById("talkBtn");
const statusEl = document.getElementById("status");
const userSelect = document.getElementById("userSelect");
const radioStart = document.getElementById("radioStart");
const radioEnd = document.getElementById("radioEnd");

const USERS = ["tygo", "jurjen", "nario"];

// 🔥 GLOBAL STATE
window.isSomeoneTalking = null;

connectBtn.onclick = async () => {
  currentUser = userSelect.value;

  peer = new Peer(currentUser);

  peer.on("open", (id) => {
    statusEl.textContent = `Verbonden als ${id}`;
    talkBtn.disabled = false;
  });

  peer.on("call", (call) => {
    // 🔥 iemand belt jou → die praat dus
    window.isSomeoneTalking = call.peer;
    updateSpeaker(call.peer);

    call.answer();

    call.on("stream", (remoteStream) => {
      playAudio(remoteStream);
    });

    call.on("close", () => {
      window.isSomeoneTalking = null;
      updateSpeaker(null);
    });
  });
};

// 🎤 START TALKING
async function startTalking() {
  if (window.isSomeoneTalking && window.isSomeoneTalking !== currentUser) {
    statusEl.textContent = "❌ Iemand anders praat...";
    return;
  }

  window.isSomeoneTalking = currentUser;
  updateSpeaker(currentUser);

  radioStart.currentTime = 0;
  radioStart.play();

  talkBtn.classList.add("active");

  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  USERS.forEach((user) => {
    if (user !== currentUser) {
      const call = peer.call(user, localStream);
      connections.push(call);
    }
  });
}

// 🛑 STOP TALKING
function stopTalking() {
  radioEnd.currentTime = 0;
  radioEnd.play();
stopVisualizer();
  talkBtn.classList.remove("active");

  connections.forEach((call) => call.close());
  connections = [];

  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }

  window.isSomeoneTalking = null;
  updateSpeaker(null);
}

// 🟢 SPEAKER INDICATOR
function updateSpeaker(name) {
  const el = document.getElementById("speaker");
  const app = document.querySelector(".radio-app");

  if (!name) {
    el.textContent = "🔇 Niemand praat";
    app.classList.remove("speaking");
    stopVisualizer();
  } else {
    el.textContent = `🟢 ${name} praat`;
    app.classList.add("speaking");
  }
}

document.getElementById("backBtn").onclick = () => {
  window.location.href = "index.html"; // of jouw main page
};

// 🔊 AUDIO AF SPELEN
function playAudio(stream) {
  const audio = new Audio();
  audio.srcObject = stream;
  audio.play();

  // 🔥 analyser voor incoming audio
  startVisualizer(stream);
}

// 🖱️ DESKTOP
talkBtn.addEventListener("mousedown", startTalking);
talkBtn.addEventListener("mouseup", stopTalking);
talkBtn.addEventListener("mouseleave", stopTalking);

// 📱 MOBILE
talkBtn.addEventListener("touchstart", startTalking);
talkBtn.addEventListener("touchend", stopTalking);

let analyser;
let dataArray;
let audioContext;
let visualizerRunning = false;

function startVisualizer(stream) {
  if (visualizerRunning) return;

  audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 64;

  source.connect(analyser);

  dataArray = new Uint8Array(analyser.frequencyBinCount);

  visualizerRunning = true;
  animateVisualizer();
}

function animateVisualizer() {
  if (!visualizerRunning) return;

  requestAnimationFrame(animateVisualizer);

  analyser.getByteFrequencyData(dataArray);

  const bars = document.querySelectorAll("#visualizer div");

  bars.forEach((bar, i) => {
    const value = dataArray[i] || 0;

    // 🔥 smoothing (maakt het mooier)
    const height = Math.max(4, value * 0.6);

    bar.style.height = height + "px";
  });
}

function stopVisualizer() {
  visualizerRunning = false;
  analyser = null;
}