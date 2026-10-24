/**
 * CSE122 - SMARTBUILDING TEAM 01 (BTL-36)
 * admin-zone-management.js - Quản lý Danh mục Khu vực / Zone (SV3 - Admin)
 */

let zoneList = [
  { id: "ZN-001", name: "Tầng 1", area: "2.480 m²", sensors: 32, status: "active", statusLabel: "Hoạt động", badgeBg: "#ECFDF5", badgeColor: "#047857", dotColor: "#047857" },
  { id: "ZN-002", name: "Tầng 2", area: "2.520 m²", sensors: 38, status: "active", statusLabel: "Hoạt động", badgeBg: "#ECFDF5", badgeColor: "#047857", dotColor: "#047857" },
  { id: "ZN-SRV", name: "Server Room", area: "420 m²", sensors: 18, status: "active", statusLabel: "Hoạt động", badgeBg: "#ECFDF5", badgeColor: "#047857", dotColor: "#047857" },
  { id: "ZN-008", name: "Tầng 8", area: "2.480 m²", sensors: 30, status: "maintenance", statusLabel: "Bảo trì", badgeBg: "#FEF3C7", badgeColor: "#92400E", dotColor: "#F59E0B" }
];

let searchKeyword = "";

document.addEventListener("DOMContentLoaded", () => {
  initSearch();
  initActions();
  renderZones();
});

function initSearch() {
  const searchInput = document.getElementById("zoneSearchInput");
  const handleInput = (e) => {
    searchKeyword = e.target.value.toLowerCase().trim();
    renderZones();
  };

  if (searchInput) searchInput.addEventListener("input", handleInput);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function initActions() {
  const btnAdd = document.getElementById("btnAddZone");
  const handleAdd = () => {
    const rawName = prompt("Nhập tên tầng / khu vực mới (Ví dụ: Tầng 9 - Khối R&D):");
    if (!rawName) return;
    const zoneName = escapeHtml(rawName.trim());

    const newId = `ZN-00${zoneList.length + 1}`;
    zoneList.push({
      id: newId,
      name: zoneName,
      area: "2.400 m²",
      sensors: 24,
      status: "active",
      statusLabel: "Hoạt động",
      badgeBg: "#ECFDF5",
      badgeColor: "#047857",
      dotColor: "#047857"
    });

    renderZones();
    showToast(`Đã thêm khu vực mới: ${zoneName} (${newId})`);
  };

  if (btnAdd) btnAdd.addEventListener("click", handleAdd);
}

function renderZones() {
  const filtered = zoneList.filter(z =>
    z.id.toLowerCase().includes(searchKeyword) ||
    z.name.toLowerCase().includes(searchKeyword)
  );

  // Desktop Table Body (Standard <tr> and <td>)
  const tableBody = document.getElementById("zoneTableBody");
  if (tableBody) {
    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="padding: 32px; text-align: center; color: var(--text-muted); font-size: 13px;">Không tìm thấy khu vực nào phù hợp.</td></tr>`;
    } else {
      tableBody.innerHTML = filtered.map(z => `
        <tr>
          <td style="font-weight: 600; color: #1E293B;">${z.id}</td>
          <td style="font-weight: 500; color: #1E293B;">${z.name}</td>
          <td style="color: var(--text-muted);">${z.area}</td>
          <td style="color: var(--text-muted);">${z.sensors} cảm biến</td>
          <td>
            <span class="badge" style="background: ${z.badgeBg}; color: ${z.badgeColor};">
              <span class="pill-dot" style="background: ${z.dotColor}; width: 6px; height: 6px; border-radius: 50%; display: inline-block;"></span>
              ${z.statusLabel}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: nowrap;">
              <button class="btn btn-outline btn-sm" onclick="handleEditZone('${z.id}')" title="Sửa tên khu vực" style="padding: 0 10px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn btn-outline btn-sm" onclick="handleToggleZone('${z.id}')" title="Vô hiệu hóa" style="padding: 0 10px; color: var(--alert-red-text); border-color: var(--border-color);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `).join("");
    }
  }

  // Mobile Cards List
  const mobileList = document.getElementById("zoneCardsListMobile");
  if (mobileList) {
    if (filtered.length === 0) {
      mobileList.innerHTML = `<div style="padding: 24px; text-align: center; color: #64748B; font-size: 13px;">Không tìm thấy khu vực nào.</div>`;
    } else {
      mobileList.innerHTML = filtered.map(z => `
        <div class="mobile-data-card">
          <div class="mobile-data-card-header">
            <div>
              <div class="mobile-data-card-title">${z.name}</div>
              <div style="color: var(--text-muted); font-size: 11px;">${z.id}</div>
            </div>
            <span class="badge" style="background: ${z.badgeBg}; color: ${z.badgeColor};">
              <span class="pill-dot" style="background: ${z.dotColor}; width: 6px; height: 6px; border-radius: 50%; display: inline-block;"></span>
              ${z.statusLabel}
            </span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div class="mobile-data-card-row">
              <span>Diện tích:</span>
              <span>${z.area}</span>
            </div>
            <div class="mobile-data-card-row">
              <span>Số cảm biến:</span>
              <span>${z.sensors} cảm biến</span>
            </div>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 4px;">
            <button class="btn btn-outline btn-sm" onclick="handleEditZone('${z.id}')" style="flex: 1;">Sửa</button>
            <button class="btn btn-danger btn-sm" onclick="handleToggleZone('${z.id}')" style="flex: 1;">Vô hiệu hóa</button>
          </div>
        </div>
      `).join("");
    }
  }
}

window.handleEditZone = function(id) {
  const z = zoneList.find(x => x.id === id);
  if (!z) return;
  const newName = prompt(`Sửa tên cho khu vực ${z.id}:`, z.name);
  if (newName) {
    z.name = escapeHtml(newName.trim());
    renderZones();
    showToast(`Đã cập nhật thông tin: ${z.id}`);
  }
};

window.handleToggleZone = function(id) {
  const z = zoneList.find(x => x.id === id);
  if (!z) return;
  if (confirm(`Bạn có chắc chắn muốn vô hiệu hóa khu vực ${z.name} (${z.id})?`)) {
    z.status = "disabled";
    z.statusLabel = "Đã khóa";
    z.badgeBg = "#F1F5F9";
    z.badgeColor = "#64748B";
    z.dotColor = "#64748B";
    renderZones();
    showToast(`Đã vô hiệu hóa: ${z.name}`);
  }
};
