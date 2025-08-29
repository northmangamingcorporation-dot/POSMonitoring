// Example dummy JSON
const data = {
  recentCancellation: [
    { boothCode:"B01", deviceId:"D123", transaction:"T001-ABC", coords:"7.07,125.61", address:"Tagum City", total:"₱500" },
    { boothCode:"B02", deviceId:"D124", transaction:"T002-XYZ", coords:"7.10,125.62", address:"Davao City", total:"₱750" }
  ],
  approved: [
    { itName:"Mark D", boothCode:"B03", transaction:"T003-OK" }
  ],
  denied: [
    { itName:"Jane S", boothCode:"B04", transaction:"T004-NO" }
  ]
};

// Fill tables
function populateTables(){
  const cancelBody = document.querySelector("#cancelTable tbody");
  const approvedBody = document.querySelector("#approvedTable tbody");
  const deniedBody = document.querySelector("#deniedTable tbody");

  data.recentCancellation.forEach(item=>{
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

  data.approved.forEach(item=>{
    approvedBody.innerHTML += `
      <tr>
        <td>${item.itName}</td>
        <td>${item.boothCode}</td>
        <td>${item.transaction}</td>
      </tr>`;
  });

  data.denied.forEach(item=>{
    deniedBody.innerHTML += `
      <tr>
        <td>${item.itName}</td>
        <td>${item.boothCode}</td>
        <td>${item.transaction}</td>
      </tr>`;
  });

  // Update counts
  document.getElementById("recentCount").textContent = data.recentCancellation.length;
  document.getElementById("approvedCount").textContent = data.approved.length;
  document.getElementById("deniedCount").textContent = data.denied.length;
}

document.addEventListener("DOMContentLoaded", populateTables);

document.addEventListener("DOMContentLoaded", () => {
  const recentCount = parseInt(document.getElementById("recentCount").textContent);
  const approvedCount = parseInt(document.getElementById("approvedCount").textContent);
  const deniedCount = parseInt(document.getElementById("deniedCount").textContent);

  const ctx = document.getElementById("statusChart").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Recent Cancellations", "Approved", "Denied"],
      datasets: [{
        data: [recentCount, approvedCount, deniedCount],
        backgroundColor: ["#4caf50", "#2196f3", "#f44336"], // green, blue, red
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        title: {
          display: true,
          text: "Transaction Status Distribution"
        },
        datalabels: {
          color: "#fff",        // white text
          font: {
            weight: "bold",
            size: 14
          },
          formatter: (value) => value // show numbers directly
        }
      }
    },
    plugins: [ChartDataLabels] // register plugin
  });
});
