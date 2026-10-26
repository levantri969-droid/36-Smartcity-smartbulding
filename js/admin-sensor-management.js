/**
 * CSE122 - SMARTBUILDING TEAM 01 (BTL-36)
 * js/admin-sensor-management.js - Quản lý Cảm biến IoT (Sensors) (SV3 - Admin)
 * Tích hợp Tầng lưu trữ LocalStorage, Modal Form chuẩn & AI-2 Anomaly Detector
 */

let searchKeyword = "";
let selectedType = "ALL";

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof DB !== 'undefined') {
    await DB.init();
  }
  initSearchAndFilter();
  initModalActions();
  initAiScan();
  renderSensors();

  window.addEventListener('smartbuilding_db_sync', () => {
    renderSensors();
  });
});

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function initSearchAndFilter() {
  const searchInput = document.getElementById("sensorSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchKeyword = e.target.value.toLowerCase().trim();
      renderSensors();
    });
  }

  const typeFilter = document.getElementById("sensorTypeFilter");
  if (typeFilter) {
    typeFilter.addEventListener("change", (e) => {
      selectedType = e.target.value;
      renderSensors();
    });
  }

  const btnReset = document.getElementById("btnResetSensorFilter");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (typeFilter) typeFilter.value = "ALL";
      searchKeyword = "";
      selectedType = "ALL";
      renderSensors();
    });
  }
}

function initAiScan() {
  const btnScan = document.getElementById("btnAiScanSensors");
  const bannerText = document.getElementById("aiBannerText");

  const runScan = async () => {
    if (!bannerText) return;
    bannerText.innerHTML = '<span style="color: #047857;">⏳ AI đang quét và kiểm toán 15+ thiết bị cảm biến...</span>';

    const sensors = DB.get('sensors');
    if (typeof AIEngine !== 'undefined') {
      const anomalies = await AIEngine.detectSensorAnomalies(sensors);
      if (anomalies.length > 0) {
        bannerText.innerHTML = `Phát hiện <strong style="color: #DC2626;">${anomalies.length} cảm biến bất thường</strong>: ${anomalies.map(a => a.sensorId).join(", ")}. Nguy cơ quá tải hoặc mất tín hiệu.`;
      } else {
        bannerText.innerHTML = '<span style="color: #047857;">✓ Tất cả cảm biến đang truyền nhận dữ liệu ổn định theo chuẩn Modbus RTU / MQTT.</span>';
      }
    }
  };

  if (btnScan) btnScan.addEventListener("click", runScan);
  runScan();
}

