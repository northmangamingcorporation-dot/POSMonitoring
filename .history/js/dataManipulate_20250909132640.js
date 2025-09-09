// ---------------------------
// Cache for sheet data
// ---------------------------
async function getSheetData(sheetName) {
            console.log(`Fetching data for sheet: ${sheetName}`);

            try {
                const token = await ensureAccessToken(); // ✅ always valid
                const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}`;

                let res = await fetch(url, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                // If unauthorized, try silent refresh once more
                if (res.status === 401) {
                    console.warn("Access token invalid, retrying with silent refresh...");
                    const refreshed = await attemptSilentAuth();
                    if (!refreshed) {
                        showAuthModal();
                        return [];
                    }
                    res = await fetch(url, {
                        headers: {
                            "Authorization": `Bearer ${accessToken}`
                        }
                    });
                }

                if (!res.ok) {
                    console.error(`Failed to fetch sheet data: ${res.status} ${res.statusText}`);
                    return [];
                }

                const data = await res.json();
                console.log("Sheet data received:", data);
                sheetDataCache[sheetName] = data.values || [];
                return sheetDataCache[sheetName];
            } catch (err) {
                console.error("Error fetching sheet data:", err);
                return [];
            } finally {

            }
        }

// ---------------------------
// Append row
// ---------------------------
async function appendRow(sheetName, values) {
  try {
    if (!accessToken) throw new Error("No access token");

    // 1️⃣ Fetch existing sheet data
    const existingData = await getSheetData(sheetName);
    const headers = existingData[0] || [];
    const rows = existingData.slice(1);

    // 2️⃣ Build unique key (example: join all values OR specific columns)
    const newKey = values.join("|");
    const existingKeys = rows.map(r => r.join("|"));

    if (existingKeys.includes(newKey)) {
      console.warn(`⏩ Skipping duplicate row in ${sheetName}:`, values);
      return; // ✅ Don’t append duplicate
    }

    // 3️⃣ Append only if not duplicate
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

    await logChange("ADD", sheetName, values);
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
