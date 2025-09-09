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
    callback: handleNewToken , // fallback
  });
}

// Fallback token handler for external triggers
function handleNewToken(tokenResponse) {
  if (!tokenResponse) return;

  if (tokenResponse.error) {
    console.error("Auth error:", tokenResponse);
    showModal();
    return;
  }

  accessToken = tokenResponse.access_token;
  tokenExpiry = Date.now() + tokenResponse.expires_in * 1000;

  // Save to sessionStorage
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

// ------------------- Get Access Token -------------------
async function getAccessTokenInteractive() {
  return new Promise((resolve, reject) => {
    showModal();
    tokenClient.requestAccessToken({
      prompt: "consent",
      callback: (resp) => {
        if (resp.error) {
          reject(resp.error);
        } else {
          accessToken = resp.access_token;
          tokenExpiry = Date.now() + resp.expires_in * 1000;
          sessionStorage.setItem("gsheets_access_token", accessToken);
          sessionStorage.setItem("gsheets_token_expiry", tokenExpiry);
          hideModal();
          resolve(accessToken);
        }
      },
    });
  });
}

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
  const savedToken = sessionStorage.getItem("gsheets_access_token");
  const savedExpiry = sessionStorage.getItem("gsheets_token_expiry");

  if (savedToken && savedExpiry && Date.now() < parseInt(savedExpiry, 10)) {
    accessToken = savedToken;
    tokenExpiry = parseInt(savedExpiry, 10);
  }

  if (!accessToken) {
    console.log("No access token, requesting user consent...");
    return await getAccessTokenInteractive();
  }

  if (isTokenExpired()) {
    console.log("Token expired or near expiry, trying silent refresh...");
    try {
      return await refreshAccessTokenSilent();
    } catch (err) {
      console.warn("Silent refresh failed, asking for consent...");
      return await getAccessTokenInteractive();
    }
  }

  return accessToken;
}