function initModalActions() {
  const modal = document.getElementById("sensorModal");
  const btnCreate = document.getElementById("btnCreateSensor");
  const btnClose = document.getElementById("btnCloseSensorModal");
  const btnCancel = document.getElementById("btnCancelSensorModal");
  const form = document.getElementById("sensorForm");

  const openModal = (isEdit = false, sensorData = null) => {
    document.getElementById("sensorModalTitle").textContent = isEdit ? "Cập nhật Thông tin Cảm biến" : "Thêm Cảm Biến IoT Mới";
    document.getElementById("sensorEditId").value = isEdit ? sensorData.id : "";
    document.getElementById("sensorCodeInput").value = isEdit ? sensorData.id : `SEN-0${DB.get('sensors').length + 1}`;
    document.getElementById("sensorCodeInput").disabled = isEdit;
    document.getElementById("sensorTypeSelect").value = isEdit ? sensorData.type : "";
    document.getElementById("sensorZoneSelect").value = isEdit ? sensorData.zone : "";
    document.getElementById("sensorThresholdInput").value = isEdit ? sensorData.threshold : 60;
    document.getElementById("sensorStatusSelect").value = isEdit ? sensorData.status : "online";

    document.querySelectorAll(".error-feedback").forEach(el => el.classList.remove("show"));
    document.querySelectorAll(".form-input, .form-select").forEach(el => el.classList.remove("is-invalid"));

    modal.classList.add("show");
    document.getElementById("sensorCodeInput").focus();
  };

  const closeModal = () => {
    modal.classList.remove("show");
  };

  if (btnCreate) btnCreate.addEventListener("click", () => openModal(false));
  if (btnClose) btnClose.addEventListener("click", closeModal);
  if (btnCancel) btnCancel.addEventListener("click", closeModal);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
  });

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const editId = document.getElementById("sensorEditId").value;
      const code = document.getElementById("sensorCodeInput").value.trim();
      const type = document.getElementById("sensorTypeSelect").value;
      const zone = document.getElementById("sensorZoneSelect").value;
      const threshold = parseFloat(document.getElementById("sensorThresholdInput").value) || 50;
      const status = document.getElementById("sensorStatusSelect").value;

      let isValid = true;

      // Validate Code
      const codeErr = document.getElementById("sensorCodeError");
      if (!code) {
        codeErr.textContent = "Mã cảm biến không được để trống!";
        codeErr.classList.add("show");
        document.getElementById("sensorCodeInput").classList.add("is-invalid");
        isValid = false;
      } else if (!editId) {
        // Kiểm tra chống trùng lặp mã
        const exists = DB.get('sensors').some(s => s.id.toUpperCase() === code.toUpperCase());
        if (exists) {
          codeErr.textContent = `Mã cảm biến "${code}" đã tồn tại!`;
          codeErr.classList.add("show");
          document.getElementById("sensorCodeInput").classList.add("is-invalid");
          isValid = false;
        }
      }

      // Validate Type
      const typeErr = document.getElementById("sensorTypeError");
      if (!type) {
        typeErr.classList.add("show");
        document.getElementById("sensorTypeSelect").classList.add("is-invalid");
        isValid = false;
      }

      // Validate Zone
      const zoneErr = document.getElementById("sensorZoneError");
      if (!zone) {
        zoneErr.classList.add("show");
        document.getElementById("sensorZoneSelect").classList.add("is-invalid");
        isValid = false;
      }

      if (!isValid) return;

      const unitMap = {
        "Đồng hồ điện": "kW",
        "Nhiệt độ": "°C",
        "Ánh sáng": "Lux",
        "CO₂": "ppm",
        "Độ ẩm": "%"
      };

      const statusMap = {
        online: { label: "Hoạt động", bg: "#ECFDF5", color: "#047857", dot: "#047857" },
        warning: { label: "Cảnh báo", bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
        disconnected: { label: "Mất kết nối", bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" }
      };

      const sCfg = statusMap[status] || statusMap.online;

      if (editId) {
        DB.update('sensors', editId, {
          type: type,
          zone: zone,
          threshold: threshold,
          status: status,
          statusLabel: sCfg.label,
          statusBg: sCfg.bg,
          statusColor: sCfg.color,
          dotColor: sCfg.dot,
          unit: unitMap[type] || ""
        });
        showToast(`Đã cập nhật cảm biến: ${editId}`);
      } else {
        DB.insert('sensors', {
          id: code.toUpperCase(),
          type: type,
          zone: zone,
          threshold: threshold,
          status: status,
          statusLabel: sCfg.label,
          statusBg: sCfg.bg,
          statusColor: sCfg.color,
          dotColor: sCfg.dot,
          value: (Math.random() * 30 + 20).toFixed(1),
          unit: unitMap[type] || "",
          isLocked: false
        });
        showToast(`Đã thêm mới cảm biến: ${code}`);
      }

      closeModal();
      renderSensors();
    });
  }

  window.handleEditSensor = function(id) {
    const s = DB.get('sensors').find(x => x.id === id);
    if (s) openModal(true, s);
  };
}

