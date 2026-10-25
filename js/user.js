/**
 * CSE122 - SMARTBUILDING TEAM 01 (BTL-36)
 * user.js - Master Navigation, Unified Role RBAC, Mobile Drawer Toggle,
 * Header Profile Link, System Notifications Toast & Logout Handler
 */

const UNIFIED_ROLES = {
  operator: {
    key: "operator",
    name: "Lê Minh Khang",
    description: "Vận hành tòa nhà",
    roleTitle: "Building Operator (SV1)",
    initials: "LK",
    email: "minhkhang@greentower.vn",
    phone: "0901 234 567",
    department: "Ban Kỹ thuật Vận hành • Green Tower",
    section: "MENU OPERATOR",
    features: [
      ["engineer-energy-monitor.html", "Giám sát năng lượng", "Giám sát", "📊"],
      ["engineer-alert-center.html", "Trung tâm cảnh báo", "Cảnh báo", "⚠"],
      ["engineer-saving-actions.html", "Hành động tiết kiệm", "Tiết kiệm", "✓"],
      ["operator-energy-kpis.html", "KPI năng lượng", "KPI", "⚡"],
      ["profile.html?role=operator", "Hồ sơ cá nhân", "Hồ sơ", "👤"]
    ]
  },
  occupant: {
    key: "occupant",
    name: "Nguyễn Thuỳ Linh",
    description: "Tiện nghi & cộng đồng",
    roleTitle: "Office Occupant (SV2)",
    initials: "NL",
    email: "thuylinh@greentower.vn",
    phone: "0902 345 678",
    department: "Khu văn phòng • Tầng 05",
    section: "MENU OCCUPANT",
    features: [
      ["occupant-dashboard.html", "Tổng quan căn hộ", "Tổng quan", "🏠"],
      ["occupant-energy-challenge.html", "Thử thách Eco", "Thử thách", "🌱"],
      ["occupant-comfort-feedback.html", "Phản hồi tiện nghi", "Tiện nghi", "☀"],
      ["profile.html?role=occupant", "Hồ sơ cá nhân", "Hồ sơ", "👤"]
    ]
  },
  manager: {
    key: "manager",
    name: "Trần Thu Hà",
    description: "Quản lý năng lượng",
    roleTitle: "Facility Manager (SV3)",
    initials: "TH",
    email: "thuha@greentower.vn",
    phone: "0912 345 678",
    department: "Ban Quản lý Năng lượng • P. 12-01",
    section: "MENU MANAGER",
    features: [
      ["manager-energy-kpis.html", "KPI năng lượng", "KPI", "📊"],
      ["manager-zone-comparison.html", "So sánh Zone", "So sánh", "📈"],
      ["manager-monthly-report.html", "Báo cáo tháng", "Báo cáo", "📑"],
      ["profile.html?role=manager", "Hồ sơ cá nhân", "Hồ sơ", "👤"]
    ]
  },
  admin: {
    key: "admin",
    name: "Nguyễn Minh Anh",
    description: "Quản trị hệ thống",
    roleTitle: "System Administrator (SV3)",
    initials: "NA",
    email: "minh.anh@greentower.vn",
    phone: "0988 246 810",
    department: "Ban Vận hành • P. B2-04",
    section: "QUẢN TRỊ HỆ THỐNG",
    features: [
      ["admin-zone-management.html", "Quản lý Zone", "Zones", "🏢"],
      ["admin-sensor-management.html", "Quản lý Cảm biến", "Cảm biến", "📡"],
      ["admin-user-management.html", "Quản lý Người dùng", "Người dùng", "👥"],
      ["profile.html?role=admin", "Hồ sơ cá nhân", "Hồ sơ", "👤"]
    ]
  }
};

document.addEventListener("DOMContentLoaded", () => {
  if (window.__SMARTBUILDING_NAV_INITIALIZED) return;
  window.__SMARTBUILDING_NAV_INITIALIZED = true;

  initMobileDrawer();
  initRoleNavigation();
  highlightActiveNavigation();
  initHeaderNotifications();
});

