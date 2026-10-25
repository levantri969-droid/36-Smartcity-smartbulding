/**
 * CSE122 - SMARTBUILDING TEAM 01 (BTL-36)
 * profile.js - Profile management, Role Adaptability (Manager vs Admin),
 * Password change & Activity history matching Figma specification.
 */

const ROLE_PRESETS = {
  manager: {
    role: "manager",
    name: "Trần Thu Hà",
    email: "thuha@greentower.vn",
    roleTitle: "Facility Manager (SV3)",
    roleShort: "Facility Manager",
    initials: "TH",
    phone: "0912 345 678",
    dept: "Ban Quản lý Năng lượng • P. 12-01",
    sidebarTitle: "ĐIỀU HƯỚNG",
    sidebarNavHtml: `
      <a href="manager-energy-kpis.html" class="nav-item">
        <span class="nav-num">01</span>
        <span class="nav-label">KPI năng lượng</span>
        <span class="nav-arrow">&rsaquo;</span>
      </a>
      <a href="manager-zone-comparison.html" class="nav-item">
        <span class="nav-num">02</span>
        <span class="nav-label">So sánh Zone</span>
        <span class="nav-arrow">&rsaquo;</span>
      </a>
      <a href="manager-monthly-report.html" class="nav-item">
        <span class="nav-num">03</span>
        <span class="nav-label">Báo cáo tháng</span>
        <span class="nav-arrow">&rsaquo;</span>
      </a>
      <a href="profile.html?role=manager" class="nav-item active">
        <span class="nav-num">04</span>
        <span class="nav-label">Hồ sơ</span>
        <span class="nav-arrow">&rsaquo;</span>
      </a>
    `,
    sidebarBadgeHtml: `
      <div class="building-badge">
        <span class="building-badge-sub">TÒA NHÀ HIỆN TẠI</span>
        <div class="building-badge-main">
          <span class="building-name">Green Tower • BTL-36</span>
          <span class="nav-arrow">&rsaquo;</span>
        </div>
      </div>
    `,
    bottomNavHtml: `
      <a href="manager-energy-kpis.html" class="bottom-nav-item">
        <span class="bottom-nav-icon">📊</span>
        <span class="bottom-nav-label">KPI năng lượng</span>
      </a>
      <a href="manager-zone-comparison.html" class="bottom-nav-item">
        <span class="bottom-nav-icon">📈</span>
        <span class="bottom-nav-label">So sánh Zone</span>
      </a>
      <a href="manager-monthly-report.html" class="bottom-nav-item">
        <span class="bottom-nav-icon">📑</span>
        <span class="bottom-nav-label">Báo cáo tháng</span>
      </a>
      <a href="profile.html?role=manager" class="bottom-nav-item active">
        <span class="bottom-nav-icon">👤</span>
        <span class="bottom-nav-label">Hồ sơ</span>
      </a>
    `
  },
  admin: {
    role: "admin",
    name: "Nguyễn Minh Anh",
    email: "minh.anh@greentower.vn",
    roleTitle: "System Admin (SV3)",
    roleShort: "Admin",
    initials: "NA",
    phone: "0988 246 810",
    dept: "Ban Vận hành • P. B2-04",
    sidebarTitle: "QUẢN TRỊ HỆ THỐNG",
    sidebarNavHtml: `
      <a href="admin-zone-management.html" class="nav-item">
        <span class="nav-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </span>
        <span class="nav-label">Quản lý Zone</span>
        <span class="nav-arrow">&rsaquo;</span>
      </a>
      <a href="admin-sensor-management.html" class="nav-item">
        <span class="nav-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </span>
        <span class="nav-label">Cảm biến</span>
        <span class="nav-arrow">&rsaquo;</span>
      </a>
      <a href="admin-user-management.html" class="nav-item">
        <span class="nav-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </span>
        <span class="nav-label">Người dùng</span>
        <span class="nav-arrow">&rsaquo;</span>
      </a>
      <a href="profile.html?role=admin" class="nav-item active">
        <span class="nav-icon" style="color: #10B981;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </span>
        <span class="nav-label">Hồ sơ</span>
        <span class="nav-arrow">&rsaquo;</span>
      </a>
    `,
    sidebarBadgeHtml: `
      <div class="building-badge" style="background: #F8FAFC; border-radius: 8px; padding: 14px; border: 1px solid #E2E8F0;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="pill-dot" style="background-color: #10B981; width: 8px; height: 8px; border-radius: 999px;"></span>
          <span style="font-size: 13px; font-weight: 600; color: #0F172A;">Hệ thống ổn định</span>
        </div>
        <span style="font-size: 11px; color: #64748B; margin-top: 6px; display: block;">Đồng bộ 10:32 • 248 cảm biến</span>
      </div>
    `,
    bottomNavHtml: `
      <a href="admin-zone-management.html" class="bottom-nav-item">
        <span class="bottom-nav-icon">🏢</span>
        <span class="bottom-nav-label">Quản lý Zone</span>
      </a>
      <a href="admin-sensor-management.html" class="bottom-nav-item">
        <span class="bottom-nav-icon">📡</span>
        <span class="bottom-nav-label">Cảm biến</span>
      </a>
      <a href="admin-user-management.html" class="bottom-nav-item">
        <span class="bottom-nav-icon">👥</span>
        <span class="bottom-nav-label">Người dùng</span>
      </a>
      <a href="profile.html?role=admin" class="bottom-nav-item active">
        <span class="bottom-nav-icon">👤</span>
        <span class="bottom-nav-label">Hồ sơ</span>
      </a>
    `
  },
  operator: {
    role: "operator",
    name: "Lê Quốc Bảo",
    email: "operator@greentower.vn",
    roleTitle: "Operator (SV1)",
    roleShort: "Operator",
    initials: "LB",
    phone: "0901 234 567",
    dept: "Ban Vận hành Kỹ thuật • P. B1-02",
    sidebarTitle: "ĐIỀU HƯỚNG",
    sidebarNavHtml: `
      <a href="operator-energy-monitor.html" class="nav-item">
        <span class="nav-num">01</span>
        <span class="nav-label">Giám sát năng lượng</span>
        <span class="nav-arrow">&rsaquo;</span>
      </a>
      <a href="operator-alert-center.html" class="nav-item">
        <span class="nav-num">02</span>
        <span class="nav-label">Trung tâm cảnh báo</span>
        <span class="nav-arrow">&rsaquo;</span>
      </a>
      <a href="operator-saving-actions.html" class="nav-item">
        <span class="nav-num">03</span>
        <span class="nav-label">Điều phối tiết kiệm</span>
        <span class="nav-arrow">&rsaquo;</span>
      </a>
      <a href="profile.html?role=operator" class="nav-item active">
        <span class="nav-num">04</span>
        <span class="nav-label">Hồ sơ</span>
        <span class="nav-arrow">&rsaquo;</span>
      </a>
    `,
    sidebarBadgeHtml: `
      <div class="building-badge">
        <span class="building-badge-sub">TÒA NHÀ HIỆN TẠI</span>
        <div class="building-badge-main">
          <span class="building-name">Green Tower • BTL-36</span>
          <span class="nav-arrow">&rsaquo;</span>
        </div>
      </div>
    `,
    bottomNavHtml: `
      <a href="operator-energy-monitor.html" class="bottom-nav-item">
        <span class="bottom-nav-icon">📊</span>
        <span class="bottom-nav-label">Giám sát</span>
      </a>
      <a href="operator-alert-center.html" class="bottom-nav-item">
        <span class="bottom-nav-icon">🔔</span>
        <span class="bottom-nav-label">Cảnh báo</span>
      </a>
      <a href="operator-saving-actions.html" class="bottom-nav-item">
        <span class="bottom-nav-icon">💡</span>
        <span class="bottom-nav-label">Điều phối</span>
      </a>
      <a href="profile.html?role=operator" class="bottom-nav-item active">
        <span class="bottom-nav-icon">👤</span>
        <span class="bottom-nav-label">Hồ sơ</span>
      </a>
    `
  }
};

