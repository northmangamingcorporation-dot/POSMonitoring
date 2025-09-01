const SPREADSHEET_ID = "175r-cZ9DokniT9vDQGU4uqtkV-BRK3WjI77vG7Ci1eI";
const SHEET_NAME = "WebhookLogs";
const API_KEY = "AIzaSyAMLy_lt4KiSOTIyBKo4VE4N-29l_S39io"; // Your API key

// Fetch documents from Google Sheets
async function fetchSheetData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();

  const rows = json.values || [];
  const data = {
    recentCancellation: [],
    approved: [],
    denied: []
  };

  // Assuming header row exists in row 0
  const headers = rows[0] || [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowObj = headers.reduce((acc, header, index) => {
      acc[header.toLowerCase()] = row[index] || "";
      return acc;
    }, {});

    // Map columns to your data structure
    if (rowObj.recentcancellationrequest) {
      const r = JSON.parse(rowObj.recentcancellationrequest);
      data.recentCancellation.push({
        boothCode: r.BoothCode || "",
        deviceId: r.DeviceID || "",
        transaction: r.TransactionNumber || "",
        coords: r.Coordinates || "",
        address: r.BoothAddress || "",
        total: r.TotalAmount || 0
      });
    } else if (rowObj.recentapprovedcancellation) {
      const r = JSON.parse(rowObj.recentapprovedcancellation);
      data.approved.push({
        itName: r.ITName || "",
        boothCode: r.BoothCode || "",
        transaction: r.TransactionNumber || ""
      });
    } else if (rowObj.recentdeniedcancellationrequest) {
      const r = JSON.parse(rowObj.recentdeniedcancellationrequest);
      data.denied.push({
        itName: r.ITName || "",
        boothCode: r.BoothCode || "",
        transaction: r.TransactionNumber || ""
      });
    }
  }

  console.log("✅ Processed Sheet data:", data);
  return data;
}

async function populateTables() {
  const data = await fetchFirestoreData();
  console.log("📥 Raw data from Firestore:", data);

  const canceled = data.recentCancellation.length;
  const approved = data.approved.length;
  const denied   = data.denied.length;

  console.log("🔢 Counts ->", { canceled, approved, denied });

  // Update dashboard cards
  document.getElementById("recentCount").innerHTML = canceled;
  document.getElementById("approvedCount").innerHTML = approved;
  document.getElementById("deniedCount").innerHTML = denied;

// Populate Recent Cancellation Table
try {
  const cancelTbody = document.querySelector("#cancelTable tbody");
  cancelTbody.innerHTML = ""; // clear old rows
  (data.recentCancellation || []).forEach(item => {
    const row = `<tr>
      <td>${item.boothCode || ""}</td>
      <td>${item.deviceId || ""}</td>
      <td>${item.transaction || ""}</td>
      <td>${item.coords || ""}</td>
      <td>${item.address || ""}</td>
      <td>${item.total || ""}</td>
    </tr>`;
    cancelTbody.innerHTML += row;
  });
} catch(e) {
  console.warn("Failed to populate Recent Cancellation Table:", e);
}

// Populate Approved Table
try {
  const approvedTbody = document.querySelector("#approvedTable tbody");
  approvedTbody.innerHTML = "";
  (data.approved || []).forEach(item => {
    const row = `<tr>
      <td>${item.itName || ""}</td>
      <td>${item.boothCode || ""}</td>
      <td>${item.transaction || ""}</td>
    </tr>`;
    approvedTbody.innerHTML += row;
  });
} catch(e) {
  console.warn("Failed to populate Approved Table:", e);
}

// Populate Denied Table
try {
  const deniedTbody = document.querySelector("#deniedTable tbody");
  deniedTbody.innerHTML = "";
  (data.denied || []).forEach(item => {
    const row = `<tr>
      <td>${item.itName || ""}</td>
      <td>${item.boothCode || ""}</td>
      <td>${item.transaction || ""}</td>
    </tr>`;
    deniedTbody.innerHTML += row;
  });
} catch(e) {
  console.warn("Failed to populate Denied Table:", e);
}


  // Merge all for chart
  const allItems = [
    ...data.recentCancellation,
    ...data.approved,
    ...data.denied,
  ];
  console.log("📊 All items merged for chart:", allItems);

  renderChart(allItems);
}

let lineChartInstance = null; // global reference

function renderChart(allItems) {
  const canceled = allItems.filter(d => d.type === "request").length;
  const approved = allItems.filter(d => d.type === "approved").length;
  const denied   = allItems.filter(d => d.type === "denied").length;

  const ctx = document.getElementById("statusChart").getContext("2d");

  // Destroy previous chart if it exists
  if (lineChartInstance) {
    lineChartInstance.destroy();
  }

  // Store the new chart instance
  lineChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Recent Cancellations", "Approved", "Denied"],
      datasets: [{
        data: [canceled, approved, denied],
        backgroundColor: ["#4caf50", "#2196f3", "#f44336"],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        datalabels: {
          color: "#fff",
          font: { weight: "bold", size: 14 },
          formatter: (value) => value
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

// Function to refresh dashboard and tables
async function refreshDashboard() {
  try {
    await populateTables();
  } catch (e) {
    console.error("Error updating dashboard:", e);
  }
}

// Start background updates
const REFRESH_INTERVAL = 5000; // 5000ms = 5 seconds

// Initial load
refreshDashboard();

// Run repeatedly in the background
setInterval(refreshDashboard, REFRESH_INTERVAL);



