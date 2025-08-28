// ---------------------------
// Append row
// ---------------------------
async function appendRow(sheetName, values) {
  try {
    if (!accessToken) throw new Error("No access token");

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=RAW`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: [values] })
    });

    if (!res.ok) throw new Error(`Append failed: ${res.status} ${res.statusText}`);

    await logChange("ADD", sheetName, values); // Log the addition
    return getSheetData(sheetName);
  } catch (err) {
    console.error("Error appending row:", err);
  }
}

// ---------------------------
// Update row
// ---------------------------
async function updateRow(sheetName, rowIndex, values) {
  try {
    if (!accessToken) throw new Error("No access token");

    const range = `${sheetName}!A${rowIndex}`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: [values] })
    });

    if (!res.ok) throw new Error(`Update failed: ${res.status} ${res.statusText}`);

    await logChange("EDIT", sheetName, values, rowIndex); // Log the edit
    return getSheetData(sheetName);
  } catch (err) {
    console.error("Error updating row:", err);
  }
}

// ---------------------------
// Delete row
// ---------------------------
async function deleteRow(sheetName, rowIndex) {
  try {
    if (!accessToken) throw new Error("No access token");

    // Get sheet ID
    const sheetInfoUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets.properties`;
    const sheetInfoRes = await fetch(sheetInfoUrl, {
      headers: { "Authorization": `Bearer ${accessToken}` }
    });
    const sheetInfo = await sheetInfoRes.json();
    const sheet = sheetInfo.sheets.find(s => s.properties.title === sheetName);
    if (!sheet) throw new Error("Sheet not found");
    const sheetId = sheet.properties.sheetId;

    // Delete the row
    const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}:batchUpdate`;
    const batchRes = await fetch(batchUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1,
              endIndex: rowIndex
            }
          }
        }]
      })
    });

    if (!batchRes.ok) throw new Error(`Delete failed: ${batchRes.status} ${batchRes.statusText}`);

    await logChange("DELETE", sheetName, null, rowIndex); // Log the deletion
    return getSheetData(sheetName);
  } catch (err) {
    console.error("Error deleting row:", err);
  }
}

// ---------------------------
// Log changes with location, device info, username & email
// ---------------------------
async function logChange(action, sheetName, rowData, rowIndex) {
  try {
    if (!accessToken) throw new Error("No access token");

    const timestamp = new Date().toISOString();

    // Get username and email from your page (or replace with auth info)
    const userName = document.getElementById("userName")?.innerText || "Unknown User";
    const userEmail = document.getElementById("userEmail")?.innerText || "Unknown Email";
    const user = `${userName} (${userEmail})`;

    const deviceInfo = navigator.userAgent || "Unknown Device";

    const dataString = JSON.stringify(rowData);

    // Add userName and userEmail separately in the log for clarity
    const logValues = [[
      timestamp,
      userName,
      userEmail,
      deviceInfo,
      action,
      sheetName,
      rowIndex ?? "",
      dataString
    ]];

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Log:append?valueInputOption=RAW`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: logValues })
    });

    if (!res.ok) console.warn("Failed to log change:", res.status, res.statusText);

  } catch (err) {
    console.error("Error logging change:", err);
  }
}
