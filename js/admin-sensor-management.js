/**
 * CSE122 - SMARTBUILDING TEAM 01 (BTL-36)
 * admin-sensor-management.js - Quản lý Cảm biến IoT (Sensors) (SV3 - Admin)
 */

let sensorsList = [
  { id: "PWR-T2-014", type: "Đồng hồ điện", zone: "Tầng 2", status: "disconnected", statusLabel: "Mất kết nối", statusBg: "#FEF2F2", statusColor: "#DC2626", dotColor: "#EF4444", configLabel: "Cấu hình", configBg: "#ECFDF5", configColor: "#047857", isLocked: false },
  { id: "TMP-SRV-08", type: "Nhiệt độ", zone: "Server Room", status: "online", statusLabel: "Hoạt động", statusBg: "#ECFDF5", statusColor: "#047857", dotColor: "#047857", configLabel: "Cấu hình", configBg: "#ECFDF5", configColor: "#047857", isLocked: false },
  { id: "LUX-T3-22", type: "Ánh sáng", zone: "Tầng 3", status: "online", statusLabel: "Hoạt động", statusBg: "#ECFDF5", statusColor: "#047857", dotColor: "#047857", configLabel: "Khóa", configBg: "#F1F5F9", configColor: "#64748B", isLocked: true },
  { id: "CO2-T8-04", type: "CO₂", zone: "Tầng 8", status: "online", statusLabel: "Hoạt động", statusBg: "#ECFDF5", statusColor: "#047857", dotColor: "#047857", configLabel: "Cấu hình", configBg: "#ECFDF5", configColor: "#047857", isLocked: false },
  { id: "HUM-T1-09", type: "Độ ẩm", zone: "Tầng 1", status: "online", statusLabel: "Hoạt động", statusBg: "#ECFDF5", statusColor: "#047857", dotColor: "#047857", configLabel: "Cấu hình", configBg: "#ECFDF5", configColor: "#047857", isLocked: false },
  { id: "PWR-T4-031", type: "Đồng hồ điện", zone: "Tầng 4", status: "disconnected", statusLabel: "Mất kết nối", statusBg: "#FEF2F2", statusColor: "#DC2626", dotColor: "#EF4444", configLabel: "Cấu hình", configBg: "#ECFDF5", configColor: "#047857", isLocked: false }
];

let searchKeyword = "";

document.addEventListener("DOMContentLoaded", () => {
  initSearch();
  initActions();
  renderSensors();
});

function initSearch() {
  const searchInput = document.getElementById("sensorSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchKeyword = e.target.value.toLowerCase().trim();
      renderSensors();
    });
  }
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
  const btnCreate = document.getElementById("btnCreateSensor");
  if (btnCreate) {
    btnCreate.addEventListener("click", () => {
      const rawType = prompt("Nhập loại cảm biến (Ví dụ: Nhiệt độ, Độ ẩm, CO₂, Điện năng):");
      if (!rawType) return;
      const rawZone = prompt("Nhập phân khu (Ví dụ: Tầng 5 - VP Kỹ thuật):", "Tầng 5");

      const sensorType = escapeHtml(rawType.trim());
      const zoneName = escapeHtml((rawZone || "Chưa gán").trim());

      const newId = `SEN-0${sensorsList.length + 1}`;
      sensorsList.unshift({
        id: newId,
        type: sensorType,
        zone: zoneName,
        status: "online",
        statusLabel: "Hoạt động",
        statusBg: "#ECFDF5",
        statusColor: "#047857",
        dotColor: "#047857",
        configLabel: "Cấu hình",
        configBg: "#ECFDF5",
        configColor: "#047857",
        isLocked: false
      });

      renderSensors();
      showToast(`Đã thêm cảm biến mới: ${newId}`);
    });
  }

  const btnAi = document.getElementById("btnAiDetail");
  if (btnAi) {
    btnAi.addEventListener("click", () => {
      alert("Chi tiết cảnh báo AI:\n- PWR-T2-014: Trùng địa chỉ Modbus #04 với TMP-SRV-08.\n- PWR-T4-031: Mất tín hiệu truyền thông lúc 10:24 (vượt ngưỡng 8 phút).");
    });
  }
}