let currentActiveRole = "admin";

document.addEventListener("DOMContentLoaded", () => {
  currentActiveRole = determineActiveRole();
  applyRoleLayout(currentActiveRole);
  initUserProfile();
  initMobileTabs();
  initForms();
  initAvatarUpload();
});

/**
 * Determine active role safely:
 * 1. Query parameter ?role=manager, ?role=admin or ?role=operator
 * 2. Stored user session in localStorage
 * 3. Document referrer URL
 * 4. Fallback to admin
 */
function determineActiveRole() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramRole = urlParams.get("role");
  if (paramRole && ROLE_PRESETS[paramRole]) {
    return paramRole;
  }

  try {
    const saved = localStorage.getItem("smartbuilding_user");
    if (saved) {
      const u = JSON.parse(saved);
      if (u.role && ROLE_PRESETS[u.role]) {
        return u.role;
      }
    }
  } catch (err) {}

  if (document.referrer.includes("operator-")) return "operator";
  if (document.referrer.includes("manager-")) return "manager";
  if (document.referrer.includes("admin-")) return "admin";

  return "admin";
}

/**
 * Apply role-specific layout to Sidebar, Header, Form defaults, and Mobile Bottom Nav
 */
function applyRoleLayout(role) {
  const preset = ROLE_PRESETS[role] || ROLE_PRESETS.admin;

  // 1. Sidebar Profile Box
  const sidebarAvatar = document.getElementById("sidebarAvatar");
  const sidebarName = document.getElementById("sidebarName");
  const sidebarRole = document.getElementById("sidebarRole");
  if (sidebarAvatar) {
    sidebarAvatar.style.backgroundImage = "url('../assets/images/profilepic.webp')";
    sidebarAvatar.style.backgroundSize = "cover";
    sidebarAvatar.style.backgroundPosition = "center";
    sidebarAvatar.textContent = "";
  }
  if (sidebarName) sidebarName.textContent = preset.name;
  if (sidebarRole) sidebarRole.textContent = `${preset.roleShort} • ${preset.email}`;

  // 2. Sidebar Section Title & Navigation Links
  const sidebarSectionTitle = document.getElementById("sidebarSectionTitle");
  const sidebarNav = document.getElementById("sidebarNav");
  if (sidebarSectionTitle) sidebarSectionTitle.textContent = preset.sidebarTitle;
  if (sidebarNav) sidebarNav.innerHTML = preset.sidebarNavHtml;

  // 3. Sidebar Footer Badge
  const badgeWrap = document.getElementById("sidebarBuildingBadgeWrap");
  if (badgeWrap) badgeWrap.innerHTML = preset.sidebarBadgeHtml;

  // 4. Header User Block
  const headerUserBox = document.getElementById("headerUserBox");
  const headerUserName = document.getElementById("headerUserName");
  const headerUserRole = document.getElementById("headerUserRole");
  if (headerUserBox) {
    headerUserBox.onclick = () => { location.href = `profile.html?role=${role}`; };
  }
  if (headerUserName) headerUserName.textContent = preset.name;
  if (headerUserRole) headerUserRole.textContent = preset.roleTitle;

  // 5. Card 1 Form Initial Values
  const avatarBadge = document.getElementById("profileAvatarBadge");
  const nameInput = document.getElementById("profileNameInput");
  const emailInput = document.getElementById("profileEmailInput");
  const phoneInput = document.getElementById("profilePhoneInput");
  const deptInput = document.getElementById("profileDeptInput");

  if (avatarBadge) {
    if (!avatarBadge.style.backgroundImage) {
      avatarBadge.style.backgroundImage = "url('../assets/images/profilepic.webp')";
      avatarBadge.style.backgroundSize = "cover";
      avatarBadge.style.backgroundPosition = "center";
      avatarBadge.textContent = "";
    }
  }
  if (nameInput) nameInput.value = preset.name;
  if (emailInput) emailInput.value = preset.email;
  if (phoneInput) phoneInput.value = preset.phone;
  if (deptInput) deptInput.value = preset.dept;

  // 6. Mobile Bottom Navigation
  const mobileNav = document.getElementById("mobileBottomNav");
  if (mobileNav) mobileNav.innerHTML = preset.bottomNavHtml;

  // 7. Activity Author Line
  const actAuthor = document.querySelector("#cardActivity .profile-activity-time");
  if (actAuthor) {
    actAuthor.textContent = `10:32 • ${preset.name}`;
  }
}

