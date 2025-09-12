function showReportDetails(report) {
  // Create modal container
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50";
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
      <button onclick="this.parentElement.parentElement.remove()" 
        class="absolute top-3 right-3 text-gray-500 hover:text-red-600">
        <i class="fas fa-times text-lg"></i>
      </button>
      
      <h2 class="text-xl font-bold text-gray-800 mb-4">${report.title}</h2>
      <p class="text-sm text-gray-600 mb-2"><i class="fas fa-calendar mr-2"></i>${report.date} - ${report.time}</p>
      <p class="text-sm text-gray-600 mb-4"><i class="fas fa-map-marker-alt mr-2"></i>${report.location}</p>
      
      <p class="text-gray-700 mb-4">${report.description}</p>
      
      <div class="grid grid-cols-2 gap-4">
        ${report.images.map(img => `
          <img src="${img}" class="w-full h-40 object-cover rounded shadow">
        `).join("")}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}
