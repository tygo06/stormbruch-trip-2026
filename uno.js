const result = document.getElementById("result");
const btn = document.getElementById("generateBtn");

// 🎯 alle straffen per categorie
const punishments = {
  SOCIAL: [
    "Stuur 'ik mis je' naar je laatste WhatsApp-contact",
    "Stuur een voice memo van 10 sec: 'UNO is life'",
    "Post een random foto op je story",
    "Stuur je moeder: 'ik ga beroemd worden met UNO'",
    "Bel iemand en zeg: 'Ik heb gewonnen' en hang op",
    "Stuur een gênante foto van jezelf",
    "App je crush: 'UNO > jij'",
    "Laat de groep een bericht voor je typen",
    "Zet je profielfoto 1 uur op iets doms",
    "Stuur random emoji combo naar 5 mensen"
  ],

  DRANK: [
    "Neem 1 slok",
    "Neem 2 slokken",
    "Neem een shotje 💀",
    "Iedereen kiest hoeveel slokken jij neemt",
    "Adtje 🍺",
    "Drink zonder handen",
    "Mix 2 drankjes en drink",
    "Neem een slok per kaart die je hebt",
    "Links bepaalt je straf",
    "Waterfall (allemaal drinken)"
  ],

  FUN: [
    "Doe 10 push-ups",
    "Praat met accent (2 rondes)",
    "Je mag alleen fluisteren",
    "Doe een dansje",
    "Maak dierengeluid elke beurt",
    "Noem iedereen 'chef'",
    "Staand spelen",
    "Loop rondje om de tent",
    "Doe alsof je commentator bent",
    "Praat alsof je dronken bent"
  ],

  MINDGAME: [
    "Je mag 1 ronde niet praten",
    "Speel met je slechte hand",
    "Kaarten open op tafel",
    "Iedereen ziet 1 kaart van jou",
    "Leg elke move uit",
    "Speel zonder kijken",
    "3 sec nadenken per beurt",
    "Geen +2/+4 voor 2 rondes",
    "Liegen over aantal kaarten"
  ],

  KAMP: [
    "Ga 2 min buiten staan",
    "Haal iets van buiten",
    "Verzamel hout",
    "Maak snack voor iedereen",
    "Haal drinken voor groep",
    "Zet muziek op",
    "Ruim iets op",
    "Kijk 30 sec naar sterren",
    "Doe alsof je verdwaald bent",
    "Bouw iets random"
  ],

  CHAOS: [
    "Combineer 2 straffen 😈",
    "Iedereen geeft jou een regel",
    "Begin elke zin met 'UNO meester hier'",
    "Ruil kaarten",
    "Speel zonder kijken",
    "Iedereen geeft jou 1 kaart",
    "Bedenk nieuwe regel",
    "Iemand anders speelt jouw beurt",
    "Zing terwijl je speelt",
    "Alleen ja/nee antwoorden"
  ],

  GROEP: [
    "Iedereen drinkt behalve jij",
    "Jij drinkt voor iedereen",
    "Iedereen doet iets doms",
    "Groep kiest jouw move",
    "Iedereen wisselt plek",
    "Iedereen vertelt verhaal",
    "Groepsdansje",
    "Iedereen zegt geheim"
  ],

  EXTREME: [
    "Laat iemand je gallery bekijken 😭",
    "Vertel gênant verhaal",
    "Laat iemand muziek kiezen",
    "Imiteer iemand",
    "Stuur pickup line",
    "Bel random nummer"
  ]
};

const categories = Object.keys(punishments);

let lastPunishment = "";

// 🎲 GENERATOR
btn.addEventListener("click", () => {
  let category;
  let punishment;

  do {
    category = categories[Math.floor(Math.random() * categories.length)];
    const list = punishments[category];
    punishment = list[Math.floor(Math.random() * list.length)];
  } while (punishment === lastPunishment);

  lastPunishment = punishment;

  // 🎯 mooie categorie naam
  const prettyCategory = category.toLowerCase();

  result.innerHTML = `
    <div class="category">${prettyCategory}</div>
    <div class="punishment">${punishment}</div>
  `;

  // 🔥 UNO FLASH
  result.classList.add("flash");

  setTimeout(() => {
    result.classList.remove("flash");
  }, 400);

  // 🔥 POP animatie
  result.style.transform = "scale(1.1)";
  setTimeout(() => {
    result.style.transform = "scale(1)";
  }, 200);
});