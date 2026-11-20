// ROADGUARD — Road Damage Reporting System
// CSE 326 CA1 Project

const STORAGE_KEY = "roadguard_reports";

const sampleReports = [
  {
    id: "RG-1024",
    title: "Deep pothole near bus stop",
    type: "Pothole",
    severity: "High",
    status: "Under Review",
    location: "Model Town Road, Jalandhar",
    description: "A deep pothole near the bus stop may create a hazard for two-wheelers.",
    reporter: "Demo Citizen",
    date: "2026-10-27",
    photo: ""
  },
  {
    id: "RG-1023",
    title: "Cracked road surface",
    type: "Road crack",
    severity: "Medium",
    status: "In Progress",
    location: "Phagwara Bypass",
    description: "Several cracks are spreading across the left lane.",
    reporter: "Demo Citizen",
    date: "2026-10-26",
    photo: ""
  },
  {
    id: "RG-1022",
    title: "Loose manhole cover",
    type: "Damaged manhole",
    severity: "High",
    status: "Submitted",
    location: "Near City Market, Jalandhar",
    description: "The manhole cover appears loose and may endanger passing vehicles.",
    reporter: "Demo Citizen",
    date: "2026-10-25",
    photo: ""
  },
  {
    id: "RG-1021",
    title: "Waterlogging after rain",
    type: "Waterlogging",
    severity: "Low",
    status: "Resolved",
    location: "College Road, Phagwara",
    description: "Water was collecting near the roadside drain.",
    reporter: "Demo Citizen",
    date: "2026-10-24",
    photo: ""
  }
];

// Load previously saved reports.
function loadReports() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? [...sampleReports] : JSON.parse(saved);
  } catch (error) {
    return [...sampleReports];
  }
}

let reports = loadReports();
let selectedPhoto = "";

// Save reports in this browser.
function saveReports() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

// Escape user-entered text before displaying it as HTML.
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

// CSS class helpers.
function statusClass(status) {
  return "status-" + status.toLowerCase().replaceAll(" ", "-");
}

function priorityClass(severity) {
  return "priority-" + severity.toLowerCase();
}

function damageIcon(type) {
  const icons = {
    "Pothole": "◉",
    "Road crack": "⌁",
    "Broken road surface": "▧",
    "Waterlogging": "≈",
    "Damaged manhole": "⊗",
    "Other hazard": "⚠"
  };

  return icons[type] || "⚠";
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date + "T00:00:00");

  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
}

function getSortedReports() {
  return [...reports].sort((a, b) =>
    (b.createdAt || b.date || "").localeCompare(
      a.createdAt || a.date || ""
    )
  );
}

// ------------------------------------------
// DASHBOARD STATISTICS
// ------------------------------------------

function renderStatistics() {
  document.getElementById("totalStat").textContent = reports.length;

  document.getElementById("reviewStat").textContent =
    reports.filter(report =>
      ["Submitted", "Under Review"].includes(report.status)
    ).length;

  document.getElementById("progressStat").textContent =
    reports.filter(report => report.status === "In Progress").length;

  document.getElementById("resolvedStat").textContent =
    reports.filter(report => report.status === "Resolved").length;

  document.getElementById("reportCount").textContent = reports.length;
}

// ------------------------------------------
// RECENT REPORTS
// ------------------------------------------

function renderRecentReports() {
  const container = document.getElementById("recentReports");
  const latest = getSortedReports().slice(0, 4);

  if (latest.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No reports yet</strong>
        Submit the first road damage report.
      </div>`;
    return;
  }

  container.innerHTML = latest.map(report => `
    <div class="report-row">
      <div class="report-symbol">${damageIcon(report.type)}</div>

      <div class="report-info">
        <strong>${escapeHTML(report.title)}</strong>
        <small>${escapeHTML(report.id)} · ${escapeHTML(report.location)}</small>
      </div>

      <div class="report-right">
        <span class="status-badge ${statusClass(report.status)}">
          ${escapeHTML(report.status)}
        </span>
        <small>${formatDate(report.date)}</small>
      </div>
    </div>
  `).join("");
}

// ------------------------------------------
// PRIORITY WATCH
// ------------------------------------------

function renderPriorityReports() {
  const container = document.getElementById("priorityReports");

  const priorityRank = { High: 1, Medium: 2, Low: 3 };

  const active = getSortedReports()
    .filter(report => report.status !== "Resolved")
    .sort((a, b) =>
      priorityRank[a.severity] - priorityRank[b.severity]
    )
    .slice(0, 4);

  if (active.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>All clear</strong>
        No unresolved reports.
      </div>`;
    return;
  }

  container.innerHTML = active.map(report => `
    <div class="priority-item">
      <span class="priority-bar"></span>

      <div class="priority-info">
        <strong>${escapeHTML(report.title)}</strong>
        <small>${escapeHTML(report.location)}</small>
      </div>

      <span class="priority-badge ${priorityClass(report.severity)}">
        ${escapeHTML(report.severity)}
      </span>
    </div>
  `).join("");
}

