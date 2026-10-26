/**
 * CSE122 - SMARTBUILDING TEAM 01 (BTL-36)
 * js/admin-user-management.js - Quản trị Người dùng & Phân quyền (SV3 - Admin)
 * Tích hợp: Tầng lưu trữ localStorage (DB), Modal Form A11y, Form Validation, Dark Mode
 */

// ─── Dữ liệu mặc định nếu DB chưa có users ───────────────────────────────────
const DEFAULT_USERS = [
  { id: "USR-001", name: "Tô Hồng Anh",    email: "honganh.to@greentower.vn",    role: "Manager",  zone: "Toàn bộ tòa nhà",       status: "active" },
  { id: "USR-002", name: "La Ngọc Quang",   email: "ngocquang.la@greentower.vn",   role: "Engineer", zone: "Tầng Kỹ thuật & BMS",   status: "active" },
  { id: "USR-003", name: "Lê Văn Trí",  email: "vantri.le@greentower.vn",  role: "Occupant", zone: "Tầng 3 - Khối KT",      status: "active" },
  { id: "USR-004", name: "Tô Hồng Anh",email: "honganh.admin@greentower.vn", role: "Admin",    zone: "Hệ thống trung tâm",    status: "active" },
  { id: "USR-005", name: "Vũ Đình Trọng",  email: "trong.vu@greentower.vn", role: "Occupant", zone: "Tầng 4",                status: "locked" }
];

// ─── Role & Status Config ──────────────────────────────────────────────────────
const ROLE_BADGE = {
  Admin:    { bg: "#FEF3C7", color: "#92400E" },
  Manager:  { bg: "#ECFDF5", color: "#047857" },
  Engineer: { bg: "#EFF6FF", color: "#1E40AF" },
  Occupant: { bg: "#F1F5F9", color: "#475569" }
};

const STATUS_BADGE = {
  active: { label: "Hoạt động", bg: "#ECFDF5", color: "#047857", dot: "#047857" },
  locked: { label: "Đã khóa",  bg: "#FEF2F2", color: "#DC2626", dot: "#EF4444" }
};

// ─── State ────────────────────────────────────────────────────────────────────
let searchKeyword = "";
let selectedRole  = "ALL";

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  // Khởi tạo DB nếu chưa có users
  if (typeof DB !== "undefined") {
    await DB.init();
    if (!DB.get("users") || DB.get("users").length === 0) {
      const data = DB.getAll();
      data.users = DEFAULT_USERS;
      localStorage.setItem("SMART_BUILDING_DB_V2", JSON.stringify(data));
    }
  }

  initSearchAndFilter();
  initModalActions();
  /* Handled globally by main.js */
  initNetworkStatus();
  renderUsers();

  // Đồng bộ thời gian thực đa tab
  window.addEventListener("smartbuilding_db_sync", () => renderUsers());
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getUsers() {
  if (typeof DB !== "undefined") return DB.get("users") || [];
  return DEFAULT_USERS;
}

// ─── Search & Filter ──────────────────────────────────────────────────────────
function initSearchAndFilter() {
  const searchInput = document.getElementById("userSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", e => {
      searchKeyword = e.target.value.toLowerCase().trim();
      renderUsers();
    });
  }

  const roleSelect = document.getElementById("userRoleFilter");
  if (roleSelect) {
    roleSelect.addEventListener("change", e => {
      selectedRole = e.target.value;
      updateRoleTabsActive(selectedRole);
      renderUsers();
    });
  }

  document.querySelectorAll("#roleFilterTabs .role-tab-btn").forEach(tab => {
    tab.addEventListener("click", () => {
      selectedRole = tab.dataset.role;
      if (roleSelect) roleSelect.value = selectedRole;
      updateRoleTabsActive(selectedRole);
      renderUsers();
    });
  });

  // Reset filter button
  document.addEventListener("click", e => {
    if (e.target.id === "btnResetUserFilter") {
      searchKeyword = "";
      selectedRole = "ALL";
      if (searchInput) searchInput.value = "";
      if (roleSelect) roleSelect.value = "ALL";
      updateRoleTabsActive("ALL");
      renderUsers();
    }
  });
}

function updateRoleTabsActive(role) {
  document.querySelectorAll("#roleFilterTabs .role-tab-btn").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.role === role);
  });
}

