const SPREADSHEET_ID = "1VWPTrBlRIWOBHHIFttTUZH5mDnbKvieyR_gZOHsrNQQ";
const SHEET_NAME = "WebhookLogs";
const API_KEY = "AIzaSyAMLy_lt4KiSOTIyBKo4VE4N-29l_S39io"; // Your API key

// Fetch documents from Google Sheets
async function fetchSheetData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();

  const rows = json.values || [];
  if (rows.length < 2) return { recentCancellation: [], approved: [], denied: [] };

  const headers = rows[0].map(h => h.toLowerCase());
  const data = {
    recentCancellation: [],
    approved: [],
    denied: []
  };

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowObj = headers.reduce((acc, header, index) => {
      acc[header] = row[index] || "";
      return acc;
    }, {});

    // Map based on "status" column
    if (rowObj.status === "pending") {
      data.recentCancellation.push({
        boothCode: rowObj.boothcode,
        deviceId: rowObj.deviceid,
        transaction: rowObj.transactionnumber,
        coordinates: rowObj.coordinates,
        address: rowObj.boothaddress,
        total: parseFloat(rowObj.totalamount) || 0
      });
    } else if (rowObj.status === "approved") {
      data.approved.push({
        itName: rowObj.itname,
        boothCode: rowObj.boothcode,
        transaction: rowObj.transactionnumber
      });
    } else if (rowObj.status === "denied") {
      data.denied.push({
        itName: rowObj.itname,
        boothCode: rowObj.boothcode,
        transaction: rowObj.transactionnumber
      });
    }
  }

  console.log("✅ Processed Sheet data:", data);
  return data;
}

async function populateTables() {
  const data = await fetchSheetData();
  console.log("📥 Raw data from Google Sheets:", data);

  // Ensure each item has a 'status' field
  data.recentCancellation = (data.recentCancellation || []).map(item => ({ ...item, status: "pending" }));
  data.approved = (data.approved || []).map(item => ({ ...item, status: "approved" }));
  data.denied = (data.denied || []).map(item => ({ ...item, status: "denied" }));

  const canceled = data.recentCancellation.length;
  const approved = data.approved.length;
  const denied = data.denied.length;

  console.log("🔢 Counts ->", { canceled, approved, denied });

  // Update dashboard cards
  document.getElementById("recentCount").innerHTML = canceled;
  document.getElementById("approvedCount").innerHTML = approved;
  document.getElementById("deniedCount").innerHTML = denied;

  // Populate Recent Cancellation Table
  try {
    const cancelTbody = document.querySelector("#cancelTable tbody");
    cancelTbody.innerHTML = "";

    let totalAmount = 0;

    data.recentCancellation.forEach(item => {
      const amount = Number(item.total) || 0;
      totalAmount += amount;

      const row = `<tr>
        <td>${item.boothCode || ""}</td>
        <td>${item.deviceId || ""}</td>
        <td>${item.transaction || ""}</td>
        <td>${item.coordinates || ""}</td>
        <td>${item.address || ""}</td>
        <td>₱${amount.toLocaleString()}</td>
      </tr>`;
      cancelTbody.innerHTML += row;
    });

    // ✅ Add total row at bottom
    const totalRow = `<tr style="font-weight:bold; font-color:#fff; b">
      <td colspan="5" style="text-align:right;">TOTAL</td>
      <td>₱${totalAmount.toLocaleString()}</td>
    </tr>`;
    cancelTbody.innerHTML += totalRow;

  } catch (e) {
    console.warn("Failed to populate Recent Cancellation Table:", e);
  }

  // Populate Approved Table
  try {
    const approvedTbody = document.querySelector("#approvedTable tbody");
    approvedTbody.innerHTML = "";
    data.approved.forEach(item => {
      const row = `<tr>
        <td>${item.itName || ""}</td>
        <td>${item.boothCode || ""}</td>
        <td>${item.transaction || ""}</td>
      </tr>`;
      approvedTbody.innerHTML += row;
    });
  } catch (e) {
    console.warn("Failed to populate Approved Table:", e);
  }

  // Populate Denied Table
  try {
    const deniedTbody = document.querySelector("#deniedTable tbody");
    deniedTbody.innerHTML = "";
    data.denied.forEach(item => {
      const row = `<tr>
        <td>${item.itName || ""}</td>
        <td>${item.boothCode || ""}</td>
        <td>${item.transaction || ""}</td>
      </tr>`;
      deniedTbody.innerHTML += row;
    });
  } catch (e) {
    console.warn("Failed to populate Denied Table:", e);
  }

  // Merge all items for chart
  const allItems = [...data.recentCancellation, ...data.approved, ...data.denied];
  console.log("📊 All items merged for chart:", allItems);

  renderChart(allItems);
}

async function populateStatusCards() {
  const data = await fetchSheetData();
  console.log("📥 Raw data from Google Sheets:", data);

  // Ensure each item has a 'status' field
  data.recentCancellation = (data.recentCancellation || []).map(item => ({ ...item, status: "pending" }));
  data.approved = (data.approved || []).map(item => ({ ...item, status: "approved" }));
  data.denied = (data.denied || []).map(item => ({ ...item, status: "denied" }));

  const canceled = data.recentCancellation.length;
  const approved = data.approved.length;
  const denied = data.denied.length;

  console.log("🔢 Counts ->", { canceled, approved, denied });

  // Update dashboard cards
  document.getElementById("recentCount").innerHTML = canceled;
  document.getElementById("approvedCount").innerHTML = approved;
  document.getElementById("deniedCount").innerHTML = denied;

  // Merge all items for chart
  const allItems = [...data.recentCancellation, ...data.approved, ...data.denied];
  console.log("📊 All items merged for chart:", allItems);

  renderChart(allItems);
} 

let lineChartInstance = null;

function renderChart(allItems = []) {
  // Count items based on their "status" field
  const canceled = allItems.filter(d => d.status === "pending").length;
  const approved = allItems.filter(d => d.status === "approved").length;
  const denied   = allItems.filter(d => d.status === "denied").length;

  const ctx = document.getElementById("statusChart").getContext("2d");
  
  if (!ctx) {
    console.error("Canvas context not found!");
    return;
  }

  // Destroy previous chart if it exists
  if (lineChartInstance) {
    lineChartInstance.destroy();
  }

  // Create new pie chart
  lineChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Recent Cancellations", "Approved", "Denied"],
      datasets: [{
        data: [canceled, approved, denied],
        backgroundColor: [ "#4caf50", "#2196f3","#f44336"], // red, green, blue
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        datalabels: {
          color: "#fff",
          font: { weight: "bold", size: 14 },
          formatter: value => value
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}


// Function to refresh dashboard and tables
async function refreshDashboard() {
  try {
    await populateStatusCards();
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

populateTables(); // Initial population of tables



