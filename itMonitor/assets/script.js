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
    const data = await fetchFirestoreData();

    const cancelBody = document.querySelector("#cancelTable tbody");
    const approvedBody = document.querySelector("#approvedTable tbody");
    const deniedBody = document.querySelector("#deniedTable tbody");

    cancelBody.innerHTML = "";
    approvedBody.innerHTML = "";
    deniedBody.innerHTML = "";

    data.recentCancellation.forEach(item => {
      cancelBody.innerHTML += `
        <tr>
          <td>${item.boothCode}</td>
          <td>${item.deviceId}</td>
          <td>${item.transaction}</td>
          <td>${item.coords}</td>
          <td>${item.address}</td>
          <td>${item.total}</td>
        </tr>`;
    });

    data.approved.forEach(item => {
      approvedBody.innerHTML += `
        <tr>
          <td>${item.itName}</td>
          <td>${item.boothCode}</td>
          <td>${item.transaction}</td>
        </tr>`;
    });

    data.denied.forEach(item => {
      deniedBody.innerHTML += `
        <tr>
          <td>${item.itName}</td>
          <td>${item.boothCode}</td>
          <td>${item.transaction}</td>
        </tr>`;
    });

    document.getElementById("recentCount").textContent = data.recentCancellation.length;
    document.getElementById("approvedCount").textContent = data.approved.length;
    document.getElementById("deniedCount").textContent = data.denied.length;

    renderChart(data);
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

  document.addEventListener("DOMContentLoaded", populateTables);

