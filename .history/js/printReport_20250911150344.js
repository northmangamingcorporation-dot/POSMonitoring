// PRINT A SINGLE CARD using a hidden iframe (more robust than opening new window)
function printReport(card) {
  if (!card) return;

  // clone card so we don't mutate the app UI
  const clone = card.cloneNode(true);

  // remove interactive controls that shouldn't be printed
  clone.querySelectorAll('.btn-edit, .btn-delete, .btn-print, .view-details-btn, a.view-details-btn, button')
    .forEach(el => el.remove());

  // remove empty absolute overlays that may now be orphaned
  clone.querySelectorAll('.absolute').forEach(el => {
    if (!el.querySelector('img')) el.remove();
  });

  // Build printable HTML
  const printBody = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Print Report</title>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet"/>
        <style>
          body { background:#fff; color:#111; padding:20px; -webkit-print-color-adjust:exact; }
          .report-card { max-width:900px; margin:0 auto; box-shadow:none; border:none; }
          img { max-width:100%; height:auto; display:block; }
          /* hide any accidental interactive elements */
          a, button { display:none !important; }
        </style>
      </head>
      <body>
        <div class="report-card">
          ${clone.outerHTML}
        </div>
      </body>
    </html>
  `;

  // create hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.setAttribute('aria-hidden', 'true');

  document.body.appendChild(iframe);

  // helper to call print when images ready
  function triggerPrint(win) {
    try {
      win.focus();
      win.print();
    } catch (err) {
      console.error('Print failed:', err);
    } finally {
      // remove iframe after a short delay (give browser time to open dialog)
      setTimeout(() => {
        try { document.body.removeChild(iframe); } catch (e) {}
      }, 500);
    }
  }

  // write content using srcdoc if available (simpler)
  if ('srcdoc' in iframe) {
    iframe.onload = () => {
      const iw = iframe.contentWindow;
      const idoc = iframe.contentDocument;
      // wait for images to load inside iframe before printing
      const imgs = Array.from(idoc.images || []);
      if (imgs.length === 0) return triggerPrint(iw);

      let loaded = 0;
      const onload = () => {
        loaded++;
        if (loaded === imgs.length) triggerPrint(iw);
      };
      // if images are already complete, count them
      imgs.forEach(img => {
        if (img.complete) onload();
        else img.addEventListener('load', onload, { once: true });
        img.addEventListener('error', onload, { once: true }); // treat errors as loaded to avoid hang
      });

      // safety: fallback to print after 2s if something weird happens
      setTimeout(() => triggerPrint(iw), 2000);
    };

    iframe.srcdoc = printBody;
  } else {
    // fallback for older browsers: write to document
    const idoc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
    idoc.open();
    idoc.write(printBody);
    idoc.close();

    // wait for load, then same image-wait logic
    iframe.onload = () => {
      const iw = iframe.contentWindow;
      const imgs = Array.from(idoc.images || []);
      if (imgs.length === 0) return triggerPrint(iw);

      let loaded = 0;
      const onload = () => {
        loaded++;
        if (loaded === imgs.length) triggerPrint(iw);
      };
      imgs.forEach(img => {
        if (img.complete) onload();
        else img.addEventListener('load', onload, { once: true });
        img.addEventListener('error', onload, { once: true });
      });
      setTimeout(() => triggerPrint(iw), 2000);
    };
  }
}

// expose globally (if needed)
window.printReport = printReport;