/**
 * Load customized user session if saved by user earlier
 */
function initUserProfile() {
  const savedUser = localStorage.getItem("smartbuilding_user");
  if (!savedUser) return;

  try {
    const user = JSON.parse(savedUser);
    if (user.role && user.role !== currentActiveRole) return; // Keep role-specific

    const nameInput = document.getElementById("profileNameInput");
    const emailInput = document.getElementById("profileEmailInput");
    const phoneInput = document.getElementById("profilePhoneInput");
    const deptInput = document.getElementById("profileDeptInput");
    const avatarBadge = document.getElementById("profileAvatarBadge");
    const sidebarAvatar = document.getElementById("sidebarAvatar");
    const sidebarName = document.getElementById("sidebarName");
    const headerUserName = document.getElementById("headerUserName");

    if (nameInput && user.name) nameInput.value = user.name;
    if (emailInput && user.email) emailInput.value = user.email;
    if (phoneInput && user.phone) phoneInput.value = user.phone;
    if (deptInput && user.dept) deptInput.value = user.dept;

    if (user.name) {
      if (headerUserName) headerUserName.textContent = user.name;
      if (sidebarName) sidebarName.textContent = user.name;
      const initials = user.name.split(" ").map(w => w[0]).slice(-2).join("").toUpperCase();
      if (avatarBadge && !avatarBadge.style.backgroundImage) avatarBadge.textContent = initials;
      if (sidebarAvatar && !sidebarAvatar.style.backgroundImage) sidebarAvatar.textContent = initials;
    }
  } catch (err) {
    console.error("Lỗi đọc thông tin tài khoản:", err);
  }
}

