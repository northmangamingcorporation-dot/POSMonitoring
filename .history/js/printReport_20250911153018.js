function printReport(card) {
  if (!card) return;

  // Extract details
  const date = card.querySelector(".fa-calendar")?.nextSibling?.textContent.trim() || "";
  const time = card.querySelector("span.text-xs")?.textContent.trim() || "";
  const serviceType = card.querySelector(".report-title")?.textContent.trim() || "";
  const location = card.querySelector("p.text-sm")?.innerText.replace("📍","").trim() || "";
  const description = card.querySelector(".report-desc")?.textContent.trim() || "";

  // Collect images (skip thumbnail)
  const images = Array.from(card.querySelectorAll("img"))
    .slice(1)
    .map(img => img.src)
    .filter(Boolean);

  // Open print window
  const w = window.open("", "_blank", "noopener,width=900,height=700");
  if (!w) {
    alert("Popup blocked. Please allow popups for this site to print.");
    return;
  }

  // Write document
  w.document.open();
  w.document.write(`
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>IT Accomplishment Report</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <style>
        body {
          background: #fff;
          padding: 20mm;
          -webkit-print-color-adjust: exact;
          font-family: sans-serif;
          font-size: 11pt;
          line-height: 1.5;
        }
        @page {
          size: auto; 
          margin: 20mm;
        }
        h1, h2, h3 { text-align: center; margin-bottom: 6px; }
        hr { margin: 12px 0; }
        
        /* Prevent awkward splits */
        .report-section { page-break-inside: avoid; margin-bottom: 12px; }
        p { margin: 4px 0; }
        
        /* Image grid auto-fits page */
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 8px;
          margin-top: 12px;
          page-break-inside: avoid;
        }
        .photo-grid img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 6px;
        }

        /* Signature placement */
        .signature {
          margin-top: 20mm;
          display: flex;
          justify-content: space-between;
          page-break-inside: avoid;
        }
        .signature div {
          text-align: center;
          width: 40%;
        }
        .signature hr {
          border: none;
          border-top: 1px solid #000;
          margin-bottom: 5px;
        }

        /* Prevent tiny leftover on new page */
        .report-card { orphans: 3; widows: 3; }
      </style>
    </head>
    <body>
      <div class="report-card">
        <h1 class="text-2xl font-bold">Northman Gaming Corporation</h1>
        <h2 class="text-xl font-semibold">IT Department Accomplishment Report</h2>
        <hr>

        <div class="report-section"><p><strong>Date:</strong> ${date}</p></div>
        <div class="report-section"><p><strong>Time:</strong> ${time}</p></div>
        <div class="report-section"><p><strong>Service Type:</strong> ${serviceType}</p></div>
        <div class="report-section"><p><strong>Location:</strong> ${location}</p></div>
        <div class="report-section"><p><strong>Description:</strong> ${description}</p></div>
        <div class="report-section"><p><strong>Remarks:</strong> ____________________________</p></div>

        <h3 class="mt-6 font-semibold">Photo Documentation</h3>
        <div class="photo-grid">
          ${images.map(src => `<img src="${src}">`).join("")}
        </div>

        <div class="signature">
          <div>
            <hr>
            <p>Prepared By</p>
          </div>
          <div>
            <hr>
            <p>Approved By</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
  w.document.close();

  w.onload = () => {
    w.print();
    try { w.close(); } catch (e) {}
  };
}

window.printReport = printReport;
