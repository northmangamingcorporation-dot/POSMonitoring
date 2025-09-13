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

  // --- Status badges row ---
  const badgesRow = document.createElement("div");
  badgesRow.className = "status-info";
  Object.entries(statusCounts).forEach(([s, c]) => {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = `${s}: ${c}`;
    badge.style.cursor = "pointer";

    badge.addEventListener("click", () => {
      const statusSelect = document.getElementById("statusFilter");
      if (statusSelect) {
        // toggle behavior: if already selected, reset to All
        if (statusSelect.value === s) {
          statusSelect.value = "";
        } else {
          statusSelect.value = s;
        }
        statusSelect.dispatchEvent(new Event("change")); // trigger filter
      }
    });

    badgesRow.appendChild(badge);
  });
  toolbar.appendChild(badgesRow);

  // --- Combined filter row (one lane) ---
  const filterRow = document.createElement("div");
  filterRow.style.display = "flex";
  filterRow.style.alignItems = "center";
  filterRow.style.gap = "16px"; // space between filters

  // Status filter
  if (statusIndex !== undefined && uniqueStatuses.length > 0) {
    const statusLabel = document.createElement("span");
    statusLabel.textContent = "Status:";
    statusLabel.style.fontWeight = "bold";

    const statusSelect = document.createElement("select");
    statusSelect.id = "statusFilter";
    statusSelect.onchange = () => filterByStatusAndOperator();

    const allStatus = document.createElement("option");
    allStatus.value = "";
    allStatus.textContent = "All";
    statusSelect.appendChild(allStatus);

    uniqueStatuses.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      statusSelect.appendChild(opt);
    });

    // restore previous selection
    statusSelect.value = prevStatusValue;

    filterRow.appendChild(statusLabel);
    filterRow.appendChild(statusSelect);
  }

  // Operator filter
  if (operatorIndex !== undefined && uniqueOperators.length > 0) {
    const operatorLabel = document.createElement("span");
    operatorLabel.textContent = "Operator:";
    operatorLabel.style.fontWeight = "bold";

    const operatorSelect = document.createElement("select");
    operatorSelect.id = "operatorFilter";
    operatorSelect.onchange = () => filterByStatusAndOperator();

    const allOp = document.createElement("option");
    allOp.value = "";
    allOp.textContent = "All";
    operatorSelect.appendChild(allOp);

    uniqueOperators.forEach(op => {
      const opt = document.createElement("option");
      opt.value = op;
      opt.textContent = op;
      operatorSelect.appendChild(opt);
    });

    // restore previous selection
    operatorSelect.value = prevOperatorValue;

    filterRow.appendChild(operatorLabel);
    filterRow.appendChild(operatorSelect);
  }

  // Only add filterRow if it has filters
  if (filterRow.children.length > 0) {
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












