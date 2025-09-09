function renderStatusToolbar(
  statusCounts, uniqueStatuses, statusIndex, headers,
  operatorCounts, uniqueOperators, operatorIndex
) {
  const sheetTitleEl = document.getElementById("sheetTitle");

  const prevStatusValue = document.getElementById("statusFilter")?.value || "";
  const prevOperatorValue = document.getElementById("operatorFilter")?.value || "";

  const existingToolbar = document.getElementById("statusToolbar");
  if (existingToolbar) existingToolbar.remove();

  const toolbar = document.createElement("div");
  toolbar.id = "statusToolbar";

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
  if (statusIndex !== undefined && uniqueStatuses.length > 0) {
    const filterRow = document.createElement("div");
    filterRow.className = "filter-row";

    const label = document.createElement("label");
    label.setAttribute("for", "statusFilter");
    label.textContent = "Filter by Status:";
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

    select.value = prevStatusValue;
    filterRow.appendChild(select);
    toolbar.appendChild(filterRow);
  }

  // --- Operator filter dropdown ---
  if (operatorIndex !== undefined && uniqueOperators.length > 0) {
    const filterRow = document.createElement("div");
    filterRow.className = "filter-row";

    const label = document.createElement("label");
    label.setAttribute("for", "operatorFilter");
    label.textContent = "Filter by Operator:";
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

    select.value = prevOperatorValue;
    filterRow.appendChild(select);
    toolbar.appendChild(filterRow);
  }

  sheetTitleEl.insertAdjacentElement("afterend", toolbar);
}
