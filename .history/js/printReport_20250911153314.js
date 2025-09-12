function printReport(card) {
  if (!card) return;

  // Extract fields from card
  const date = card.querySelector(".fa-calendar")?.nextSibling?.textContent.trim() || "";
  const time = card.querySelector("span.text-xs")?.textContent.trim() || "";
  const serviceType = card.querySelector(".report-title")?.textContent.trim() || "";
  const location = card.querySelector("p.text-sm")?.innerText.replace("📍","").trim() || "";
  const description = card.querySelector(".report-desc")?.textContent.trim() || "";

  // Collect all images inside the card (skip first thumbnail)
  const images = Array.from(card.querySelectorAll("img"))
    .slice(1)
    .map(img => img.src)
    .filter(Boolean);

  // Open new window
  const w = window.open("", "_blank", "noopener,width=900,height=700");
  if (!w) {
    alert("Popup blocked. Please allow popups for this site to print.");
    return;
  }

  // Write structured accomplishment report
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
            font-size: 12pt;
          }
          @page { 
            size: auto; /* let printer decide (A4/Letter/Legal) */
            margin: 20mm; 
          }
          .report-card { 
            width: 100%; 
            margin: 0 auto; 
          }
          h1, h2, h3 { text-align: center; }
          img { max-width: 100%; height: auto; display: block; }
          .photo-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); 
            gap: 10px; 
            margin-top: 15px; 
          }
          .photo-grid img { 
            width: 100%; 
            height: 160px; 
            object-fit: cover; 
            border-radius: 6px; 
          }
          .signature { 
            margin-top: 40mm; 
            display: flex; 
            justify-content: space-between; 
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
        </style>
      </head>
      <body>
        <div class="report-card">
          <h1 class="text-2xl font-bold mb-2">Northman Gaming Corporation</h1>
          <h2 class="text-xl font-semibold mb-4">IT Department Accomplishment Report</h2>
          <hr class="mb-6">

          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Service Type:</strong> ${serviceType}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Remarks:</strong> ____________________________</p>

          <h3 class="mt-6 mb-2 font-semibold">Photo Documentation</h3>
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

  // Print when ready
  w.onload = () => {
    w.print();
    try { w.close(); } catch (e) {}
  };
}

window.printReport = printReport;
