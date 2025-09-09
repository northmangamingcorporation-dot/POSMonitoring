
// ------------------- Auth Config -------------------
const CLIENT_ID = "900901251874-tlbsv8ph1rfcmtnk77pqm5dkqptip0ic.apps.googleusercontent.com";
const SPREADSHEET_ID = "1VWPTrBlRIWOBHHIFttTUZH5mDnbKvieyR_gZOHsrNQQ";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";

let tokenClient;
let accessToken = null;
let tokenExpiry = 0;
let checkInterval = null;

// ------------------- GIS Setup -------------------
function initGIS() {
  console.log("✅ GIS Loaded, initializing tokenClient...");

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: handleNewToken,
  });

  // Try to reuse stored token
  const savedToken = sessionStorage.getItem("gsheets_access_token");
  const savedExpiry = sessionStorage.getItem("gsheets_token_expiry");

  if (savedToken && savedExpiry && Date.now() < parseInt(savedExpiry, 10)) {
    accessToken = savedToken;
    tokenExpiry = parseInt(savedExpiry, 10);
    document.querySelector("auth-modal")?.hide();
    loadUserProfile();
    loadSheetsAfterAuth();
    checkInterval = setInterval(checkTokenValidity, 30 * 1000);
  } else {
    document.querySelector("auth-modal")?.show();
  }
}
document.querySelector("auth-modal").addEventListener("authorize-clicked", () => {
  if (!tokenClient) {
    console.warn("⚠️ tokenClient not ready yet");
    return;
  }
  tokenClient.requestAccessToken({ prompt: "consent" });
});
const modal = document.querySelector("auth-modal");
modal.authorizeBtn.addEventListener("click", () => {
  tokenClient.requestAccessToken({ prompt: "consent" });
});

// ------------------- Handle new tokens -------------------
function handleNewToken(tokenResponse) {
  const modal = document.querySelector("auth-modal"); // ✅ always resolve fresh

  if (tokenResponse.error) {
    console.error("Auth error:", tokenResponse);
    modal?.show();
    return;
  }

  accessToken = tokenResponse.access_token;
  tokenExpiry = Date.now() + (tokenResponse.expires_in * 1000);

  sessionStorage.setItem("gsheets_access_token", accessToken);
  sessionStorage.setItem("gsheets_token_expiry", tokenExpiry);

  modal?.hide(); // ✅ close if available

  loadUserProfile();
  loadSheetsAfterAuth();

  if (checkInterval) clearInterval(checkInterval);
  checkInterval = setInterval(checkTokenValidity, 30 * 1000);
}


// ------------------- Token Refresh -------------------
function checkTokenValidity() {
  if (!accessToken || Date.now() >= tokenExpiry - 5000) {
    console.warn("Token expired or near expiry, refreshing...");
    tokenClient.requestAccessToken({ prompt: "" }); // silent refresh
  }
}

// ------------------- Token Utils -------------------
function isTokenExpired() {
  return !accessToken || Date.now() >= tokenExpiry - 5000;
}

async function ensureAccessToken() {
  if (!accessToken) {
    console.log("No access token, showing login modal...");
    modal.show();
    throw new Error("No access token");
  }

  if (isTokenExpired()) {
    console.log("Token expired, refreshing silently...");
    tokenClient.requestAccessToken({ prompt: "" });
    await new Promise((resolve) => setTimeout(resolve, 1000)); // small wait
    if (isTokenExpired()) {
      console.log("Silent refresh failed, showing login modal...");
      modal.show();
      throw new Error("Silent refresh failed");
    }
  }

  return accessToken;
}
