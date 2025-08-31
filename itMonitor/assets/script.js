 
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
  async function fetchFirestoreData() {
    const snapshot = await getDocs(collection(db, "webhooks"));
    const data = {
      recentCancellation: [],
      approved: [],
      denied: []
    };

    snapshot.forEach(doc => {
      const f = doc.data();
      if (f.type === "request") {
        data.recentCancellation.push({
          boothCode: f.boothcode || "",
          deviceId: f.deviceid || "",
          transaction: f.transactionnumber || "",
          coords: f.coordinates || "",
          address: f.boothaddress || "",
          total: f.totalamount || ""
        });
      } else if (f.type === "approved") {
        data.approved.push({
          itName: f.itname || "",
          boothCode: f.boothcode || "",
          transaction: f.transactionnumber || ""
        });
      } else if (f.type === "denied") {
        data.denied.push({
          itName: f.itname || "",
          boothCode: f.boothcode || "",
          transaction: f.transactionnumber || ""
        });
      }
    });

    return data;
  }

  // Then reuse your populateTables code:
  async function populateTables() {
    // Ensure data is always an array
    const items = Array.isArray(data) ? data : Object.values(data);

    // Count by status
    const canceled = items.filter(d => d.status === "pending" || d.status === "request").length;
    const approved = items.filter(d => d.status === "approved").length;
    const denied   = items.filter(d => d.status === "denied").length;

    // Update dashboard cards
    document.getElementById("recentCount").innerHTML = canceled;
    document.getElementById("approvedCount").innerHTML = approved;
    document.getElementById("deniedCount").innerHTML = denied;

    renderChart(items);
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


