function printReport(card) {
  if (!card) return;

  const clone = card.cloneNode(true);

  // remove controls
  clone.querySelectorAll('.btn-edit, .btn-delete, .btn-print, .view-details-btn, a.view-details-btn, button')
    .forEach(el => el.remove());

  // remove overlays
  clone.querySelectorAll('.absolute').forEach(el => {
    if (!el.querySelector('img')) el.remove();
  });

  // extract text
  const date = clone.querySelector('[data-field="date"]')?.innerText || "";
  const time = clone.querySelector('[data-field="time"]')?.innerText || "";
  const service = clone.querySelector('[data-field="serviceType"]')?.innerText || "";
  const location = clone.querySelector('[data-field="location"]')?.innerText || "";
  const description = clone.querySelector('[data-field="description"]')?.innerText || "";
  const remarks = clone.querySelector('[data-field="remarks"]')?.innerText || "";

  // ✅ Only grab images that are not small avatars (exclude thumbnails)
  const images = Array.from(clone.querySelectorAll('img'))
    .filter(img => img.width > 100 || img.height > 100) // ignore small icons
    .map(img => img.src);

  const today = new Date().toLocaleDateString();

  const printBody = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>IT Department Accomplishment Report</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet"/>
        <style>
          body { background:#fff; color:#111; padding:40px; font-family:sans-serif; -webkit-print-color-adjust:exact; }
          .header { text-align:center; margin-bottom:30px; }
          .header h1 { font-size:1.5rem; font-weight:bold; text-transform:uppercase; }
          .header h2 { font-size:1.2rem; margin-top:5px; color:#374151; }
          .meta p { margin:4px 0; font-size:0.95rem; }
          .section { margin:20px 0; }
          .section h3 { font-size:1rem; font-weight:bold; border-bottom:1px solid #ddd; margin-bottom:10px; }
          .images { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-top:15px; }
          .images img { width:100%; height:200px; object-fit:cover; border:1px solid #ddd; border-radius:6px; }
          footer { margin-top:50px; font-size:0.85rem; text-align:center; }
          .signature { margin-top:60px; display:flex; justify-content:space-between; }
          .signature div { text-align:center; width:45%; }
          .signature-line { margin-top:60px; border-top:1px solid #000; padding-top:5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://via.placeholder.com/120x60?text=LOGO" alt="Company Logo" style="margin:0 auto 10px;"/>
          <h1>Northman Gaming Corporation</h1>
          <h2>IT Department</h2>
          <h2>Accomplishment Report</h2>
        </div>

        <div class="meta">
          <p><strong>Date Prepared:</strong> ${today}</p>
          <p><strong>Department:</strong> Information Technology</p>
        </div>

        <div class="section">
          <h3>Report Details</h3>
          <p><strong>Date of Activity:</strong> ${date} ${time}</p>
          <p><strong>Service Type:</strong> ${service}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Remarks:</strong> ${remarks}</p>
        </div>

        <div class="section">
          <h3>Photo Documentation</h3>
          <div class="images">
            ${images.map(src => `<img src="${src}" alt="Activity photo"/>`).join("")}
          </div>
        </div>

        <div class="signature">
          <div>
            <div class="signature-line">Prepared By</div>
          </div>
          <div>
            <div class="signature-line">Approved By</div>
          </div>
        </div>

        <footer>
          <p>Northman Gaming Corporation &copy; ${new Date().getFullYear()}</p>
        </footer>
      </body>
    </html>
  `;

  // print in iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  iframe.srcdoc = printBody;

  iframe.onload = () => {
    const iw = iframe.contentWindow;
    iw.focus();
    iw.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };
}

window.printReport = printReport;
