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
  toolbar.style.gap = "12px";
  toolbar.style.marginTop = "16px";
  toolbar.style.padding = "16px";
  toolbar.style.borderRadius = "12px";
  toolbar.style.background = "linear-gradient(145deg, #111, #1a1a1a)";
  toolbar.style.boxShadow = "0 4px 12px rgba(0,0,0,0.5)";
  toolbar.style.color = "#f1f5f9";

  // --- Status badges row ---
  const badgesRow = document.createElement("div");
  badgesRow.className = "status-info";
  badgesRow.style.display = "flex";
  badgesRow.style.flexWrap = "wrap";
  badgesRow.style.gap = "8px";

  Object.entries(statusCounts).forEach(([s, c]) => {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = `${s}: ${c}`;
    badge.style.background = "#2563eb20"; // subtle blue tint
    badge.style.color = "#93c5fd";
    badge.style.border = "1px solid #2563eb";
    badge.style.borderRadius = "8px";
    badge.style.padding = "4px 10px";
    badge.style.fontSize = "13px";
    badge.style.fontWeight = "500";
    badgesRow.appendChild(badge);
  });
  toolbar.appendChild(badgesRow);

  // Helper: create modern filter row
  function createFilterRow(labelText, selectId, options, prevValue) {
    const filterRow = document.createElement("div");
    filterRow.style.display = "flex";
    filterRow.style.alignItems = "center";
    filterRow.style.gap = "8px";

    const label = document.createElement("span");
    label.textContent = labelText;
    label.style.fontWeight = "600";
    label.style.fontSize = "14px";
    filterRow.appendChild(label);

    const select = document.createElement("select");
    select.id = selectId;
    select.onchange = () => filterByStatusAndOperator();
    select.style.padding = "6px 12px";
    select.style.border = "1px solid #333";
    select.style.borderRadius = "8px";
    select.style.background = "#1e293b";
    select.style.color = "#f1f5f9";
    select.style.fontSize = "13px";
    select.style.cursor = "pointer";
    select.style.outline = "none";
    select.style.transition = "all 0.2s ease";

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All";
    select.appendChild(allOption);

    options.forEach(op => {
      const opt = document.createElement("option");
      opt.value = op;
      opt.textContent = op;
      select.appendChild(opt);
    });

    // restore previous selection
    select.value = prevValue;

    // hover/focus styling
    select.onmouseover = () => (select.style.borderColor = "#2563eb");
    select.onmouseout = () => (select.style.borderColor = "#333");
    select.onfocus = () => {
      select.style.borderColor = "#2563eb";
      select.style.boxShadow = "0 0 0 2px rgba(37,99,235,0.4)";
    };
    select.onblur = () => {
      select.style.borderColor = "#333";
      select.style.boxShadow = "none";
    };

    filterRow.appendChild(select);
    return filterRow;
  }

  // --- Status filter dropdown ---
  if (statusIndex !== undefined && uniqueStatuses.length > 0) {
    toolbar.appendChild(
      createFilterRow("Filter by Status:", "statusFilter", uniqueStatuses, prevStatusValue)
    );
  }

  // --- Operator filter dropdown ---
  if (operatorIndex !== undefined && uniqueOperators.length > 0) {
    toolbar.appendChild(
      createFilterRow("Filter by Operator:", "operatorFilter", uniqueOperators, prevOperatorValue)
    );
  }

  // Insert toolbar after the title
  sheetTitleEl.insertAdjacentElement("afterend", toolbar);
}
