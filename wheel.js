const wheel = document.getElementById("wheel");
const labelsContainer = document.getElementById("labels");
const result = document.getElementById("result");
const spinBtn = document.getElementById("spinBtn");

// geluid
const tickSound = new Audio("sounds/tick.mp3");
const winSound = new Audio("sounds/win.mp3");

tickSound.volume = 0.3;
winSound.volume = 0.6;

let isSpinning = false;
let currentRotation = 0;
let tickInterval = null;

// STRAFFEN
const punishments = [
  "🍺 2 slokken",
  "📱 App sturen",
  "💪 10 push-ups",
  "🥃 Shot",
  "😂 Accent praten",
  "📸 Story posten",
  "🎤 Zing lied",
  "💃 Dans"
];

// 🔥 labels maken
function createLabels() {
  const angle = 360 / punishments.length;

  punishments.forEach((text, i) => {
    const div = document.createElement("div");
    div.className = "label";
    div.textContent = text;

    const rotation = i * angle;

    div.style.transform = `
      rotate(${rotation}deg)
      translate(0, -130px)
      rotate(${-rotation}deg)
    `;

    labelsContainer.appendChild(div);
  });
}

createLabels();

// 🎯 SPIN
spinBtn.addEventListener("click", () => {
  if (isSpinning) return;

  isSpinning = true;
  result.textContent = "Draait...";

  const spins = Math.floor(Math.random() * 5) + 5;
  const extra = Math.random() * 360;

  const totalRotation = spins * 360 + extra;
  currentRotation += totalRotation;

  wheel.style.transform = `rotate(${currentRotation}deg)`;

  // 🔊 tik geluid
  tickInterval = setInterval(() => {
    tickSound.currentTime = 0;
    tickSound.play();
  }, 80);

  setTimeout(() => {
    clearInterval(tickInterval);

    const normalized = currentRotation % 360;
    const slice = 360 / punishments.length;

    const index =
      punishments.length -
      Math.floor(normalized / slice) -
      1;

    result.textContent = `💀 Straf: ${punishments[index]}`;

    winSound.currentTime = 0;
    winSound.play();

    isSpinning = false;

  }, 4000);
});