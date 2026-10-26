/**
 * CSE122 - SMARTBUILDING TEAM 01 (BTL-36)
 * js/admin-zone-management.js - Quản lý Danh mục Khu vực / Zone (SV3 - Admin)
 * Tích hợp Tầng lưu trữ LocalStorage, Modal Form & Validation chuẩn A11y
 */

let searchKeyword = "";

document.addEventListener("DOMContentLoaded", async () => {
  // Đảm bảo dữ liệu từ storage.js đã sẵn sàng
  if (typeof DB !== 'undefined') {
    await DB.init();
  }
  initSearch();
  initModalActions();
  renderZones();

  // Lắng nghe sự kiện đồng bộ đa tab
  window.addEventListener('smartbuilding_db_sync', () => {
    renderZones();
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

function initSearch() {
  const searchInput = document.getElementById("zoneSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchKeyword = e.target.value.toLowerCase().trim();
      renderZones();
    });
  }

  const btnReset = document.getElementById("btnResetZoneSearch");
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      searchKeyword = "";
      renderZones();
    });
  }
}

function initModalActions() {
  const modal = document.getElementById("zoneModal");
  const btnAdd = document.getElementById("btnAddZone");
  const btnClose = document.getElementById("btnCloseZoneModal");
  const btnCancel = document.getElementById("btnCancelZoneModal");
  const form = document.getElementById("zoneForm");

  const openModal = (isEdit = false, zoneData = null) => {
    document.getElementById("zoneModalTitle").textContent = isEdit ? "Cập nhật Thông tin Khu vực" : "Thêm Khu vực (Zone) Mới";
    document.getElementById("zoneEditId").value = isEdit ? zoneData.id : "";
    document.getElementById("zoneCodeInput").value = isEdit ? zoneData.id : `ZN-00${DB.get('zones').length + 1}`;
    document.getElementById("zoneCodeInput").disabled = isEdit;
    document.getElementById("zoneNameInput").value = isEdit ? zoneData.name : "";
    document.getElementById("zoneAreaInput").value = isEdit ? zoneData.area : "2.400 m²";
    document.getElementById("zoneSensorsInput").value = isEdit ? zoneData.sensors : 24;
    document.getElementById("zoneStatusSelect").value = isEdit ? zoneData.status : "active";

    // Reset error messages
    document.querySelectorAll(".error-feedback").forEach(el => el.classList.remove("show"));
    document.querySelectorAll(".form-input").forEach(el => el.classList.remove("is-invalid"));

    modal.classList.add("show");
    document.getElementById("zoneNameInput").focus();
  };

  const closeModal = () => {
    modal.classList.remove("show");
  };

  if (btnAdd) btnAdd.addEventListener("click", () => openModal(false));
  if (btnClose) btnClose.addEventListener("click", closeModal);
  if (btnCancel) btnCancel.addEventListener("click", closeModal);

  // Đóng modal khi bấm phím Esc chuẩn A11y
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) {
      closeModal();
    }
  });

  // Xử lý gửi Form & Validation (Chuẩn tiêu chí 5.2 & Đề thi Live Mod B3)
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const editId = document.getElementById("zoneEditId").value;
      const code = document.getElementById("zoneCodeInput").value.trim();
      const name = document.getElementById("zoneNameInput").value.trim();
      const area = document.getElementById("zoneAreaInput").value.trim();
      const sensors = parseInt(document.getElementById("zoneSensorsInput").value) || 0;
      const status = document.getElementById("zoneStatusSelect").value;

      let isValid = true;

      // Validate Mã Zone
      const codeErr = document.getElementById("zoneCodeError");
      if (!code) {
        codeErr.textContent = "Mã Zone không được để trống!";
        codeErr.classList.add("show");
        document.getElementById("zoneCodeInput").classList.add("is-invalid");
        isValid = false;
      } else if (!editId) {
        // Kiểm tra chống trùng lặp mã Zone
        const exists = DB.get('zones').some(z => z.id.toUpperCase() === code.toUpperCase());
        if (exists) {
          codeErr.textContent = `Mã Zone "${code}" đã tồn tại trên hệ thống!`;
          codeErr.classList.add("show");
          document.getElementById("zoneCodeInput").classList.add("is-invalid");
          isValid = false;
        }
      }

      // Validate Tên Zone
      const nameErr = document.getElementById("zoneNameError");
      if (name.length < 4) {
        nameErr.classList.add("show");
        document.getElementById("zoneNameInput").classList.add("is-invalid");
        isValid = false;
      }

      // Validate Diện tích
      const areaErr = document.getElementById("zoneAreaError");
      if (!area) {
        areaErr.classList.add("show");
        document.getElementById("zoneAreaInput").classList.add("is-invalid");
        isValid = false;
      }

      if (!isValid) return;

      const badgeConfigs = {
        active: { label: "Hoạt động", bg: "#ECFDF5", color: "#047857" },
        maintenance: { label: "Bảo trì", bg: "#FEF3C7", color: "#92400E" },
        disabled: { label: "Đã khóa", bg: "#F1F5F9", color: "#64748B" }
      };

      const cfg = badgeConfigs[status] || badgeConfigs.active;

      if (editId) {
        // Cập nhật bản ghi vào LocalStorage qua DB.update()
        DB.update('zones', editId, {
          name: escapeHtml(name),
          area: escapeHtml(area),
          sensors: sensors,
          status: status,
          statusLabel: cfg.label,
          badgeBg: cfg.bg,
          badgeColor: cfg.color,
          dotColor: cfg.color
        });
        showToast(`Đã cập nhật thành công khu vực: ${editId}`);
      } else {
        // Thêm mới bản ghi vào LocalStorage qua DB.insert()
        DB.insert('zones', {
          id: escapeHtml(code.toUpperCase()),
          name: escapeHtml(name),
          area: escapeHtml(area),
          sensors: sensors,
          status: status,
          statusLabel: cfg.label,
          badgeBg: cfg.bg,
          badgeColor: cfg.color,
          dotColor: cfg.color,
          currentKW: (Math.random() * 40 + 30).toFixed(1)
        });
        showToast(`Đã thêm mới khu vực: ${code}`);
      }

      closeModal();
      renderZones();
    });
  }

  // Mở modal sửa khi bấm nút Sửa
  window.handleEditZone = function(id) {
    const zone = DB.get('zones').find(z => z.id === id);
    if (zone) openModal(true, zone);
  };
}