// ─── Modal Actions ────────────────────────────────────────────────────────────
function initModalActions() {
  const modal    = document.getElementById("userModal");
  const btnAdd   = document.getElementById("btnCreateUser");
  const btnClose = document.getElementById("btnCloseUserModal");
  const btnCancel= document.getElementById("btnCancelUserModal");
  const form     = document.getElementById("userForm");
  const btnSubmit= document.getElementById("btnSaveUserSubmit");

  if (!modal) return;

  const openModal = (isEdit = false, userData = null) => {
    document.getElementById("userModalTitle").textContent =
      isEdit ? "Cập nhật Thông tin Người dùng" : "Thêm Người dùng Mới";
    document.getElementById("userEditId").value     = isEdit ? userData.id    : "";
    document.getElementById("userNameInput").value  = isEdit ? userData.name  : "";
    document.getElementById("userEmailInput").value = isEdit ? userData.email : "";
    document.getElementById("userRoleSelect").value = isEdit ? userData.role  : "Occupant";
    document.getElementById("userZoneInput").value  = isEdit ? (userData.zone || "") : "";

    // Reset validation state
    document.querySelectorAll("#userForm .error-feedback").forEach(el => el.classList.remove("show"));
    document.querySelectorAll("#userForm .form-input").forEach(el => el.classList.remove("is-invalid"));
    if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.textContent = "Lưu người dùng"; }

    modal.classList.add("show");
    document.getElementById("userNameInput").focus();
  };

  const closeModal = () => modal.classList.remove("show");

  if (btnAdd)    btnAdd.addEventListener("click",    () => openModal(false));
  if (btnClose)  btnClose.addEventListener("click",  closeModal);
  if (btnCancel) btnCancel.addEventListener("click", closeModal);

  // Đóng khi bấm Escape (A11y)
  window.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal.classList.contains("show")) closeModal();
  });

  // Đóng khi bấm ra ngoài modal
  modal.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });

  // Submit form & Validate
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const editId = document.getElementById("userEditId").value;
      const name   = document.getElementById("userNameInput").value.trim();
      const email  = document.getElementById("userEmailInput").value.trim();
      const role   = document.getElementById("userRoleSelect").value;
      const zone   = document.getElementById("userZoneInput").value.trim() || "Tầng 5";

      let isValid = true;

      // Validate họ tên
      const nameErr = document.getElementById("userNameError");
      if (name.length < 3) {
        nameErr.classList.add("show");
        document.getElementById("userNameInput").classList.add("is-invalid");
        isValid = false;
      } else {
        nameErr.classList.remove("show");
        document.getElementById("userNameInput").classList.remove("is-invalid");
      }

      // Validate email (regex)
      const emailErr = document.getElementById("userEmailError");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        emailErr.classList.add("show");
        document.getElementById("userEmailInput").classList.add("is-invalid");
        isValid = false;
      } else {
        emailErr.classList.remove("show");
        document.getElementById("userEmailInput").classList.remove("is-invalid");
      }

      if (!isValid) return;

      // Khóa nút submit (Anti-double-submit)
      if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = "Đang lưu..."; }

      const roleCfg   = ROLE_BADGE[role]   || ROLE_BADGE.Occupant;
      const statusCfg = STATUS_BADGE.active;

      const userObj = {
        id:          editId || `USR-${Date.now().toString().slice(-4)}`,
        name:        escapeHtml(name),
        email:       escapeHtml(email),
        role:        role,
        zone:        escapeHtml(zone),
        status:      "active",
        statusLabel: statusCfg.label,
        statusBg:    statusCfg.bg,
        statusColor: statusCfg.color,
        dotColor:    statusCfg.dot,
        roleBg:      roleCfg.bg,
        roleColor:   roleCfg.color
      };

      if (typeof DB !== "undefined") {
        if (editId) {
          DB.update("users", editId, userObj);
          showToast(`✅ Đã cập nhật người dùng: ${name}`);
        } else {
          DB.insert("users", userObj);
          showToast(`✅ Đã thêm người dùng: ${name} (${role})`);
        }
      }

      closeModal();
      renderUsers();
    });
  }

  // Expose handlers for inline onclick
  window.handleEditUser = function(id) {
    const users = getUsers();
    const user  = users.find(u => u.id === id);
    if (user) openModal(true, user);
  };
}