function renderSensors() {
  const filtered = sensorsList.filter(s =>
    s.id.toLowerCase().includes(searchKeyword) ||
    s.type.toLowerCase().includes(searchKeyword) ||
    s.zone.toLowerCase().includes(searchKeyword)
  );

  // Desktop Table Body (Standard <tr> and <td>)
  const tableBody = document.getElementById("sensorTableBody");
  if (tableBody) {
    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="padding: 32px; text-align: center; color: var(--text-muted); font-size: 13px;">Không tìm thấy cảm biến nào phù hợp.</td></tr>`;
    } else {
      tableBody.innerHTML = filtered.map(s => `
        <tr>
          <td style="font-weight: 600; color: #1E293B;">${s.id}</td>
          <td>${s.type}</td>
          <td style="color: var(--text-muted);">${s.zone}</td>
          <td>
            <span class="badge" style="background: ${s.statusBg}; color: ${s.statusColor};">
              <span class="pill-dot" style="background: ${s.dotColor}; width: 6px; height: 6px; border-radius: 50%; display: inline-block;"></span>
              ${s.statusLabel}
            </span>
          </td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="handleToggleLock('${s.id}')" style="background: ${s.configBg}; color: ${s.configColor}; border-color: transparent; font-weight: 600;">
              ${s.configLabel}
            </button>
          </td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="handleViewSensor('${s.id}')" title="Xem chi tiết cấu hình" style="padding: 0 12px;">
              Chi tiết
            </button>
          </td>
        </tr>
      `).join("");
    }
  }

  // Mobile Cards Container
  const mobileContainer = document.getElementById("sensorMobileCardsContainer");
  if (mobileContainer) {
    if (filtered.length === 0) {
      mobileContainer.innerHTML = `<div style="padding: 24px; text-align: center; color: #64748B; font-size: 13px;">Không tìm thấy cảm biến nào.</div>`;
    } else {
      mobileContainer.innerHTML = filtered.map(s => `
        <div class="mobile-data-card">
          <div class="mobile-data-card-header">
            <div>
              <div class="mobile-data-card-title">${s.id}</div>
              <div style="color: var(--text-muted); font-size: 11px;">${s.type} • ${s.zone}</div>
            </div>
            <span class="badge" style="background: ${s.statusBg}; color: ${s.statusColor};">
              <span class="pill-dot" style="background: ${s.dotColor}; width: 6px; height: 6px; border-radius: 50%; display: inline-block;"></span>
              ${s.statusLabel}
            </span>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 4px;">
            <button class="btn btn-outline btn-sm" onclick="handleViewSensor('${s.id}')" style="flex: 1;">Chi tiết</button>
            <button class="btn btn-sm" onclick="handleToggleLock('${s.id}')" style="flex: 1; background: ${s.isLocked ? '#047857' : '#EF4444'}; color: white;">
              ${s.isLocked ? 'Mở khóa' : 'Khóa'}
            </button>
          </div>
        </div>
      `).join("");
    }
  }
}

window.handleViewSensor = function(id) {
  const s = sensorsList.find(x => x.id === id);
  if (!s) return;
  alert(`Cấu hình cảm biến ${s.id}:\n- Loại: ${s.type}\n- Phân khu: ${s.zone}\n- Trạng thái: ${s.statusLabel}\n- Giao thức: Modbus RTU / RS485`);
};

window.handleToggleLock = function(id) {
  const s = sensorsList.find(x => x.id === id);
  if (!s) return;
  s.isLocked = !s.isLocked;
  s.configLabel = s.isLocked ? "Khóa" : "Cấu hình";
  s.configBg = s.isLocked ? "#F1F5F9" : "#ECFDF5";
  s.configColor = s.isLocked ? "#64748B" : "#047857";
  renderSensors();
  showToast(`Đã ${s.isLocked ? 'khóa' : 'mở khóa'} cảm biến: ${s.id}`);
};