function renderSensors() {
  const sensors = DB.get('sensors');
  const filtered = sensors.filter(s => {
    const matchSearch = s.id.toLowerCase().includes(searchKeyword) ||
                        s.zone.toLowerCase().includes(searchKeyword) ||
                        s.type.toLowerCase().includes(searchKeyword);
    const matchType = selectedType === "ALL" || s.type === selectedType;
    return matchSearch && matchType;
  });

  // Summary counts
  const onlineCount = sensors.filter(s => s.status === 'online').length;
  const warnCount = sensors.filter(s => s.status === 'warning' || s.status === 'disconnected').length;

  const topSummary = document.getElementById("sensorTopSummary");
  if (topSummary) {
    topSummary.textContent = `${sensors.length} cảm biến • ${onlineCount} trực tuyến • ${warnCount} cảnh báo • Cập nhật tức thì`;
  }

  const alertBadge = document.getElementById("sensorAlertBadge");
  if (alertBadge) {
    alertBadge.textContent = `${warnCount} cảnh báo`;
    alertBadge.className = warnCount > 0 ? "badge badge-warning" : "badge badge-success";
  }

  const counterEl = document.getElementById("sensorCounter");
  if (counterEl) {
    counterEl.textContent = `Hiển thị ${filtered.length} trên ${sensors.length} cảm biến`;
  }

  const sidebarSummary = document.getElementById("sidebarSensorSummary");
  if (sidebarSummary) {
    sidebarSummary.textContent = `${onlineCount} trực tuyến • ${warnCount} cảnh báo`;
  }

  // Desktop Table
  const tableBody = document.getElementById("sensorTableBody");
  const emptyState = document.getElementById("sensorEmptyState");

  if (tableBody) {
    if (filtered.length === 0) {
      tableBody.innerHTML = "";
      if (emptyState) emptyState.classList.remove("d-none");
    } else {
      if (emptyState) emptyState.classList.add("d-none");
      tableBody.innerHTML = filtered.map(s => `
        <tr>
          <td style="font-weight: 600;">${s.id}</td>
          <td style="color: var(--text-dark);">${s.type}</td>
          <td style="color: var(--text-muted);">${s.zone}</td>
          <td style="font-weight: 600;">${s.value} ${s.unit}</td>
          <td>
            <span class="badge" style="background: ${s.statusBg}; color: ${s.statusColor};">
              <span class="pill-dot" style="background: ${s.dotColor}; width: 6px; height: 6px; border-radius: 50%; display: inline-block;"></span>
              ${s.statusLabel}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: nowrap;">
              <button class="btn btn-outline btn-sm" onclick="handleEditSensor('${s.id}')" title="Sửa cấu hình" style="padding: 0 10px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn btn-outline btn-sm" onclick="handleToggleSensorLock('${s.id}')" title="${s.isLocked ? 'Mở khóa' : 'Khóa thiết bị'}" style="padding: 0 10px; color: ${s.isLocked ? '#64748B' : '#047857'};">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </button>
              <button class="btn btn-outline btn-sm" onclick="handleDeleteSensor('${s.id}')" title="Xóa cảm biến" style="padding: 0 10px; color: var(--alert-red-text);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `).join("");
    }
  }

  // Mobile Cards List
  const mobileContainer = document.getElementById("sensorMobileCardsContainer");
  if (mobileContainer) {
    if (filtered.length === 0) {
      mobileContainer.innerHTML = `<div class="state-container state-empty"><div class="state-title">Không tìm thấy cảm biến</div></div>`;
    } else {
      mobileContainer.innerHTML = filtered.map(s => `
        <div class="mobile-data-card">
          <div class="mobile-data-card-header">
            <div>
              <div class="mobile-data-card-title">${s.type}</div>
              <div style="color: var(--text-muted); font-size: 11px;">${s.id} • ${s.zone}</div>
            </div>
            <span class="badge" style="background: ${s.statusBg}; color: ${s.statusColor};">
              <span class="pill-dot" style="background: ${s.dotColor}; width: 6px; height: 6px; border-radius: 50%; display: inline-block;"></span>
              ${s.statusLabel}
            </span>
          </div>
          <div style="font-size: 16px; font-weight: 700; margin: 8px 0;">
            ${s.value} ${s.unit} <span style="font-size: 11px; font-weight: 400; color: var(--text-muted);">(Ngưỡng: ${s.threshold} ${s.unit})</span>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 10px;">
            <button class="btn btn-outline btn-sm" onclick="handleEditSensor('${s.id}')" style="flex: 1;">Sửa</button>
            <button class="btn btn-outline btn-sm" onclick="handleDeleteSensor('${s.id}')" style="flex: 1; color: var(--alert-red-text);">Xóa</button>
          </div>
        </div>
      `).join("");
    }
  }
}

window.handleToggleSensorLock = function(id) {
  const s = DB.get('sensors').find(x => x.id === id);
  if (!s) return;
  const newLock = !s.isLocked;
  DB.update('sensors', id, { isLocked: newLock });
  renderSensors();
  showToast(`${newLock ? 'Đã khóa' : 'Đã mở khóa'} cảm biến: ${id}`);
};

window.handleDeleteSensor = function(id) {
  const s = DB.get('sensors').find(x => x.id === id);
  if (!s) return;
  if (confirm(`Bạn có chắc muốn xóa cảm biến ${id} khỏi hệ thống?`)) {
    DB.delete('sensors', id);
    renderSensors();
    showToast(`Đã xóa cảm biến: ${id}`);
  }
};

function showToast(msg) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast toast-success show";
  toast.innerHTML = `<span>✓</span> <span>${escapeHtml(msg)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