function detectRoleKey() {
  const currentUrl = new URL(window.location.href);
  const currentPage = currentUrl.pathname.split("/").pop() || "index.html";
  const requestedRole = currentUrl.searchParams.get("role");

  if (currentPage.startsWith("admin-")) return "admin";
  if (currentPage.startsWith("manager-")) return "manager";
  if (currentPage.startsWith("occupant-")) return "occupant";
  if (currentPage.startsWith("engineer-") || currentPage.startsWith("operator-")) return "operator";

  if (currentPage === "profile.html") {
    if (requestedRole && UNIFIED_ROLES[requestedRole]) return requestedRole;
    try {
      const u = JSON.parse(localStorage.getItem("smartbuilding_user") || "null");
      if (u && u.role && UNIFIED_ROLES[u.role]) return u.role;
    } catch (e) {}
    return "operator";
  }

  try {
    const u = JSON.parse(localStorage.getItem("smartbuilding_user") || "null");
    if (u && u.role && UNIFIED_ROLES[u.role]) return u.role;
  } catch (e) {}

  return "operator";
}

function initRoleNavigation() {
  const roleKey = detectRoleKey();
  const role = UNIFIED_ROLES[roleKey];
  const savedProfile = readRoleProfile(role.key);

  const displayName = savedProfile && typeof savedProfile.name === "string" && savedProfile.name.trim()
    ? savedProfile.name.trim()
    : role.name;
  const initials = getInitials(displayName, role.initials);

  // Sync session
  try {
    const savedUser = JSON.parse(localStorage.getItem("smartbuilding_user") || "null");
    if (!savedUser || savedUser.role !== role.key) {
      localStorage.setItem("smartbuilding_user", JSON.stringify({
        email: (savedProfile && savedProfile.email) || role.email,
        name: displayName,
        role: role.key,
        roleTitle: role.roleTitle,
        phone: (savedProfile && savedProfile.phone) || role.phone,
        dept: (savedProfile && savedProfile.department) || role.department
      }));
    }
  } catch (e) {}

  // 1. Sidebar Setup
  const sidebar = document.getElementById("appSidebar");
  if (sidebar) {
    sidebar.querySelectorAll(".sidebar-section-title, .sidebar-divider, .sidebar-nav").forEach((item) => item.remove());

    const profileName = sidebar.querySelector(".profile-name");
    const profileRole = sidebar.querySelector(".profile-role");
    const profileAvatar = sidebar.querySelector(".profile-avatar");
    if (profileName) profileName.textContent = displayName;
    if (profileRole) profileRole.textContent = role.description;
    if (profileAvatar) renderNavigationAvatar(profileAvatar, savedProfile && savedProfile.avatar, initials);

    const sectionTitle = document.createElement("div");
    sectionTitle.className = "sidebar-section-title";
    sectionTitle.textContent = role.section;

    const navigation = document.createElement("nav");
    navigation.className = "sidebar-nav";
    navigation.setAttribute("aria-label", `Các chức năng ${role.name}`);
    role.features.forEach(([href, label], index) => {
      const link = document.createElement("a");
      link.className = "nav-item";
      link.href = href;

      const number = document.createElement("span");
      number.className = "nav-num";
      number.textContent = String(index + 1).padStart(2, "0");

      const text = document.createElement("span");
      text.className = "nav-label";
      text.textContent = label;

      const arrow = document.createElement("span");
      arrow.className = "nav-arrow";
      arrow.textContent = "›";

      link.append(number, text, arrow);
      navigation.append(link);
    });

    const sidebarBottom = sidebar.querySelector(".sidebar-bottom");
    if (sidebarBottom) {
      sidebar.insertBefore(sectionTitle, sidebarBottom);
      sidebar.insertBefore(navigation, sidebarBottom);
    } else {
      sidebar.append(sectionTitle, navigation);
    }
  }

  // 2. Header Setup
  document.querySelectorAll(".header-user").forEach((headerUser) => {
    const name = headerUser.querySelector(".user-name");
    const userRole = headerUser.querySelector(".user-role");
    let avatar = headerUser.querySelector(".profile-avatar");
    const avatarImg = headerUser.querySelector(".user-avatar-img");

    if (avatarImg && !avatar) {
      avatar = document.createElement("div");
      avatar.className = "profile-avatar";
      avatarImg.replaceWith(avatar);
    }

    if (name) name.textContent = displayName;
    if (userRole) userRole.textContent = role.roleTitle;
    if (avatar) renderNavigationAvatar(avatar, savedProfile && savedProfile.avatar, initials);

    headerUser.setAttribute("role", "link");
    headerUser.setAttribute("tabindex", "0");
    headerUser.setAttribute("aria-label", `Mở hồ sơ ${role.name}`);
    headerUser.style.cursor = "pointer";

    headerUser.onclick = () => {
      window.location.href = `profile.html?role=${role.key}`;
    };
    headerUser.onkeydown = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.location.href = `profile.html?role=${role.key}`;
      }
    };
  });

  // 3. Mobile Bottom Navigation Bar
  const bottomNavigation = document.querySelector(".mobile-bottom-nav");
  if (bottomNavigation) {
    bottomNavigation.classList.add("user-bottom-nav");
    bottomNavigation.replaceChildren();
    role.features.forEach(([href, , shortLabel, icon]) => {
      const link = document.createElement("a");
      link.className = "bottom-nav-item";
      link.href = href;

      const iconElement = document.createElement("span");
      iconElement.className = "bottom-nav-icon";
      iconElement.textContent = icon;

      const label = document.createElement("span");
      label.className = "bottom-nav-label";
      label.textContent = shortLabel;

      link.append(iconElement, label);
      bottomNavigation.append(link);
    });
  }
}