// ─── Render Users ─────────────────────────────────────────────────────────────
function renderUsers() {
  const users    = getUsers();
  const filtered = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(searchKeyword)  ||
      u.email.toLowerCase().includes(searchKeyword) ||
      u.id.toLowerCase().includes(searchKeyword);
    const matchRole = selectedRole === "ALL" ||
      u.role.toUpperCase() === selectedRole.toUpperCase();
    return matchSearch && matchRole;
  });

  // Toggle empty state
  const emptyState = document.getElementById("userEmptyState");
  if (emptyState) emptyState.classList.toggle("d-none", filtered.length > 0);

  
  // Cập nhật số lượng đếm động trên tiêu đề & các thẻ vai trò (Khớp 100% với màn hình)
  const totalUsers = users.length;
  const activeCount = users.filter(u => u.status === "active").length;
  const adminCount = users.filter(u => u.role.toUpperCase() === "ADMIN").length;
  const managerCount = users.filter(u => u.role.toUpperCase() === "MANAGER").length;
  const engineerCount = users.filter(u => u.role.toUpperCase() === "ENGINEER").length;
  const occupantCount = users.filter(u => u.role.toUpperCase() === "OCCUPANT").length;

  const subTitle = document.querySelector(".page-subtitle-text");
  if (subTitle && window.location.pathname.includes("admin-user-management")) {
    subTitle.textContent = `${totalUsers} tài khoản • ${activeCount} hoạt động • 4 vai trò (RBAC)`;
  }

  const badgeHeader = document.querySelector(".table-card-header .badge");
  if (badgeHeader && window.location.pathname.includes("admin-user-management")) {
    badgeHeader.textContent = `${filtered.length} / ${totalUsers} tài khoản`;
  }

  // Cập nhật text trên các nút tabs
  const tabAll = document.querySelector('#roleFilterTabs [data-role="ALL"]');
  if (tabAll) tabAll.textContent = `Tất cả (${totalUsers})`;
  const tabAdmin = document.querySelector('#roleFilterTabs [data-role="ADMIN"]');
  if (tabAdmin) tabAdmin.textContent = `Admin (${adminCount})`;
  const tabManager = document.querySelector('#roleFilterTabs [data-role="MANAGER"]');
  if (tabManager) tabManager.textContent = `Manager (${managerCount})`;
  const tabEngineer = document.querySelector('#roleFilterTabs [data-role="ENGINEER"]');
  if (tabEngineer) tabEngineer.textContent = `Engineer (${engineerCount})`;
  const tabOccupant = document.querySelector('#roleFilterTabs [data-role="OCCUPANT"]');
  if (tabOccupant) tabOccupant.textContent = `Occupant (${occupantCount})`;

  // Desktop Table Body
  const tableBody = document.getElementById("userTableBody");
  if (tableBody) {
    if (filtered.length === 0) {
      tableBody.innerHTML = "";
    } else {
      tableBody.innerHTML = filtered.map(u => {
        const roleCfg   = ROLE_BADGE[u.role]   || ROLE_BADGE.Occupant;
        const statusCfg = STATUS_BADGE[u.status] || STATUS_BADGE.active;
        return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:30px;height:30px;border-radius:50%;background:#F1F5F9;color:#1E293B;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">
                ${u.name.split(" ").pop().substring(0, 2).toUpperCase()}
              </div>
              <span style="font-weight:600;color:var(--text-dark);">${u.name}</span>
            </div>
          </td>
          <td style="color:var(--text-muted);">${u.email}</td>
          <td>
            <span class="badge" style="background:${roleCfg.bg};color:${roleCfg.color};">${u.role}</span>
          </td>
          <td style="color:var(--text-muted);">${u.zone || "–"}</td>
          <td>
            <span class="badge" style="background:${statusCfg.bg};color:${statusCfg.color};">
              <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${statusCfg.dot};margin-right:4px;"></span>
              ${statusCfg.label}
            </span>
          </td>
          <td>
            <div style="display:flex;gap:8px;align-items:center;">
              <button class="btn btn-outline btn-sm" onclick="handleEditUser('${u.id}')" title="Sửa thông tin" aria-label="Sửa người dùng ${u.name}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn btn-outline btn-sm" onclick="handleToggleLockUser('${u.id}')" title="${u.status === 'locked' ? 'Mở khóa' : 'Khóa tài khoản'}" aria-label="${u.status === 'locked' ? 'Mở khóa' : 'Khóa'} người dùng ${u.name}" style="color:${u.status === 'locked' ? 'var(--primary-green-dark)' : 'var(--alert-red-text)'};">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </button>
              <button class="btn btn-outline btn-sm" onclick="handleDeleteUser('${u.id}')" title="Xóa người dùng" aria-label="Xóa người dùng ${u.name}" style="color:var(--alert-red-text);">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6l-1 14H6L5 6"></path>
                  <path d="M10 11v6M14 11v6"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>`;
      }).join("");
    }
  }

  // Mobile Cards
  const mobileContainer = document.getElementById("userMobileCardsContainer");
  if (mobileContainer) {
    mobileContainer.innerHTML = filtered.length === 0
      ? ""
      : filtered.map(u => {
          const roleCfg   = ROLE_BADGE[u.role]   || ROLE_BADGE.Occupant;
          const statusCfg = STATUS_BADGE[u.status] || STATUS_BADGE.active;
          return `
          <div class="mobile-data-card">
            <div class="mobile-data-card-header">
              <div style="display:flex;align-items:center;gap:8px;">
                <div style="width:28px;height:28px;border-radius:50%;background:#F1F5F9;color:#1E293B;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">
                  ${u.name.split(" ").pop().substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div class="mobile-data-card-title">${u.name}</div>
                  <div style="color:var(--text-muted);font-size:11px;">${u.email}</div>
                </div>
              </div>
              <span class="badge" style="background:${statusCfg.bg};color:${statusCfg.color};">
                <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${statusCfg.dot};margin-right:3px;"></span>
                ${statusCfg.label}
              </span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);">
              <span>Vai trò: <strong style="color:var(--text-dark);">${u.role}</strong></span>
              <span>Khu vực: <strong style="color:var(--text-dark);">${u.zone || "–"}</strong></span>
            </div>
            <div style="display:flex;gap:8px;margin-top:6px;">
              <button class="btn btn-outline btn-sm" onclick="handleEditUser('${u.id}')" style="flex:1;" aria-label="Sửa ${u.name}">Sửa</button>
              <button class="btn btn-sm" onclick="handleToggleLockUser('${u.id}')" style="flex:1;background:${u.status === 'locked' ? '#047857' : '#EF4444'};color:white;border:none;" aria-label="${u.status === 'locked' ? 'Mở khóa' : 'Khóa'} ${u.name}">
                ${u.status === "locked" ? "Mở khóa" : "Khóa"}
              </button>
            </div>
          </div>`;
        }).join("");
  }
}

// ─── Toggle Lock & Delete ─────────────────────────────────────────────────────
window.handleToggleLockUser = function(id) {
  const users = getUsers();
  const user  = users.find(u => u.id === id);
  if (!user) return;

  const newStatus   = user.status === "active" ? "locked" : "active";
  const statusCfg   = STATUS_BADGE[newStatus];

  if (typeof DB !== "undefined") {
    DB.update("users", id, {
      status:      newStatus,
      statusLabel: statusCfg.label,
      statusBg:    statusCfg.bg,
      statusColor: statusCfg.color,
      dotColor:    statusCfg.dot
    });
  }

  showToast(newStatus === "locked"
    ? `🔒 Đã khóa tài khoản: ${user.name}`
    : `🔓 Đã mở khóa tài khoản: ${user.name}`);
  renderUsers();
};

window.handleDeleteUser = function(id) {
  const users = getUsers();
  const user  = users.find(u => u.id === id);
  if (!user) return;

  // Không dùng confirm() – dùng toast với timeout ngắn
  if (typeof DB !== "undefined") {
    DB.delete("users", id);
    showToast(`🗑️ Đã xóa người dùng: ${user.name}`);
    renderUsers();
  }
};

// ─── Dark Mode ────────────────────────────────────────────────────────────────
function initDarkMode() { /* Handled globally by main.js */ }

// ─── Network Status ────────────────────────────────────────────────────────────
function initNetworkStatus() {
  const dot   = document.getElementById("footerNetDot");
  const label = document.getElementById("footerNetLabel");
  const update = () => {
    if (navigator.onLine) {
      if (dot)   { dot.className = "dot-online"; }
      if (label) label.textContent = "Online";
    } else {
      if (dot)   { dot.className = "dot-offline"; }
      if (label) label.textContent = "Offline";
    }
  };
  update();
  window.addEventListener("online",  update);
  window.addEventListener("offline", update);
}

// ─── Toast Notification ────────────────────────────────────────────────────────
function showToast(message, duration = 3000) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast-item";
  toast.textContent = message;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ─── Logout ────────────────────────────────────────────────────────────────────
function handleLogout() {
  localStorage.removeItem("sm_role");
  location.href = "../pages/login.html";
}
