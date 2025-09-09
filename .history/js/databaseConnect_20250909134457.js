// ------------------- Auth Config -------------------
const CLIENT_ID = "900901251874-tlbsv8ph1rfcmtnk77pqm5dkqptip0ic.apps.googleusercontent.com";
const SPREADSHEET_ID = "1VWPTrBlRIWOBHHIFttTUZH5mDnbKvieyR_gZOHsrNQQ";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";

let tokenClient;
let accessToken;
let tokenExpiry = 0;

// ------------------- GIS Setup -------------------
function initGIS() {
  console.log("✅ GIS Loaded, initializing tokenClient...");

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: handleNewToken, // fallback for any external triggers
  });
}

// ------------------- Fallback Token Handler -------------------
function handleNewToken(tokenResponse) {
  if (!tokenResponse) return;

  if (tokenResponse.error) {
    console.error("Auth error:", tokenResponse);
    showModal();
    return;
  }

  accessToken = tokenResponse.access_token;
  tokenExpiry = Date.now() + tokenResponse.expires_in * 1000;

  sessionStorage.setItem("gsheets_access_token", accessToken);
  sessionStorage.setItem("gsheets_token_expiry", tokenExpiry);

  hideModal();
  console.log("New token acquired via handleNewToken:", accessToken);
}

// ------------------- Token Utils -------------------
function isTokenExpired() {
  return !accessToken || Date.now() >= tokenExpiry - 5000;
}

// ------------------- Modal Helpers -------------------
function showModal() {
  const modal = window.top?.document.querySelector("auth-modal");
  modal?.show();
}

function hideModal() {
  const modal = window.top?.document.querySelector("auth-modal");
  modal?.hide();
}

// ------------------- Get Access Token via Modal -------------------
async function getAccessTokenViaModal() {
  const modal = window.top?.document.querySelector("auth-modal");
  if (!modal) throw new Error("Auth modal not found");

  // modal.getToken() is a method from your <auth-modal> class that returns a Promise
  return await modal.getToken();
}

// ------------------- Silent Refresh -------------------
async function refreshAccessTokenSilent() {
  return new Promise((resolve, reject) => {
    tokenClient.requestAccessToken({
      prompt: "", // silent
      callback: (resp) => {
        if (resp.error) {
          reject(resp.error);
        } else {
          accessToken = resp.access_token;
          tokenExpiry = Date.now() + resp.expires_in * 1000;
          sessionStorage.setItem("gsheets_access_token", accessToken);
          sessionStorage.setItem("gsheets_token_expiry", tokenExpiry);
          resolve(accessToken);
        }
      },
    });
  });
}

// ------------------- Ensure Access Token -------------------
async function ensureAccessToken() {
  // Load token from sessionStorage if available
  const savedToken = sessionStorage.getItem("gsheets_access_token");
  const savedExpiry = sessionStorage.getItem("gsheets_token_expiry");

  if (savedToken && savedExpiry && Date.now() < parseInt(savedExpiry, 10)) {
    accessToken = savedToken;
    tokenExpiry = parseInt(savedExpiry, 10);
  }

  if (!accessToken) {
    console.log("No access token, requesting user consent...");
    return await getAccessTokenViaModal();
  }

  if (isTokenExpired()) {
    console.log("Token expired or near expiry, trying silent refresh...");
    try {
      return await refreshAccessTokenSilent();
    } catch (err) {
      console.warn("Silent refresh failed, showing modal for consent...");
      return await getAccessTokenViaModal();
    }
  }

  return accessToken;
}
