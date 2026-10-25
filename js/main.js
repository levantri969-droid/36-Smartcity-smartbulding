/**
 * CSE122 - SMARTBUILDING TEAM 01
 * main.js - Master Navigation, Mobile Drawer Toggle, Logout & Global Toast
 */

document.addEventListener("DOMContentLoaded", () => {
  initGlobalDarkMode();
  syncCurrentRoleSession();
  initMobileDrawer();
  highlightActiveNavigation();
});

// 0. Auto Sync Current Role Session (Only initialize fallback mock if no active session exists)
function syncCurrentRoleSession() {
  const currentPath = window.location.pathname.split("/").pop() || "";
  let savedUser = null;
  try {
    savedUser = JSON.parse(localStorage.getItem("smartbuilding_user") || "null");
  } catch (e) {}

  // Preserve existing active user session; only set default mock user if no session exists
  if (!savedUser) {
    if (currentPath.startsWith("manager-")) {
      localStorage.setItem("smartbuilding_user", JSON.stringify({
        email: "thuha@greentower.vn",
        name: "Trần Thu Hà",
        role: "manager",
        roleTitle: "Facility Manager (SV3)",
        phone: "0912 345 678",
        dept: "Ban Quản lý Năng lượng • P. 12-01"
      }));
    } else if (currentPath.startsWith("admin-")) {
      localStorage.setItem("smartbuilding_user", JSON.stringify({
        email: "minh.anh@greentower.vn",
        name: "Nguyễn Minh Anh",
        role: "admin",
        roleTitle: "System Administrator (SV3)",
        phone: "0988 246 810",
        dept: "Ban Vận hành • P. B2-04"
      }));
    }
  }
}

// 1. Mobile Off-Canvas Drawer Toggle
function initMobileDrawer() {
  const toggleBtn = document.getElementById("menuToggleBtn");
  const closeBtn = document.getElementById("closeSidebarBtn");
  const overlay = document.getElementById("sidebarOverlay");
  const sidebar = document.getElementById("appSidebar");

  function openDrawer() {
    if (sidebar) sidebar.classList.add("show-mobile");
    if (overlay) overlay.classList.add("show");
    document.body.style.overflow = "hidden"; // Prevent body scroll when drawer open
  }

  function closeDrawer() {
    if (sidebar) sidebar.classList.remove("show-mobile");
    if (overlay) overlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", openDrawer);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeDrawer);
  }

  if (overlay) {
    overlay.addEventListener("click", closeDrawer);
  }

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar && sidebar.classList.contains("show-mobile")) {
      closeDrawer();
    }
  });
}

// 2. Automatically Highlight Active Nav Item
function highlightActiveNavigation() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  // Sidebar items
  const sidebarNavItems = document.querySelectorAll(".sidebar-nav .nav-item");
  sidebarNavItems.forEach((item) => {
    const rawHref = item.getAttribute("href") || "";
    const cleanHref = rawHref.split("?")[0].split("#")[0];
    if (cleanHref && (cleanHref === currentPath || (currentPath === "index.html" && cleanHref.includes("manager-energy-kpis.html")))) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Mobile bottom nav items
  const bottomNavItems = document.querySelectorAll(".bottom-nav-item");
  bottomNavItems.forEach((item) => {
    const rawHref = item.getAttribute("href") || "";
    const cleanHref = rawHref.split("?")[0].split("#")[0];
    if (cleanHref && cleanHref === currentPath) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

// 3. User Session & Logout Handler
function handleLogout() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống Green Tower SmartBuilding?")) {
    localStorage.removeItem("smartbuilding_user");
    const isInPages = window.location.pathname.includes("/pages/");
    window.location.href = isInPages ? "login.html" : "pages/login.html";
  }
}
window.handleLogout = handleLogout;

// 4. Global Toast Notification System
function showToast(message, type = "success") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === "danger" ? "✕" : (type === "warning" ? "⚠" : "✓")}</span>
    <span class="toast-text">${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
window.showToast = showToast;


// 5. Global Theme Management (Dark / Light Mode)
function initGlobalDarkMode() {
  const THEME_KEY = "sm_theme";
  
  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    updateIcon();
  }

  function updateIcon() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const btns = document.querySelectorAll("#darkModeToggle, .dark-mode-toggle");
    btns.forEach(b => {
      b.innerHTML = isDark ? "&#x2600;&#xFE0F;" : "&#x1F319;";
      b.setAttribute("title", isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối");
    });
  }

  // Ensure button exists on the page
  let btn = document.getElementById("darkModeToggle");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "darkModeToggle";
    btn.className = "dark-mode-toggle";
    btn.setAttribute("aria-label", "Chuyển chế độ sáng / tối");
    document.body.appendChild(btn);
  }

  // Apply saved theme
  const saved = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(saved);

  // Attach click handler cleanly without conflict
  btn.onclick = function(e) {
    if (e) e.preventDefault();
    const currentTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
    if (typeof showToast === "function") {
      showToast(newTheme === "dark" ? "Đã bật giao diện Tối" : "Đã chuyển sang giao diện Sáng", "info");
    }
  };

  // Sync across open tabs in real-time
  window.addEventListener("storage", (e) => {
    if (e.key === THEME_KEY) {
      applyTheme(e.newValue || "light");
    }
  });
}
window.initGlobalDarkMode = initGlobalDarkMode;
