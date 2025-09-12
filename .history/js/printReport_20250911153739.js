// Robust printReport: prints a nicely formatted IT Accomplishment Report.
// Usage: printReport(cardElement) or printReport(selectorString)
function printReport(card) {
  try {
    // resolve card parameter
    const cardEl = (typeof card === 'string') ? document.querySelector(card) : card;
    if (!cardEl) {
      console.error('printReport: card element not found or not provided.');
      return;
    }

    // Extract textual fields (adapt selectors if yours differ)
    const date = (cardEl.querySelector('.fa-calendar')?.nextSibling?.textContent || '').trim();
    const time = (cardEl.querySelector('span.text-xs')?.textContent || '').trim();
    const serviceType = (cardEl.querySelector('.report-title')?.textContent || '').trim();
    const location = (cardEl.querySelector('p.text-sm')?.innerText || '').replace('📍','').trim();
    const description = (cardEl.querySelector('.report-desc')?.textContent || '').trim();

    // Collect images from the card but exclude tiny thumbnail avatars.
    // Prefer images with naturalWidth > 100 if available; otherwise skip first (cover).
    const imgs = Array.from(cardEl.querySelectorAll('img'));
    const images = imgs
      .filter(img => {
        // if naturalWidth available, filter by that; else keep images that are not tiny in layout
        try {
          if (img.naturalWidth && img.naturalWidth > 100) return true;
        } catch (e) {}
        // fallback: exclude images with small CSS sizes (likely thumbnails)
        const w = img.width || 0;
        const h = img.height || 0;
        if (w > 80 || h > 80) return true;
        return false;
      })
      .map(img => img.src)
      .filter(Boolean);

    // If the card used a cover image and you want to exclude it from the photo grid,
    // remove the first item (cover) and keep the rest for the grid:
    // (This preserves the cover only in the header if you want)
    const cover = images.length ? images[0] : null;
    const photoGrid = images.slice(1); // skip first to avoid duplication of cover

    // Build printable HTML (responsive to paper size; uses mm margins)
    const printHtml = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>IT Accomplishment Report</title>
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
<style>
    body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    padding: var(--pad);
    -webkit-print-color-adjust: exact;
    color: #111;
    font-size: 11pt;
    line-height: 1.4;
    }

  .container { width: 100%; margin: 0 auto; }
  h1 { font-size: 18pt; margin: 0; }
  h2 { font-size: 14pt; margin: 6px 0 12px; color: #374151; }
  .meta { margin-bottom: 10px; }
  .meta p { margin: 4px 0; }
  .section { margin: 10px 0; page-break-inside: avoid; }
  .photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
    margin-top: 10px;
  }
  .photo-grid img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    display:block;
  }
  .cover {
    width: 100%;
    height: 220px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    display:block;
    margin-bottom: 12px;
  }
  .signature { margin-top: 28mm; display:flex; justify-content:space-between; page-break-inside: avoid; }
  .signature .box { width: 45%; text-align:center; }
  .signature .line { margin-top: 48px; border-top: 1px solid #000; }
  /* avoid breaking small blocks across pages */
  .report-section { orphans: 3; widows: 3; page-break-inside: avoid; }
</style>
</head>
<body>
  <div class="container">
    <div style="text-align:center;">
      <h1>Northman Gaming Corporation</h1>
      <h2>IT Department — Accomplishment Report</h2>
    </div>

    <div class="meta report-section">
      <p><strong>Date Prepared:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Date of Activity:</strong> ${escapeHtml(date)} ${escapeHtml(time)}</p>
      <p><strong>Service Type:</strong> ${escapeHtml(serviceType)}</p>
      <p><strong>Location:</strong> ${escapeHtml(location)}</p>
    </div>

    <div class="section report-section">
      <h3 style="font-weight:600;margin-bottom:6px;">Description</h3>
      <div>${escapeHtml(description).replace(/\n/g,'<br>') || '&nbsp;'}</div>
    </div>

    <div class="section report-section">
      <h3 style="font-weight:600;margin-bottom:6px;">Photo Documentation</h3>
      <div class="photo-grid">
        ${photoGrid.map(src => `<img src="${src}">`).join('') || '<div style="color:#666">No additional photos</div>'}
      </div>
    </div>

    <div class="signature">
      <div class="box">
        <div class="line"></div>
        <div>Prepared By</div>
      </div>
      <div class="box">
        <div class="line"></div>
        <div>Approved By</div>
      </div>
    </div>

    <div style="text-align:center;margin-top:10px;color:#666;font-size:9pt;">
      Northman Gaming Corporation &copy; ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>`;


    // create hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('aria-hidden', 'true');

    document.body.appendChild(iframe);

    // Use srcdoc if available (clean)
    if ('srcdoc' in iframe) {
      iframe.srcdoc = printHtml;
      // when iframe loads, wait for images to be ready, then call print
      iframe.onload = () => {
        waitForIframeImagesAndPrint(iframe, 3000);
      };
    } else {
      // fallback
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(printHtml);
      doc.close();
      iframe.onload = () => {
        waitForIframeImagesAndPrint(iframe, 3000);
      };
    }

    // helper: wait until images inside iframe are complete (or timeout)
    function waitForIframeImagesAndPrint(ifr, timeout = 3000) {
      try {
        const idoc = ifr.contentDocument || ifr.contentWindow.document;
        const imgs = Array.from(idoc.images || []);
        if (imgs.length === 0) {
          triggerPrint();
          return;
        }
        let loaded = 0;
        let done = false;
        const onLoaded = () => {
          if (done) return;
          loaded++;
          if (loaded === imgs.length) {
            done = true;
            triggerPrint();
          }
        };
        imgs.forEach(img => {
          if (img.complete) onLoaded();
          else {
            img.addEventListener('load', onLoaded, { once: true });
            img.addEventListener('error', onLoaded, { once: true }); // count errors as loaded
          }
        });
        // fallback timeout
        setTimeout(() => { if (!done) { done = true; triggerPrint(); } }, timeout);
      } catch (err) {
        console.error('printReport: error waiting images', err);
        triggerPrint();
      }

      function triggerPrint() {
        try {
          const win = ifr.contentWindow;
          win.focus();
          win.print();
        } catch (e) {
          console.error('printReport: print failed', e);
          alert('Unable to open print dialog. Please try again or enable popups.');
        } finally {
          setTimeout(() => {
            try { document.body.removeChild(iframe); } catch (e) {}
          }, 500);
        }
      }
    }

    // small helper to HTML-escape inserted text
    function escapeHtml(s) {
      if (s == null) return '';
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

  } catch (err) {
    console.error('printReport error:', err);
    alert('An error occurred while preparing the print. Check console for details.');
  }
}

// expose globally
window.printReport = printReport;
