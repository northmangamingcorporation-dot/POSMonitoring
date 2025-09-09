class AuthModal extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>
        #authModal {
          display: none;
          position: fixed; top:0; left:0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.6);
          display: flex; justify-content: center; align-items: center;
          z-index: 1000;
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

          <!-- ✅ Button with fixed ID -->
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
  
  this.show = () => (modal.style.display = "flex");
  this.hide = () => (modal.style.display = "none");

}

}

customElements.define("auth-modal", AuthModal);
