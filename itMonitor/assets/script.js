 
 // Import from Firebase CDN
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

  const firebaseConfig = {
    apiKey: "AIzaSyC1MXd3FcLv_Ta00hzv7CU6skJPw4H1w7M",
    authDomain: "northmancorpdatabase.firebaseapp.com",
    projectId: "northmancorpdatabase",
    storageBucket: "northmancorpdatabase.appspot.com",
    messagingSenderId: "843208612876",
    appId: "1:843208612876:web:d4249a28702e62010ae229",
    measurementId: "G-3P6XCFX2SK"
  };

  // Initialize Firebase + Firestore
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Fetch documents from Firestore
// Fetch documents from Firestore
async function fetchFirestoreData() {
  const snapshot = await getDocs(collection(db, "webhooks"));
  const data = {
    recentCancellation: [],
    approved: [],
    denied: []
  };

  snapshot.forEach(doc => {
    const f = doc.data();

    if (!f.rawData) return;

    try {
      const parsed = JSON.parse(f.rawData);

      if (parsed.RecentCancellationRequest) {
        const r = parsed.RecentCancellationRequest;
        data.recentCancellation.push({
          boothCode: r.BoothCode || "",
          deviceId: r.DeviceID || "",
          transaction: r.TransactionNumber || "",
          coords: r.Coordinates || "",
          address: r.BoothAddress || "",
          total: r.TotalAmount || ""
        });
      } 
      else if (parsed.RecentApprovedCancellation) {
        const r = parsed.RecentApprovedCancellation;
        data.approved.push({
          itName: r.ITName || "",
          boothCode: r.BoothCode || "",
          transaction: r.TransactionNumber || ""
        });
      } 
      else if (parsed.RecentDeniedCancellationRequest) {
        const r = parsed.RecentDeniedCancellationRequest;
        data.denied.push({
          itName: r.ITName || "",
          boothCode: r.BoothCode || "",
          transaction: r.TransactionNumber || ""
        });
      }

    } catch (err) {
      console.error("❌ Failed to parse rawData:", f.rawData, err);
    }
  });

  console.log("✅ Processed Firestore data:", data);
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
  const cancelTbody = document.querySelector("#cancelTable tbody");
  cancelTbody.innerHTML = ""; // clear old rows
  data.recentCancellation.forEach(item => {
    const row = `<tr>
      <td>${item.boothCode}</td>
      <td>${item.deviceId}</td>
      <td>${item.transaction}</td>
      <td>${item.coords}</td>
      <td>${item.address}</td>
      <td>${item.total}</td>
    </tr>`;
    cancelTbody.innerHTML += row;
  });

  // Populate Approved Table
  const approvedTbody = document.querySelector("#approvedTable tbody");
  approvedTbody.innerHTML = "";
  data.approved.forEach(item => {
    const row = `<tr>
      <td>${item.itName}</td>
      <td>${item.boothCode}</td>
      <td>${item.transaction}</td>
    </tr>`;
    approvedTbody.innerHTML += row;
  });

  // Populate Denied Table
  const deniedTbody = document.querySelector("#deniedTable tbody");
  deniedTbody.innerHTML = "";
  data.denied.forEach(item => {
    const row = `<tr>
      <td>${item.itName}</td>
      <td>${item.boothCode}</td>
      <td>${item.transaction}</td>
    </tr>`;
    deniedTbody.innerHTML += row;
  });

  // Merge all for chart
  const allItems = [
    ...data.recentCancellation,
    ...data.approved,
    ...data.denied,
  ];
  console.log("📊 All items merged for chart:", allItems);

  renderChart(allItems);
}

  function renderChart(data) {
    const ctx = document.getElementById("statusChart").getContext("2d");

    new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Recent Cancellations", "Approved", "Denied"],
        datasets: [{
          data: [
            data.recentCancellation.length,
            data.approved.length,
            data.denied.length
          ],
          backgroundColor: ["#4caf50", "#2196f3", "#f44336"],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          title: { display: true, text: "Transaction Status Distribution" },
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

 document.addEventListener("DOMContentLoaded", function () {
  populateTables();
});


