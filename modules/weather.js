function getChaosMessage() {
  const chaosMessages = [
    "🍺 Bier smaakt vandaag extra goed",
    "🛶 Dit is survivallen boys",
    "💀 RIP tent alvast",
    "🔥 dit wordt een legendary dag",
    "🥴 iemand gaat hier spijt van krijgen"
  ];

  return chaosMessages[
    Math.floor(Math.random() * chaosMessages.length)
  ];
}

async function loadWeather() {
  const lat = 51.351115;
  const lon = 8.6780082;

  try {
const res = await fetch(
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
);

    const data = await res.json();

    const temp = Math.round(data.current_weather.temperature);
    const wind = data.current_weather.windspeed;
    const code = data.current_weather.weathercode;

    renderWeather(temp, wind, code);
    renderForecast(data.daily); // 👈 NIEUW

  } catch (err) {
    console.error("weer error", err);
  }
}

  function renderForecast(daily) {
  const container = document.getElementById("weatherForecast");
  if (!container) return;

  container.innerHTML = "";

  daily.time.slice(0, 5).forEach((date, i) => {
    const max = Math.round(daily.temperature_2m_max[i]);
    const min = Math.round(daily.temperature_2m_min[i]);
    const code = daily.weathercode[i];

    const info = getWeatherInfo(code);

    const day = new Date(date).toLocaleDateString("nl-NL", {
      weekday: "short"
    });

    const div = document.createElement("div");
    div.className = "forecast-day";

    div.innerHTML = `
      <div>${day}</div>
      <div>${info.icon}</div>
      <div>${max}° / ${min}°</div>
    `;

    container.appendChild(div);
  });
}
function getWeatherInfo(code) {
  if (code === 0) return { icon: "☀️", type: "clear" };
  if (code <= 3) return { icon: "⛅", type: "clouds" };
  if (code >= 45 && code <= 48) return { icon: "🌫️", type: "fog" };
  if (code >= 51 && code <= 67) return { icon: "🌧️", type: "rain" };
  if (code >= 71 && code <= 77) return { icon: "❄️", type: "snow" };
  if (code >= 80 && code <= 82) return { icon: "🌧️", type: "rain" };
  if (code >= 95) return { icon: "⛈️", type: "storm" };

  return { icon: "🌍", type: "unknown" };
}

function getWeatherMood(temp, wind, type) {
  if (type === "rain") {
    return "💀 Het gaat regenen, zet je tent vast";
  }

  if (type === "storm") {
    return "⛈️ Dit wordt chaos, succes jongens";
  }

  if (temp > 22) {
    return "🔥 Perfect bier weer";
  }

  if (wind > 25) {
    return "🌪️ Tent gaat vliegen maat";
  }

  if (temp < 10) {
    return "🥶 Dit wordt afzien";
  }

  return "😎 prima weer voor chaos";
}
function renderWeather(temp, wind, code) {
  const iconEl = document.getElementById("weatherIcon");
  const tempEl = document.getElementById("weatherTemp");
  const descEl = document.getElementById("weatherDesc");
  const moodEl = document.getElementById("weatherMood");
  const widget = document.getElementById("weatherWidget");

  const info = getWeatherInfo(code);

  tempEl.textContent = `${temp}°C`;
  descEl.textContent = `wind ${wind} km/h`;
  iconEl.textContent = info.icon;

  const weatherMood = getWeatherMood(temp, wind, info.type);
  const chaos = getChaosMessage();

  moodEl.innerHTML = `
    <div>${weatherMood}</div>
    <div class="weather-chaos">${chaos}</div>
  `;

  widget.classList.remove("weather-rain", "weather-sun", "weather-storm");

  if (info.type === "rain") widget.classList.add("weather-rain");
  if (info.type === "clear") widget.classList.add("weather-sun");
  if (info.type === "storm") widget.classList.add("weather-storm");
}
export {
loadWeather
};
