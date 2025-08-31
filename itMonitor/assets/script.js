 
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

    if (!f.rawData) return; // skip if no rawData

    try {
      const parsed = JSON.parse(f.rawData);

      if (parsed.RecentCancellationRequest) {
        data.recentCancellation.push({
          ...parsed.RecentCancellationRequest,
          status: "request"
        });
      } else if (parsed.RecentApprovedCancellationRequest) {
        data.approved.push({
          ...parsed.RecentApprovedCancellationRequest,
          status: "approved"
        });
      } else if (parsed.RecentDeniedCancellationRequest) {
        data.denied.push({
          ...parsed.RecentDeniedCancellationRequest,
          status: "denied"
        });
      }
    } catch (e) {
      console.error("Invalid JSON in rawData", f.rawData);
    }
  });

  return data;
}

  // Update dashboard cards + chart
    async function populateTables() {
      const data = await fetchFirestoreData();

      const canceled = data.recentCancellation.length;
      const approved = data.approved.length;
      const denied   = data.denied.length;

      // Update dashboard cards
      document.getElementById("recentCount").innerHTML = canceled;
      document.getElementById("approvedCount").innerHTML = approved;
      document.getElementById("deniedCount").innerHTML = denied;

      // ✅ Merge all for chart
      const allItems = [
        ...data.recentCancellation,
        ...data.approved,
        ...data.denied,
      ];

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


