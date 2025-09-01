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
  statusCounts, uniqueStatuses, statusIndex, headers,
  operatorCounts, uniqueOperators, operatorIndex
) {
  const sheetTitleEl = document.getElementById("sheetTitle");

  // Keep previous selections
  const prevStatusValue = document.getElementById("statusFilter")?.value || "";
  const prevOperatorValue = document.getElementById("operatorFilter")?.value || "";

  // Remove previous toolbar
  const existingToolbar = document.getElementById("statusToolbar");
  if (existingToolbar) existingToolbar.remove();

  const toolbar = document.createElement("div");
  toolbar.id = "statusToolbar";
  toolbar.style.display = "flex";
  toolbar.style.flexDirection = "column";
  toolbar.style.gap = "6px";
  toolbar.style.marginTop = "8px";

  // --- Status badges row (use passed statusCounts) ---
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
  if (statusIndex !== undefined && uniqueStatuses.length > 0) {
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

    uniqueStatuses.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      select.appendChild(opt);
    });

    // restore previous selection
    select.value = prevStatusValue;

    filterRow.appendChild(select);
    toolbar.appendChild(filterRow);
  }

  // --- Operator filter dropdown ---
  if (operatorIndex !== undefined && uniqueOperators.length > 0) {
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

    uniqueOperators.forEach(op => {
      const opt = document.createElement("option");
      opt.value = op;
      opt.textContent = op;
      select.appendChild(opt);
    });

    // restore previous selection
    select.value = prevOperatorValue;

    filterRow.appendChild(select);
    toolbar.appendChild(filterRow);
  }

  // Insert toolbar after the title
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
  const allStatuses = new Set();   // store ALL seen statuses
  const allOperators = new Set();  // store ALL seen operators

  // ✅ Single loop for filtering + counting
  Array.from(tbody.rows).forEach(row => {
    const statusCell = row.cells[statusColIndex]?.innerText.trim();
    const operatorCell = row.cells[operatorColIndex]?.innerText.trim();

    if (statusCell) allStatuses.add(statusCell);
    if (operatorCell) allOperators.add(operatorCell);

    const statusMatch = !statusValue || statusCell === statusValue;
    const operatorMatch = !operatorValue || operatorCell === operatorValue;

    if (statusMatch && operatorMatch) {
      row.style.display = "";

      // Count visible rows only
      if (statusCell) {
        statusCounts[statusCell] = (statusCounts[statusCell] || 0) + 1;
      }
      if (operatorCell) {
        operatorCounts[operatorCell] = (operatorCounts[operatorCell] || 0) + 1;
      }
    } else {
      row.style.display = "none";
    }
  });

  // ✅ Always pass ALL options, not just filtered ones
  renderStatusToolbar(
    statusCounts,
    Array.from(allStatuses),   // full list
    statusColIndex,
    headers,
    operatorCounts,
    Array.from(allOperators),  // full list
    operatorColIndex
  );

  // ✅ Restore dropdown selections
  if (document.getElementById("statusFilter"))
    document.getElementById("statusFilter").value = statusValue;
  if (document.getElementById("operatorFilter"))
    document.getElementById("operatorFilter").value = operatorValue;

  showLoader(false); // hide loader
}












