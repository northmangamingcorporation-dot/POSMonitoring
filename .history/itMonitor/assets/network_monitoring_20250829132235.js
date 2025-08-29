let chart, jitterTimer = null;
const base = { dl: 0, ul: 0, pg: 0 };
const REFRESH_INTERVAL = 30000;
const API_KEY = "AIzaSyAMLy_lt4KiSOTIyBKo4VE4N-29l_S39io"; // Replace with your API key
const SPREADSHEET_ID = "175r-cZ9DokniT9vDQGU4uqtkV-BRK3WjI77vG7Ci1eI";
const SHEET_NAME = "Network_Speed_Log";

document.getElementById("refresh").addEventListener("click", loadData);

async function loadData() {
  const limit = parseInt(document.getElementById("limit").value);

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  render(data.values, limit);
}

function render(rowsRaw, limit) {
  // Skip headers (first row) and map indexes
  const rows = rowsRaw.slice(1).map(r => ({
    timestamp: r[0],
    download: parseFloat(r[1]) || 0,
    upload: parseFloat(r[2]) || 0,
    ping: parseFloat(r[3]) || 0
  }))
  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const filtered = (limit > 0) ? rows.slice(0, limit) : rows;

  // ✅ Removed: table rendering code

// ✅ Use the most recent (latest) values
if (filtered.length) {
  const latest = filtered[0]; // because rows are sorted descending (newest first)
  document.getElementById("mDown").textContent = latest.download.toFixed(2) + " Mbps";
  document.getElementById("mUp").textContent   = latest.upload.toFixed(2) + " Mbps";
  document.getElementById("mPing").textContent = latest.ping.toFixed(0) + " ms";
}


  // Prepare chart data
  const labels = [...filtered].reverse().map(r => r.timestamp);
  const dl = [...filtered].reverse().map(r => r.download);
  const ul = [...filtered].reverse().map(r => r.upload);
  const pg = [...filtered].reverse().map(r => r.ping);

  if (!chart) {
    const ctx = document.getElementById("chartLine").getContext("2d");
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Download", data: dl, borderColor: "#58a6ff", fill: false, tension: 0.35 },
          { label: "Upload", data: ul, borderColor: "#2ecc71", fill: false, tension: 0.35 },
          { label: "Ping", data: pg, borderColor: "#e74c3c", yAxisID: "y2", fill: false, tension: 0.35 }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: "index", intersect: false },
        animation: { duration: 800, easing: "easeInOutCubic" },
        scales: {
          y: { title: { display: true, text: "Mbps" } },
          y2: { position: "right", title: { display: true, text: "ms" }, grid: { drawOnChartArea: false } },
          x: { ticks: { maxTicksLimit: 10 } }
        }
      }
    });
  } else {
    chart.data.labels = labels;
    chart.data.datasets[0].data = dl;
    chart.data.datasets[1].data = ul;
    chart.data.datasets[2].data = pg;
    chart.update();
  }

  // Save last values to base
  if (dl.length) {
    base.dl = dl[dl.length - 1];
    base.ul = ul[ul.length - 1];
    base.pg = pg[pg.length - 1];
  }

  ensureJitterLoop();
}

function ensureJitterLoop() {
  if (!jitterTimer) jitterTimer = setInterval(jitterRecent, 500);
}

function jitterRecent() {
  if (!chart) return;
  const last = chart.data.labels.length - 1;
  if (last < 0) return;
  const jitterMbps = 1.5, jitterMs = 3.0;
  const d = Math.max(0, base.dl + (Math.random() - 0.5) * jitterMbps);
  const u = Math.max(0, base.ul + (Math.random() - 0.5) * jitterMbps);
  const p = Math.max(0, base.pg + (Math.random() - 0.5) * jitterMs);
  chart.data.datasets[0].data[last] = d;
  chart.data.datasets[1].data[last] = u;
  chart.data.datasets[2].data[last] = p;
  chart.update("none");
  document.getElementById("mDown").textContent = d.toFixed(2) + " Mbps";
  document.getElementById("mUp").textContent   = u.toFixed(2) + " Mbps";
  document.getElementById("mPing").textContent = Math.round(p) + " ms";
}

loadData();
setInterval(loadData, REFRESH_INTERVAL);
