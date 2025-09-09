// ------------------- Auth Config -------------------
const CLIENT_ID = "900901251874-tlbsv8ph1rfcmtnk77pqm5dkqptip0ic.apps.googleusercontent.com";
const SPREADSHEET_ID = "1VWPTrBlRIWOBHHIFttTUZH5mDnbKvieyR_gZOHsrNQQ";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";

let tokenClient;
let accessToken;
let tokenExpiry = 0;
let checkInterval;
let isModalVisible = false; // prevent multiple modal shows

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
    hideModal();
    loadUserProfile();
    loadSheetsAfterAuth();
    startTokenCheckInterval();
  } else {
    showModal();
  }
}

// Wait for DOM before attaching listener
document.addEventListener("DOMContentLoaded", () => {
  const modal = window.top?.document.querySelector("auth-modal");
  if (!modal) return;

  modal.addEventListener("authorize-clicked", () => {
    if (!tokenClient) {
      console.warn("⚠️ tokenClient not ready yet");
      return;
    }
    tokenClient.requestAccessToken({ prompt: "consent" });
  });
});

// ------------------- Handle new tokens -------------------
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

  loadUserProfile();
  loadSheetsAfterAuth();
  startTokenCheckInterval();
}

// ------------------- Token Refresh -------------------
function startTokenCheckInterval() {
  if (checkInterval) clearInterval(checkInterval);
  checkInterval = setInterval(() => {
    if (isTokenExpired()) {
      console.log("Token expired or near expiry, refreshing silently...");
      tokenClient.requestAccessToken({ prompt: "" }); // silent refresh
    }
  }, 30 * 1000);
}

// ------------------- Token Utils -------------------
function isTokenExpired() {
  return !accessToken || Date.now() >= tokenExpiry - 5000;
}

async function ensureAccessToken() {
  if (!accessToken || isTokenExpired()) {
    showModal();
    console.log("Refreshing access token...");

    await new Promise((resolve, reject) => {
      tokenClient.requestAccessToken({
        prompt: "",
        callback: (resp) => {
          if (resp.error) {
            console.error("Silent refresh failed:", resp);
            reject(new Error("Silent refresh failed"));
          } else {
            accessToken = resp.access_token;
            tokenExpiry = Date.now() + resp.expires_in * 1000;
            sessionStorage.setItem("gsheets_access_token", accessToken);
            sessionStorage.setItem("gsheets_token_expiry", tokenExpiry);
            resolve();
          }
        },
      });
    }).catch(() => {
      showModal();
      throw new Error("Cannot get access token");
    });
  }

  hideModal();
  return accessToken;
}

// ------------------- Modal Helpers -------------------
function showModal() {
  if (isModalVisible) return; // prevent multiple shows
  const modal = window.top?.document.querySelector("auth-modal");
  modal?.show();
  isModalVisible = true;
}

function hideModal() {
  const modal = window.top?.document.querySelector("auth-modal");
  modal?.hide();
  isModalVisible = false;
}
