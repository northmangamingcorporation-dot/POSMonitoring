// ------------------- Auth Config -------------------
const CLIENT_ID = "900901251874-tlbsv8ph1rfcmtnk77pqm5dkqptip0ic.apps.googleusercontent.com";
const SPREADSHEET_ID = "1VWPTrBlRIWOBHHIFttTUZH5mDnbKvieyR_gZOHsrNQQ";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";

let tokenClient;
let accessToken = null;
let tokenExpiry = 0;
let checkInterval = null;

// Find the modal component
const modal = document.querySelector("auth-modal");



// ------------------- GIS Setup -------------------
function initGIS() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (tokenResponse) => {
      handleNewToken(tokenResponse);
    },
  });

  // Try to reuse token from sessionStorage
  const savedToken = sessionStorage.getItem("gsheets_access_token");
  const savedExpiry = sessionStorage.getItem("gsheets_token_expiry");

  if (savedToken && savedExpiry && Date.now() < parseInt(savedExpiry, 10)) {
    accessToken = savedToken;
    tokenExpiry = parseInt(savedExpiry, 10);
    hideAuthModal();
    loadUserProfile();
    loadSheetsAfterAuth();
    checkInterval = setInterval(checkTokenValidity, 30 * 1000);
  } else {
    modal.show();
  }
}

// ------------------- Handle new tokens -------------------
function handleNewToken(tokenResponse) {
  if (tokenResponse.error) {
    console.error("Auth error:", tokenResponse);
    modal.show();
    return;
  }

  accessToken = tokenResponse.access_token;
  tokenExpiry = Date.now() + (tokenResponse.expires_in * 1000);

  sessionStorage.setItem("gsheets_access_token", accessToken);
  sessionStorage.setItem("gsheets_token_expiry", tokenExpiry);

  hideAuthModal();
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
