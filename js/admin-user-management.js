/**
 * CSE122 - SMARTBUILDING TEAM 01 (BTL-36)
 * admin-user-management.js - Quản trị Người dùng & Phân quyền (SV3 - Admin)
 */

let userList = [
  { id: "USR-001", name: "Trần Thu Hà", email: "thuha@greentower.vn", role: "Manager", zone: "Toàn bộ tòa nhà", status: "active", statusLabel: "Hoạt động", statusBg: "#ECFDF5", statusColor: "#047857", dotColor: "#047857", roleBg: "#ECFDF5", roleColor: "#047857" },
  { id: "USR-002", name: "Lê Hoàng Nam", email: "nam.le@greentower.vn", role: "Engineer", zone: "Tầng Kỹ thuật & BMS", status: "active", statusLabel: "Hoạt động", statusBg: "#ECFDF5", statusColor: "#047857", dotColor: "#047857", roleBg: "#EFF6FF", roleColor: "#1E40AF" },
  { id: "USR-003", name: "Phạm Mai Linh", email: "linh.pm@greentower.vn", role: "Occupant", zone: "Tầng 3 - Khối KT", status: "active", statusLabel: "Hoạt động", statusBg: "#ECFDF5", statusColor: "#047857", dotColor: "#047857", roleBg: "#F1F5F9", roleColor: "#475569" },
  { id: "USR-004", name: "Nguyễn Minh Anh", email: "minh.anh@greentower.vn", role: "Admin", zone: "Hệ thống trung tâm", status: "active", statusLabel: "Hoạt động", statusBg: "#ECFDF5", statusColor: "#047857", dotColor: "#047857", roleBg: "#FEF3C7", roleColor: "#92400E" },
  { id: "USR-005", name: "Vũ Đình Trọng", email: "trong.vu@greentower.vn", role: "Occupant", zone: "Tầng 4", status: "locked", statusLabel: "Đã khóa", statusBg: "#FEF2F2", statusColor: "#DC2626", dotColor: "#EF4444", roleBg: "#F1F5F9", roleColor: "#475569" }
];

let searchKeyword = "";
let selectedRole = "ALL";

document.addEventListener("DOMContentLoaded", () => {
  initSearchAndFilter();
  initActions();
  renderUsers();
});

function initSearchAndFilter() {
  const searchInput = document.getElementById("userSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchKeyword = e.target.value.toLowerCase().trim();
      renderUsers();
    });
  }

  const roleSelect = document.getElementById("userRoleFilter");
  if (roleSelect) {
    roleSelect.addEventListener("change", (e) => {
      selectedRole = e.target.value;
      updateRoleTabsActive(selectedRole);
      renderUsers();
    });
  }

  const roleTabs = document.querySelectorAll("#roleFilterTabs .role-tab-btn");
  roleTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      selectedRole = tab.dataset.role;
      if (roleSelect) roleSelect.value = selectedRole;
      updateRoleTabsActive(selectedRole);
      renderUsers();
    });
  });
}

function updateRoleTabsActive(role) {
  const roleTabs = document.querySelectorAll("#roleFilterTabs .role-tab-btn");
  roleTabs.forEach(tab => {
    tab.classList.toggle("active", tab.dataset.role === role);
  });
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
  const btnCreate = document.getElementById("btnCreateUser");
  if (btnCreate) {
    btnCreate.addEventListener("click", () => {
      const rawName = prompt("Nhập họ và tên người dùng:");
      if (!rawName) return;
      const rawEmail = prompt("Nhập email nội bộ (@greentower.vn):", `${rawName.toLowerCase().replace(/\s+/g, '')}@greentower.vn`);
      const rawRole = prompt("Chọn vai trò (Admin / Manager / Engineer / Occupant):", "Occupant");

      const name = escapeHtml(rawName.trim());
      const email = escapeHtml((rawEmail || "").trim());
      const role = escapeHtml((rawRole || "Occupant").trim());

      const newId = `USR-00${userList.length + 1}`;
      userList.unshift({
        id: newId,
        name: name,
        email: email || `${newId.toLowerCase()}@greentower.vn`,
        role: role,
        zone: "Tầng 5",
        status: "active",
        statusLabel: "Hoạt động",
        statusBg: "#ECFDF5",
        statusColor: "#047857",
        dotColor: "#047857",
        roleBg: "#EFF6FF",
        roleColor: "#1E40AF"
      });

      renderUsers();
      showToast(`Đã thêm người dùng: ${name} (${role})`);
    });
  }
}