/**
 * Mobile Segmented Tabs switching
 */
function initMobileTabs() {
  const tabBtns = document.querySelectorAll(".profile-tab-btn");
  const cardInfo = document.getElementById("cardInfo");
  const cardPassword = document.getElementById("cardPassword");
  const cardActivity = document.getElementById("cardActivity");

  const cards = {
    cardInfo: cardInfo,
    cardPassword: cardPassword,
    cardActivity: cardActivity
  };

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const tab = btn.dataset.tab;
      Object.keys(cards).forEach(key => {
        if (cards[key]) {
          cards[key].classList.toggle("active-tab-card", key === tab);
        }
      });
    });
  });
}

/**
 * Form Submit Listeners with Toast Feedback
 */
function initForms() {
  const infoForm = document.getElementById("profileInfoForm");
  const passwordForm = document.getElementById("profilePasswordForm");

  if (infoForm) {
    infoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("profileNameInput")?.value.trim();
      const email = document.getElementById("profileEmailInput")?.value.trim();
      const phone = document.getElementById("profilePhoneInput")?.value.trim();
      const dept = document.getElementById("profileDeptInput")?.value.trim();

      const preset = ROLE_PRESETS[currentActiveRole] || ROLE_PRESETS.admin;
      const userObj = {
        name: name || preset.name,
        email: email || preset.email,
        phone: phone || preset.phone,
        dept: dept || preset.dept,
        role: currentActiveRole,
        roleTitle: preset.roleTitle
      };

      localStorage.setItem("smartbuilding_user", JSON.stringify(userObj));

      // Update UI displays immediately
      const headerUserName = document.getElementById("headerUserName");
      const sidebarName = document.getElementById("sidebarName");
      const avatarBadge = document.getElementById("profileAvatarBadge");
      const sidebarAvatar = document.getElementById("sidebarAvatar");

      if (headerUserName && userObj.name) headerUserName.textContent = userObj.name;
      if (sidebarName && userObj.name) sidebarName.textContent = userObj.name;

      const initials = userObj.name.split(" ").map(w => w[0]).slice(-2).join("").toUpperCase();
      if (avatarBadge && !avatarBadge.style.backgroundImage) avatarBadge.textContent = initials;
      if (sidebarAvatar && !sidebarAvatar.style.backgroundImage) sidebarAvatar.textContent = initials;

      showToast("Lưu thông tin cá nhân thành công!", "success");
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newPass = document.getElementById("newPasswordInput")?.value;
      const confirmPass = document.getElementById("confirmPasswordInput")?.value;

      if (!newPass || newPass.length < 8) {
        showToast("Mật khẩu mới phải có tối thiểu 8 ký tự!", "danger");
        return;
      }

      if (newPass !== confirmPass) {
        showToast("Mật khẩu xác nhận không khớp!", "danger");
        return;
      }

      showToast("Đổi mật khẩu thành công!", "success");
      passwordForm.reset();
    });
  }
}

/**
 * Mock avatar upload
 */
function initAvatarUpload() {
  const btn = document.getElementById("btnChangeAvatar");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          showToast("Kích thước file ảnh vượt quá 2 MB!", "danger");
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          const avatarBadge = document.getElementById("profileAvatarBadge");
          if (avatarBadge) {
            avatarBadge.style.backgroundImage = `url(${event.target.result})`;
            avatarBadge.style.backgroundSize = "cover";
            avatarBadge.textContent = "";
          }
          showToast("Đã cập nhật ảnh đại diện!", "success");
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  });
}