function renderZones() {
  const zones = DB.get('zones');
  const filtered = zones.filter(z =>
    z.id.toLowerCase().includes(searchKeyword) ||
    z.name.toLowerCase().includes(searchKeyword)
  );

  // Cập nhật số lượng đếm trên tiêu đề
  const activeCount = zones.filter(z => z.status === 'active').length;
  const maintCount = zones.filter(z => z.status === 'maintenance').length;
  const countSummary = document.getElementById("zoneCountSummary");
  if (countSummary) {
    countSummary.textContent = `${zones.length} Zone • ${activeCount} hoạt động • ${maintCount} bảo trì`;
  }
  const badgeCount = document.getElementById("zoneBadgeCount");
  if (badgeCount) badgeCount.textContent = `${zones.length} Zone`;

  // Desktop Table Body
  const tableBody = document.getElementById("zoneTableBody");
  const emptyState = document.getElementById("zoneEmptyState");

  if (tableBody) {
    if (filtered.length === 0) {
      tableBody.innerHTML = "";
      if (emptyState) emptyState.classList.remove("d-none");
    } else {
      if (emptyState) emptyState.classList.add("d-none");
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
              <button class="btn btn-outline btn-sm" onclick="handleEditZone('${z.id}')" title="Sửa thông tin khu vực" style="padding: 0 10px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn btn-outline btn-sm" onclick="handleToggleZone('${z.id}')" title="${z.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt lại'}" style="padding: 0 10px; color: ${z.status === 'active' ? 'var(--alert-red-text)' : 'var(--primary-green-dark)'};">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
              </button>
              <button class="btn btn-outline btn-sm" onclick="handleDeleteZone('${z.id}')" title="Xóa khu vực" style="padding: 0 10px; color: var(--alert-red-text);">
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
  const mobileList = document.getElementById("zoneCardsListMobile");
  if (mobileList) {
    if (filtered.length === 0) {
      mobileList.innerHTML = `<div class="state-container state-empty"><div class="state-title">Không tìm thấy khu vực</div></div>`;
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
          <div style="display: flex; gap: 8px; margin-top: 10px;">
            <button class="btn btn-outline btn-sm" onclick="handleEditZone('${z.id}')" style="flex: 1;">Sửa</button>
            <button class="btn btn-outline btn-sm" onclick="handleToggleZone('${z.id}')" style="flex: 1; color: var(--alert-red-text);">Đổi trạng thái</button>
            <button class="btn btn-outline btn-sm" onclick="handleDeleteZone('${z.id}')" style="flex: 1; color: var(--alert-red-text);">Xóa</button>
          </div>
        </div>
      `).join("");
    }
  }
}

window.handleToggleZone = function(id) {
  const z = DB.get('zones').find(x => x.id === id);
  if (!z) return;
  const isNowActive = z.status !== "active";
  const newStatus = isNowActive ? "active" : "disabled";
  const newLabel = isNowActive ? "Hoạt động" : "Đã khóa";
  const newBg = isNowActive ? "#ECFDF5" : "#F1F5F9";
  const newColor = isNowActive ? "#047857" : "#64748B";

  DB.update('zones', id, {
    status: newStatus,
    statusLabel: newLabel,
    badgeBg: newBg,
    badgeColor: newColor,
    dotColor: newColor
  });

  renderZones();
  showToast(`Đã chuyển trạng thái ${z.id} sang: ${newLabel}`);
};

window.handleDeleteZone = function(id) {
  const z = DB.get('zones').find(x => x.id === id);
  if (!z) return;

  // Kiểm tra an toàn: Nếu zone còn cảm biến đang liên kết
  const sensors = DB.get('sensors') || [];
  const relatedSensors = sensors.filter(s => s.zone === z.floor || s.zone === z.name || (z.floor && s.zone.includes(z.floor)));
  
  let confirmMsg = `Bạn có chắc chắn muốn xóa khu vực ${z.name} (${z.id}) khỏi hệ thống?`;
  if (relatedSensors.length > 0) {
    confirmMsg += `\nLưu ý: Khu vực này hiện có ${relatedSensors.length} cảm biến liên kết.`;
  }

  if (confirm(confirmMsg)) {
    DB.delete('zones', id);
    renderZones();
    showToast(`Đã xóa thành công khu vực: ${z.name} (${id})`);
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
