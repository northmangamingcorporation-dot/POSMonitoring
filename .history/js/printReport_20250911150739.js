function printReport(card) {
  if (!card) return;

  // clone card so we don't mutate the UI
  const clone = card.cloneNode(true);

  // remove buttons/links
  clone.querySelectorAll('.btn-edit, .btn-delete, .btn-print, .view-details-btn, a.view-details-btn, button')
    .forEach(el => el.remove());
  clone.querySelectorAll('.absolute').forEach(el => {
    if (!el.querySelector('img')) el.remove();
  });

  // --- Formal Report Context ---
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
          .meta { margin-bottom:30px; }
          .meta p { margin:4px 0; font-size:0.9rem; }
          .report-card { max-width:900px; margin:20px auto; box-shadow:none; border:1px solid #ddd; border-radius:8px; overflow:hidden; }
          img { max-width:100%; height:auto; display:block; }
          footer { margin-top:50px; font-size:0.85rem; }
          .signature { margin-top:40px; display:flex; justify-content:space-between; }
          .signature div { text-align:center; width:45%; }
          .signature-line { margin-top:60px; border-top:1px solid #000; padding-top:5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <!-- optional logo -->
          <img src="https://via.placeholder.com/120x60?text=LOGO" alt="Company Logo" style="margin:0 auto 10px;"/>
          <h1>Northman Gaming Corporation</h1>
          <h2>IT Department</h2>
          <h2>Accomplishment Report</h2>
        </div>

        <div class="meta">
          <p><strong>Date Prepared:</strong> ${today}</p>
          <p><strong>Department:</strong> Information Technology</p>
          <p><strong>Prepared By:</strong> ____________________</p>
        </div>

        <div class="report-card">
          ${clone.outerHTML}
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

  // create hidden iframe (safe for printing)
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  // write to iframe
  iframe.srcdoc = printBody;

  iframe.onload = () => {
    const iw = iframe.contentWindow;
    iw.focus();
    iw.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };
}

window.printReport = printReport;
