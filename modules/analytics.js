import {
  collection,
  doc,
  getDocs,
  increment,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export async function trackVisit(db) {
  const today = new Date().toISOString().slice(0, 10);
  const ref = doc(db, "analytics", today);

  await setDoc(ref, { views: increment(1) }, { merge: true });
}

export async function loadAnalyticsChart(db) {
  const ctx = document.getElementById("analyticsChart");
  if (!ctx || typeof Chart === "undefined") return;

  const snapshot = await getDocs(collection(db, "analytics"));
  const sorted = snapshot.docs
    .map((entry) => ({
      label: entry.id,
      value: entry.data().views || 0
    }))
    .sort((a, b) => new Date(a.label) - new Date(b.label));

  new Chart(ctx, {
    type: "line",
    data: {
      labels: sorted.map((item) => item.label),
      datasets: [{
        label: "Bezoekers",
        data: sorted.map((item) => item.value),
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}
