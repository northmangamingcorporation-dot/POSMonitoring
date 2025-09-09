// js/auth-modal.js
class AuthModal extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>
        #authModal {
    display: none; /* hidden by default */
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.6);
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  #authModal.show {
    display: flex; /* only when showing */
  }

  .modal-box {
    background: white;
    padding: 32px;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
    text-align: center;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    font-family: Arial, sans-serif;
    pointer-events: auto; /* ensure clicks reach the modal box */
  }

        button {
          display:flex; align-items:center; justify-content:center;
          gap:8px; padding:10px 16px;
          border:none; border-radius:6px;
          background:white; color:#444;
          font-weight:bold; cursor:pointer;
          box-shadow:0 2px 6px rgba(0,0,0,0.2);
          width:100%;
        }
        button:hover { background:#f5f5f5; }
      </style>

      <div id="authModal">
        <div class="modal-box">
          <h1>Sign In</h1>
          <p>You need to authorize Google Sheets access to continue.</p>
          <img src="image/cancellationlogo.jpg" alt="Website Logo" width="200" style="margin-bottom:16px;">

          <button id="modalAuthorizeBtn">
            <img src="image/google.png" alt="Google Logo" width="20" height="20">
            Sign in with Google
          </button>

          <p style="margin-top:16px; font-size:12px; color:#888;">
            Your data will not be shared publicly.
          </p>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    const modal = this.shadowRoot.getElementById("authModal");
    const btn = this.shadowRoot.getElementById("modalAuthorizeBtn");

    this.show = () => (modal.style.display = "flex");
    this.hide = () => (modal.style.display = "none");

    // Promise to resolve when user clicks and signs in
    this.getToken = () => {
      return new Promise((resolve, reject) => {
        this.show();

        btn.onclick = () => {
          if (!tokenClient) return reject("tokenClient not initialized");

          // Request token
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

                this.hide();
                resolve(accessToken);
              }
            },
          });
        };
      });
    };
  }
}

customElements.define("auth-modal", AuthModal);