// ------------------------------------------
// REPORT REGISTER, SEARCH AND FILTERS
// ------------------------------------------

function renderReportTable() {
  const tbody = document.getElementById("reportTable");

  const query = document.getElementById("searchInput")
    .value.trim().toLowerCase();

  const status = document.getElementById("statusFilter").value;
  const severity = document.getElementById("severityFilter").value;

  const filtered = getSortedReports().filter(report => {
    const searchableText = [
      report.id,
      report.title,
      report.location,
      report.type
    ].join(" ").toLowerCase();

    const matchesSearch = searchableText.includes(query);
    const matchesStatus = status === "all" || report.status === status;
    const matchesSeverity =
      severity === "all" || report.severity === severity;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  document.getElementById("tableFooter").textContent =
    `${filtered.length} report(s) found · Stored in this browser`;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <strong>No matching reports</strong>
            Try another search or filter.
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(report => `
    <tr>
      <td>
        <div class="table-report">
          <span class="table-report-icon">${damageIcon(report.type)}</span>
          <div>
            <strong>${escapeHTML(report.title)}</strong>
            <small>${escapeHTML(report.id)} · ${escapeHTML(report.type)}</small>
          </div>
        </div>
      </td>

      <td>${escapeHTML(report.location)}</td>

      <td>
        <span class="priority-badge ${priorityClass(report.severity)}">
          ${escapeHTML(report.severity)}
        </span>
      </td>

      <td>
        <span class="status-badge ${statusClass(report.status)}">
          ${escapeHTML(report.status)}
        </span>
      </td>

      <td>${formatDate(report.date)}</td>

      <td>
        <button class="action-button" data-report-id="${escapeHTML(report.id)}">
          View details ↗
        </button>
      </td>
    </tr>
  `).join("");
}

// Refresh all sections after a change.
function renderAll() {
  renderStatistics();
  renderRecentReports();
  renderPriorityReports();
  renderReportTable();
}

// ------------------------------------------
// PAGE NAVIGATION
// ------------------------------------------

const pageNames = {
  "overview": "Overview",
  "reports": "Road reports",
  "new-report": "Submit a report"
};

function navigateTo(pageName) {
  const page = document.getElementById(pageName);

  if (!page) return;

  document.querySelectorAll(".page").forEach(section => {
    section.classList.toggle("active", section.id === pageName);
  });

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.page === pageName);
  });

  document.getElementById("breadcrumb").textContent =
    pageNames[pageName] || "Overview";

  document.querySelector(".sidebar").classList.remove("open");

  if (pageName === "reports") {
    renderReportTable();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", event => {
  const pageButton = event.target.closest("[data-page]");

  if (pageButton) {
    event.preventDefault();
    navigateTo(pageButton.dataset.page);
  }

  const reportButton = event.target.closest("[data-report-id]");

  if (reportButton) {
    openReportDetails(reportButton.dataset.reportId);
  }
});

// Mobile sidebar.
document.getElementById("menuButton").addEventListener("click", () => {
  document.querySelector(".sidebar").classList.toggle("open");
});

// Live search and filters.
document.getElementById("searchInput").addEventListener(
  "input", renderReportTable
);

document.getElementById("statusFilter").addEventListener(
  "change", renderReportTable
);

document.getElementById("severityFilter").addEventListener(
  "change", renderReportTable
);

// ------------------------------------------
// PHOTO UPLOAD AND PREVIEW
// ------------------------------------------

const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photoPreview");

photoInput.addEventListener("change", event => {
  const file = event.target.files[0];

  selectedPhoto = "";
  photoPreview.hidden = true;
  photoPreview.removeAttribute("src");

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("Please select an image file.");
    photoInput.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showToast("Image must be smaller than 2 MB.");
    photoInput.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    selectedPhoto = reader.result;
    photoPreview.src = selectedPhoto;
    photoPreview.hidden = false;
  };

  reader.onerror = () => {
    showToast("Could not read the selected image.");
  };

  reader.readAsDataURL(file);
});

