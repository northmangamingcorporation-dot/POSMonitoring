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

// ---------------------------
// Search filter
// ---------------------------
document.getElementById("searchInput").addEventListener("input", () => {
  const filter = document.getElementById("searchInput").value.trim().toLowerCase();
  const table = document.querySelector("#tableContainer table");
  if (!table) return;

  const rows = table.rows;
  const authorized = isUserAuthorized();

  for (let i = 1; i < rows.length; i++) { // skip header
    let match = false;

    // Check all cells except the last (Action)
    for (let j = 0; j < rows[i].cells.length - 1; j++) {
      if (rows[i].cells[j].textContent.toLowerCase().includes(filter)) {
        match = true;
        break;
      }
    }

    rows[i].style.display = match ? "" : "none";

    // Optionally, disable action buttons if unauthorized
    const actionBtns = rows[i].querySelectorAll(".action-buttons button");
    if (!authorized) {
      actionBtns.forEach(btn => {
        btn.disabled = true;
        btn.title = "Not authorized";
      });
      const addBtn = document.getElementById("addBtn");
      if (!addBtn) return;
      addBtn.disabled = true;
      addBtn.style.cursor = "not-allowed";
      addBtn.style.opacity = "0.6"; // visually show it’s disabled
    } else {
      actionBtns.forEach(btn => btn.disabled = false);
    }
  }
});

function renderStatusToolbar(statusCounts, uniqueStatuses, statusIndex, headers) {
  const sheetTitleEl = document.getElementById("sheetTitle");

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
  badgesRow.className = "status-info"; // your CSS class
  Object.entries(statusCounts).forEach(([s, c]) => {
    const badge = document.createElement("span");
    badge.className = "badge"; // uses your CSS
    badge.textContent = `${s}: ${c}`;
    badgesRow.appendChild(badge);
  });
  toolbar.appendChild(badgesRow);

  // --- Filter dropdown row ---
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
    select.onchange = () => {
      filterByStatus();
    };

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

    filterRow.appendChild(select);

    const filteredByLabel = document.createElement("span");
    filteredByLabel.id = "filteredByLabel";
    filteredByLabel.style.fontWeight = "bold";
    filterRow.appendChild(filteredByLabel);

    toolbar.appendChild(filterRow);
  }

  // --- Sorting dropdown row ---
  if (headers && headers.length > 0) {
    const sortRow = document.createElement("div");
    sortRow.style.display = "flex";
    sortRow.style.alignItems = "center";
    sortRow.style.gap = "8px";

    const sortLabel = document.createElement("span");
    sortLabel.textContent = "Sort by:";
    sortLabel.style.fontWeight = "bold";
    sortRow.appendChild(sortLabel);

    const sortSelect = document.createElement("select");
    sortSelect.id = "sortSelect";
    sortSelect.className = "status-filter";
    sortSelect.onchange = () => sortTableByColumn(sortSelect.value);

    const sortDefault = document.createElement("option");
    sortDefault.value = "";
    sortDefault.textContent = "None";
    sortSelect.appendChild(sortDefault);

    headers.forEach((h, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = h || `Column ${idx + 1}`;
      sortSelect.appendChild(opt);
    });

    sortRow.appendChild(sortSelect);
    toolbar.appendChild(sortRow);
  }

  // Insert toolbar after the title
  sheetTitleEl.insertAdjacentElement("afterend", toolbar);
}