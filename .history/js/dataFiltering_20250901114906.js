// ---------------------------
// Green Device ID filter
// ---------------------------
function filterByGreenDeviceID() {
  const table = document.querySelector("#tableContainer table");
  if (!table) return;

  // Assuming Device ID column is already identified in the header
  const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.innerText.toLowerCase());
  const deviceColIndex = headers.findIndex(h => h.includes("device id"));
  if (deviceColIndex === -1) return;

  const rows = table.querySelectorAll("tbody tr");
  rows.forEach(row => {
    const cell = row.cells[deviceColIndex];
    if (!cell) return;

    // Check if cell has dark green background (inline style)
    const bgColor = window.getComputedStyle(cell).backgroundColor;
    // Approximate dark green: rgb(0, 128, 0)
    const isGreen = bgColor === "rgb(0, 128, 0)" || bgColor === "rgb(0, 100, 0)";
    
    row.style.display = isGreen ? "" : "none";
  });
}

function renderStatusToolbar(
  statusCounts, _, statusIndex, headers,
  operatorCounts, __, operatorIndex
) {
  const sheetTitleEl = document.getElementById("sheetTitle");

  const prevStatusValue = document.getElementById("statusFilter")?.value || "";
  const prevOperatorValue = document.getElementById("operatorFilter")?.value || "";

  const existingToolbar = document.getElementById("statusToolbar");
  if (existingToolbar) existingToolbar.remove();

  const toolbar = document.createElement("div");
  toolbar.id = "statusToolbar";
  toolbar.style.display = "flex";
  toolbar.style.flexDirection = "column";
  toolbar.style.gap = "6px";
  toolbar.style.marginTop = "8px";

  // --- Status badges row ---
  const badgesRow = document.createElement("div");
  badgesRow.className = "status-info";
  Object.entries(statusCounts).forEach(([s, c]) => {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = `${s}: ${c}`;
    badgesRow.appendChild(badge);
  });
  toolbar.appendChild(badgesRow);

  // --- Status filter dropdown ---
  if (statusIndex !== undefined && allStatuses.length > 0) {
    const filterRow = document.createElement("div");
    filterRow.style.display = "flex";
    filterRow.style.alignItems = "center";
    filterRow.style.gap = "8px";

    const label = document.createElement("span");
    label.textContent = "Filter by Status:";
    label.style.fontWeight = "bold";
    filterRow.appendChild(label);

    const select = document.createElement("select");
    select.id = "statusFilter";
    select.onchange = () => filterByStatusAndOperator();

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All";
    select.appendChild(allOption);

    allStatuses.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      select.appendChild(opt);
    });

    select.value = prevStatusValue;
    filterRow.appendChild(select);
    toolbar.appendChild(filterRow);
  }

  // --- Operator filter dropdown ---
  if (operatorIndex !== undefined && allOperators.length > 0) {
    const filterRow = document.createElement("div");
    filterRow.style.display = "flex";
    filterRow.style.alignItems = "center";
    filterRow.style.gap = "8px";

    const label = document.createElement("span");
    label.textContent = "Filter by Operator:";
    label.style.fontWeight = "bold";
    filterRow.appendChild(label);

    const select = document.createElement("select");
    select.id = "operatorFilter";
    select.onchange = () => filterByStatusAndOperator();

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All";
    select.appendChild(allOption);

    allOperators.forEach(op => {
      const opt = document.createElement("option");
      opt.value = op;
      opt.textContent = op;
      select.appendChild(opt);
    });

    select.value = prevOperatorValue;
    filterRow.appendChild(select);
    toolbar.appendChild(filterRow);
  }

  sheetTitleEl.insertAdjacentElement("afterend", toolbar);
}


function filterByStatusAndOperator() {
  showLoader(true); // show loader

  const table = document.querySelector("#tableContainer table");
  const tbody = table.querySelector("tbody");
  const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.innerText.toLowerCase());
  const statusColIndex = headers.findIndex(h => h.includes("status"));
  const operatorColIndex = headers.findIndex(h => h.includes("operator"));

  // ✅ Save current filter values
  const statusValue = document.getElementById("statusFilter")?.value || "";
  const operatorValue = document.getElementById("operatorFilter")?.value || "";

  // ✅ Prepare counts
  const statusCounts = {};
  const operatorCounts = {};
  const uniqueStatuses = new Set();
  const uniqueOperators = new Set();

  // ✅ Single loop for filtering + counting
  Array.from(tbody.rows).forEach(row => {
    const statusCell = row.cells[statusColIndex]?.innerText.trim();
    const operatorCell = row.cells[operatorColIndex]?.innerText.trim();

    const statusMatch = !statusValue || statusCell === statusValue;
    const operatorMatch = !operatorValue || operatorCell === operatorValue;

    if (statusMatch && operatorMatch) {
      row.style.display = "";

      // Count visible rows only
      if (statusCell) {
        statusCounts[statusCell] = (statusCounts[statusCell] || 0) + 1;
        uniqueStatuses.add(statusCell);
      }
      if (operatorCell) {
        operatorCounts[operatorCell] = (operatorCounts[operatorCell] || 0) + 1;
        uniqueOperators.add(operatorCell);
      }
    } else {
      row.style.display = "none";
    }
  });

  // ✅ Refresh toolbar
  renderStatusToolbar(
    statusCounts,
    Array.from(uniqueStatuses),
    statusColIndex,
    headers,
    operatorCounts,
    Array.from(uniqueOperators),
    operatorColIndex
  );

  // ✅ Restore dropdown selections (since re-render resets them)
  if (document.getElementById("statusFilter"))
    document.getElementById("statusFilter").value = statusValue;
  if (document.getElementById("operatorFilter"))
    document.getElementById("operatorFilter").value = operatorValue;

  showLoader(false); // hide loader
}