// Character counter.
document.getElementById("description").addEventListener("input", event => {
  document.getElementById("charCount").textContent =
    `${event.target.value.length} / 500`;
});

// ------------------------------------------
// SUBMIT A NEW ROAD REPORT
// ------------------------------------------

const reportForm = document.getElementById("reportForm");

document.getElementById("date").value =
  new Date().toISOString().slice(0, 10);

reportForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const type = document.getElementById("type").value;
  const severity = document.getElementById("severity").value;
  const description = document.getElementById("description").value.trim();
  const location = document.getElementById("location").value.trim();

  if (!title || !type || !severity || !description || !location) {
    showToast("Complete all required fields.");
    return;
  }

  const newReport = {
    id: "RG-" + Date.now().toString().slice(-7),
    title,
    type,
    severity,
    status: "Submitted",
    description,
    location,
    reporter: document.getElementById("reporter").value.trim(),
    date: document.getElementById("date").value,
    createdAt: new Date().toISOString(),
    photo: selectedPhoto
  };

  reports.unshift(newReport);

  try {
    saveReports();
  } catch (error) {
    reports.shift();
    showToast("Storage limit reached. Remove the image and try again.");
    return;
  }

  reportForm.reset();
  selectedPhoto = "";
  photoPreview.hidden = true;
  photoPreview.removeAttribute("src");

  document.getElementById("date").value =
    new Date().toISOString().slice(0, 10);

  document.getElementById("charCount").textContent = "0 / 500";

  renderAll();
  navigateTo("reports");
  showToast(`Report ${newReport.id} submitted successfully.`);
});

// ------------------------------------------
// REPORT DETAILS AND STATUS MANAGEMENT
// ------------------------------------------

function openReportDetails(id) {
  const report = reports.find(item => item.id === id);

  if (!report) return;

  const dialog = document.getElementById("detailsDialog");
  const content = document.getElementById("dialogBody");

  content.innerHTML = `
    <p class="eyebrow">REPORT DETAILS · ${escapeHTML(report.id)}</p>

    <h2>${escapeHTML(report.title)}</h2>

    <p class="muted">
      ${escapeHTML(report.location)} · ${formatDate(report.date)}
    </p>

    <p>
      <span class="priority-badge ${priorityClass(report.severity)}">
        ${escapeHTML(report.severity)} priority
      </span>
      <span class="status-badge ${statusClass(report.status)}">
        ${escapeHTML(report.status)}
      </span>
    </p>

    <p>${escapeHTML(report.description)}</p>

    ${report.photo
      ? `<img src="${report.photo}" alt="Uploaded road damage evidence">`
      : ""}

    <p><strong>Damage type:</strong> ${escapeHTML(report.type)}</p>

    <p><strong>Reported by:</strong>
      ${escapeHTML(report.reporter || "Anonymous citizen")}
    </p>

    <div class="dialog-field">
      <label for="updatedStatus">Update report status</label>

      <select id="updatedStatus">
        ${["Submitted", "Under Review", "In Progress", "Resolved"]
          .map(status => `
            <option value="${status}" ${report.status === status ? "selected" : ""}>
              ${status}
            </option>
          `).join("")}
      </select>
    </div>

    <div class="dialog-actions">
      <button class="primary-button" id="saveStatus">Save status</button>
      <button class="secondary-button" id="deleteReport">Delete report</button>
    </div>
  `;

  dialog.showModal();

  document.getElementById("saveStatus").addEventListener("click", () => {
    const newStatus = document.getElementById("updatedStatus").value;

    reports = reports.map(item =>
      item.id === id ? { ...item, status: newStatus } : item
    );

    try {
      saveReports();
    } catch (error) {
      showToast("Could not save the update.");
      return;
    }

    dialog.close();
    renderAll();
    showToast("Report status updated.");
  });

  document.getElementById("deleteReport").addEventListener("click", () => {
    const confirmed = confirm(
      `Delete report ${report.id} from this browser?`
    );

    if (!confirmed) return;

    reports = reports.filter(item => item.id !== id);

    try {
      saveReports();
    } catch (error) {
      showToast("Could not save the deletion.");
      return;
    }

    dialog.close();
    renderAll();
    showToast("Report deleted.");
  });
}

document.getElementById("closeDialog").addEventListener("click", () => {
  document.getElementById("detailsDialog").close();
});

document.getElementById("detailsDialog").addEventListener("click", event => {
  if (event.target === event.currentTarget) {
    event.currentTarget.close();
  }
});

// ------------------------------------------
// NOTIFICATIONS
// ------------------------------------------

let toastTimeout;

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Initial dashboard render.
renderAll();