function readRoleProfile(roleKey) {
  try {
    const storedProfile = localStorage.getItem(`smartbuilding_profile_${roleKey}`);
    return storedProfile ? JSON.parse(storedProfile) : null;
  } catch (error) {
    console.error(`Không thể đọc hồ sơ vai trò ${roleKey}:`, error);
    return null;
  }
}

function getInitials(name, fallback) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1 && words[0]) return words[0].slice(0, 2).toUpperCase();
  const initials = words.map((part) => part[0]).slice(-2).join("").toUpperCase();
  return initials || fallback;
}

function renderNavigationAvatar(element, avatarUrl, initials) {
  const validAvatar = typeof avatarUrl === "string"
    && /^data:image\/(?:png|jpeg|webp);base64,/i.test(avatarUrl);
  if (validAvatar) {
    const image = document.createElement("img");
    image.src = avatarUrl;
    image.alt = "";
    element.replaceChildren(image);
  } else {
    element.textContent = initials;
  }
}

function initMobileDrawer() {
  const toggleBtn = document.getElementById("menuToggleBtn");
  const closeBtn = document.getElementById("closeSidebarBtn");
  const overlay = document.getElementById("sidebarOverlay");
  const sidebar = document.getElementById("appSidebar");

  function openDrawer() {
    if (sidebar) sidebar.classList.add("show-mobile");
    if (overlay) overlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    if (sidebar) sidebar.classList.remove("show-mobile");
    if (overlay) overlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  if (toggleBtn) toggleBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar && sidebar.classList.contains("show-mobile")) {
      closeDrawer();
    }
  });
}

function highlightActiveNavigation() {
  const currentUrl = new URL(window.location.href);
  const currentPath = currentUrl.pathname.split("/").pop() || "index.html";
  const currentRole = currentUrl.searchParams.get("role") || detectRoleKey();

  document.querySelectorAll(".sidebar-nav .nav-item, .bottom-nav-item").forEach((item) => {
    const href = item.getAttribute("href");
    if (!href) return;
    const targetUrl = new URL(href, window.location.href);
    const targetPath = targetUrl.pathname.split("/").pop();
    const samePath = targetPath === currentPath;
    const sameProfileRole = currentPath !== "profile.html"
      || targetUrl.searchParams.get("role") === currentRole;
    item.classList.toggle("active", samePath && sameProfileRole);
  });
}

function initHeaderNotifications() {
  document.querySelectorAll(".header-icon-btn").forEach((btn) => {
    btn.setAttribute("title", "Thông báo hệ thống");
    btn.addEventListener("click", () => {
      showToast("Green Tower IoT: 148/152 cảm biến trực tuyến, phụ tải điện ổn định.", "info");
    });
  });
}

function handleLogout() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống Green Tower SmartBuilding?")) {
    localStorage.removeItem("smartbuilding_user");
    const isInPages = window.location.pathname.includes("/pages/");
    window.location.href = isInPages ? "login.html" : "pages/login.html";
  }
}

function showToast(message, type = "success") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }

  const icons = {
    danger: "✕",
    warning: "⚠",
    success: "✓",
    info: "ℹ"
  };

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.success}</span>
    <span class="toast-text">${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Global exports
window.initRoleNavigation = initRoleNavigation;
window.highlightActiveNavigation = highlightActiveNavigation;
window.showToast = showToast;
window.handleLogout = handleLogout;