function renderUsers() {
  const filtered = userList.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchKeyword) ||
                        u.email.toLowerCase().includes(searchKeyword) ||
                        u.id.toLowerCase().includes(searchKeyword);
    const matchRole = selectedRole === "ALL" || u.role.toUpperCase() === selectedRole.toUpperCase();
    return matchSearch && matchRole;
  });

  // Desktop Table Body (Standard <tr> and <td>)
  const tableBody = document.getElementById("userTableBody");
  if (tableBody) {
    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="padding: 32px; text-align: center; color: var(--text-muted); font-size: 13px;">Không tìm thấy người dùng nào phù hợp.</td></tr>`;
    } else {
      tableBody.innerHTML = filtered.map(u => `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 30px; height: 30px; border-radius: 50%; background: #F1F5F9; color: #1E293B; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0;">
                ${u.name.split(" ").pop().substring(0, 2).toUpperCase()}
              </div>
              <span style="font-weight: 600; color: #1E293B;">${u.name}</span>
            </div>
          </td>
          <td style="color: var(--text-muted);">${u.email}</td>
          <td>
            <span class="badge" style="background: ${u.roleBg}; color: ${u.roleColor};">
              ${u.role}
            </span>
          </td>
          <td style="color: var(--text-muted);">${u.zone}</td>
          <td>
            <span class="badge" style="background: ${u.statusBg}; color: ${u.statusColor};">
              <span class="pill-dot" style="background: ${u.dotColor}; width: 6px; height: 6px; border-radius: 50%; display: inline-block;"></span>
              ${u.statusLabel}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: nowrap;">
              <button class="btn btn-outline btn-sm" onclick="handleEditUser('${u.id}')" title="Đổi vai trò" style="padding: 0 10px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn btn-outline btn-sm" onclick="handleToggleLockUser('${u.id}')" title="${u.status === 'locked' ? 'Mở khóa' : 'Khóa tài khoản'}" style="padding: 0 10px; color: ${u.status === 'locked' ? 'var(--primary-green-dark)' : 'var(--alert-red-text)'};">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `).join("");
    }
  }

  // Mobile Cards Container
  const mobileContainer = document.getElementById("userMobileCardsContainer");
  if (mobileContainer) {
    if (filtered.length === 0) {
      mobileContainer.innerHTML = `<div style="padding: 24px; text-align: center; color: #64748B; font-size: 13px;">Không tìm thấy người dùng nào.</div>`;
    } else {
      mobileContainer.innerHTML = filtered.map(u => `
        <div class="mobile-data-card">
          <div class="mobile-data-card-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: #F1F5F9; color: #1E293B; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;">
                ${u.name.split(" ").pop().substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div class="mobile-data-card-title">${u.name}</div>
                <div style="color: var(--text-muted); font-size: 11px;">${u.email}</div>
              </div>
            </div>
            <span class="badge" style="background: ${u.statusBg}; color: ${u.statusColor};">
              <span class="pill-dot" style="background: ${u.dotColor}; width: 6px; height: 6px; border-radius: 50%; display: inline-block;"></span>
              ${u.statusLabel}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted);">
            <span>Vai trò: <strong style="color: var(--text-dark);">${u.role}</strong></span>
            <span>Khu vực: <strong style="color: var(--text-dark);">${u.zone}</strong></span>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 4px;">
            <button class="btn btn-outline btn-sm" onclick="handleEditUser('${u.id}')" style="flex: 1;">Đổi vai trò</button>
            <button class="btn btn-sm" onclick="handleToggleLockUser('${u.id}')" style="flex: 1; background: ${u.status === 'locked' ? '#047857' : '#EF4444'}; color: white;">
              ${u.status === 'locked' ? 'Mở khóa' : 'Khóa'}
            </button>
          </div>
        </div>
      `).join("");
    }
  }
}

window.handleEditUser = function(id) {
  const u = userList.find(x => x.id === id);
  if (!u) return;
  const newRole = prompt(`Đổi vai trò người dùng cho ${u.name} (Admin / Manager / Engineer / Occupant):`, u.role);
  if (newRole) {
    u.role = escapeHtml(newRole.trim());
    renderUsers();
    showToast(`Đã cập nhật vai trò cho: ${u.name}`);
  }
};

window.handleToggleLockUser = function(id) {
  const u = userList.find(x => x.id === id);
  if (!u) return;
  if (u.status === "locked") {
    u.status = "active";
    u.statusLabel = "Hoạt động";
    u.statusBg = "#ECFDF5";
    u.statusColor = "#047857";
    u.dotColor = "#047857";
    showToast(`Đã mở khóa tài khoản: ${u.name}`);
  } else {
    u.status = "locked";
    u.statusLabel = "Đã khóa";
    u.statusBg = "#FEF2F2";
    u.statusColor = "#DC2626";
    u.dotColor = "#EF4444";
    showToast(`Đã khóa tài khoản: ${u.name}`);
  }
  renderUsers();
};
