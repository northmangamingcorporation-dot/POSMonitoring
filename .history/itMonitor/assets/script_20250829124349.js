// Sample JSON Data
const data = {
  recentRequest: [
    {
      BoothCode: "B001",
      DeviceID: "D-112",
      Transaction: "TXN-101 | CXL-001",
      Coordinates: "7.123, 125.456",
      Address: "Booth 1, City Center",
      Total: "₱1,250.00"
    }
  ],
  recentApproved: [
    { ITName: "John Doe", BoothCode: "B002", Transaction: "TXN-105 | CXL-002" }
  ],
  recentDenied: [
    { ITName: "Jane Smith", BoothCode: "B003", Transaction: "TXN-110 | CXL-003" }
  ]
};

function renderList(id, items, formatter) {
  const ul = document.getElementById(id);
  ul.innerHTML = items.map(formatter).join("");
}

renderList("recentRequest", data.recentRequest, item => `
  <li>
    <strong>Booth:</strong> ${item.BoothCode}<br>
    <strong>Device:</strong> ${item.DeviceID}<br>
    <strong>Transaction:</strong> ${item.Transaction}<br>
    <strong>Coordinates:</strong> ${item.Coordinates}<br>
    <strong>Address:</strong> ${item.Address}<br>
    <strong>Total:</strong> ${item.Total}
  </li>
`);

renderList("recentApproved", data.recentApproved, item => `
  <li>
    <strong>IT:</strong> ${item.ITName}<br>
    <strong>Booth:</strong> ${item.BoothCode}<br>
    <strong>Transaction:</strong> ${item.Transaction}
  </li>
`);

renderList("recentDenied", data.recentDenied, item => `
  <li>
    <strong>IT:</strong> ${item.ITName}<br>
    <strong>Booth:</strong> ${item.BoothCode}<br>
    <strong>Transaction:</strong> ${item.Transaction}
  </li>
`);
