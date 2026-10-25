/**
 * CSE122 - SMARTBUILDING TEAM 01 (BTL-36)
 * login.js - Authentication simulation & Demo role fast-switch
 * Matching Figma Login Page Specification
 */

// Demo accounts - matching Figma quick login buttons
const DEMO_ACCOUNTS = {
  admin: {
    email: "minh.anh@greentower.vn",
    password: "admin2026",
    name: "Nguyễn Minh Anh",
    role: "admin",
    roleTitle: "System Administrator (SV3)",
    redirect: "admin-zone-management.html"
  },
  manager: {
    email: "thuha@greentower.vn",
    password: "manager2026",
    name: "Trần Thu Hà",
    role: "manager",
    roleTitle: "Facility Manager (SV3)",
    redirect: "manager-energy-kpis.html"
  },
  engineer: {
    username: "engineer@smartbuilding.io",
    password: "password123",
    name: "Phạm Kỹ Thuật",
    role: "engineer",
    roleTitle: "Facility Engineer",
    redirect: "manager-energy-kpis.html" // fallback for demo
  },
  occupant: {
    email: "occupant@greentower.vn",
    password: "occupant2026",
    name: "Hoàng Nhân Viên",
    role: "occupant",
    roleTitle: "Office Occupant (SV2)",
    redirect: "",
    disabled: true
  }
};

// ============================================================
// DOMContentLoaded - Init
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");

  // Form submit handler
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";

      // Validate
      if (!email) {
        showFieldError("emailError", true);
        emailInput?.focus();
        return;
      }
      showFieldError("emailError", false);

      // Match account by email
      let matched = Object.values(DEMO_ACCOUNTS).find(
        acc => acc.email.toLowerCase() === email.toLowerCase()
      );

      // Nếu là vai trò Occupant hoặc Operator (chưa tích hợp) -> vô hiệu hóa, không xảy ra gì hết
      if (matched && (matched.role === "occupant" || matched.role === "operator" || matched.disabled)) {
        return;
      }

      // If no exact match, handle admin vs manager
      if (!matched) {
        const lowerEmail = email.toLowerCase();
        // Nếu nhập email có từ khóa occupant hoặc operator -> vô hiệu hóa, không xảy ra gì hết
        if (lowerEmail.includes("occupant") || lowerEmail.includes("operator") || lowerEmail.includes("engineer")) {
          return;
        }

        if (lowerEmail.includes("admin")) {
          matched = {
            email: email,
            name: email.split("@")[0] || "Quản trị viên",
            role: "admin",
            roleTitle: "System Administrator",
            redirect: "admin-zone-management.html"
          };
        } else {
          matched = {
            email: email,
            name: email.split("@")[0] || "Trần Thu Hà",
            role: "manager",
            roleTitle: "Facility Manager",
            redirect: "manager-energy-kpis.html"
          };
        }
      }

      if (!matched.redirect) return;

      // Save session
      localStorage.setItem("smartbuilding_user", JSON.stringify(matched));

      // Visual feedback: button loading state
      const submitBtn = loginForm.querySelector(".login-submit-btn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Đang đăng nhập…</span>`;
      }

      // Navigate after brief delay
      setTimeout(() => {
        window.location.href = matched.redirect;
      }, 400);
    });
  }

  // Real-time email validation
  if (emailInput) {
    emailInput.addEventListener("input", () => {
      showFieldError("emailError", false);
    });
  }
});

// ============================================================
// Helper: Show / hide field error
// ============================================================
function showFieldError(elementId, show) {
  const el = document.getElementById(elementId);
  if (el) {
    el.style.display = show ? "block" : "none";
  }
}

// ============================================================
// Fast Demo Login - fills credentials and redirects immediately
// Called from onclick="demoFastLogin('role')" on demo buttons
// ============================================================
function demoFastLogin(roleKey) {
  // 2 vai trò Occupant và Operator đang được thành viên khác làm, chưa tích hợp:
  // Vô hiệu hóa: bấm vào không xảy ra gì hết
  if (roleKey === "occupant" || roleKey === "operator") {
    return;
  }

  const acc = DEMO_ACCOUNTS[roleKey];
  if (!acc || !acc.redirect) return;

  // Fill form fields for visual feedback
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");

  if (emailInput) emailInput.value = acc.email;
  if (passwordInput) passwordInput.value = acc.password;

  // Save session
  localStorage.setItem("smartbuilding_user", JSON.stringify(acc));

  // Visual: highlight the clicked button briefly
  const allBtns = document.querySelectorAll(".demo-role-btn");
  allBtns.forEach(btn => btn.style.borderColor = "var(--border-color)");

  // Navigate
  setTimeout(() => {
    window.location.href = acc.redirect;
  }, 200);
}

// Expose to global scope for onclick attributes
window.demoFastLogin = demoFastLogin;

// ============================================================
// handleLogout - used across all pages
// ============================================================
function handleLogout() {
  localStorage.removeItem("smartbuilding_user");
  const isInPages = window.location.pathname.includes("/pages/");
  window.location.href = isInPages ? "login.html" : "pages/login.html";
}

window.handleLogout = handleLogout;
