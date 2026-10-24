/**
 * CSE122 - SMARTBUILDING TEAM 01
 * login.js - Authentication simulation & Demo role fast-switch
 */

const DEMO_ACCOUNTS = {
  admin: {
    username: "admin@smartbuilding.io",
    password: "password123",
    name: "Nguyễn Quản Trị",
    role: "admin",
    roleTitle: "System Administrator",
    redirect: "admin-zone-management.html"
  },
  manager: {
    username: "manager@smartbuilding.io",
    password: "password123",
    name: "Trần Năng Lượng",
    role: "manager",
    roleTitle: "Energy Manager",
    redirect: "manager-energy-kpis.html"
  },
  engineer: {
    username: "engineer@smartbuilding.io",
    password: "password123",
    name: "Phạm Kỹ Thuật",
    role: "engineer",
    roleTitle: "Facility Engineer",
    redirect: "operator-energy-monitor.html"
  },
  occupant: {
    username: "occupant@smartbuilding.io",
    password: "password123",
    name: "Hoàng Nhân Viên",
    role: "occupant",
    roleTitle: "Office Occupant",
    redirect: "manager-energy-kpis.html" // fallback for demo
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("emailInput").value.trim();
      const password = document.getElementById("passwordInput").value;

      // Find account matching email or default to Manager
      let matched = Object.values(DEMO_ACCOUNTS).find(acc => acc.username === email);
      if (!matched) {
        matched = {
          name: email.split("@")[0] || "Người dùng",
          role: "manager",
          roleTitle: "Energy Manager",
          redirect: "manager-energy-kpis.html"
        };
      }

      localStorage.setItem("smartbuilding_user", JSON.stringify(matched));
      alert(`Đăng nhập thành công với vai trò: ${matched.roleTitle}`);
      window.location.href = matched.redirect;
    });
  }
});

// Fast-login buttons for demonstration
function demoFastLogin(roleKey) {
  const acc = DEMO_ACCOUNTS[roleKey];
  if (!acc) return;

  const emailField = document.getElementById("emailInput");
  const passwordField = document.getElementById("passwordInput");

  if (emailField && passwordField) {
    emailField.value = acc.username;
    passwordField.value = acc.password;
  }

  localStorage.setItem("smartbuilding_user", JSON.stringify(acc));
  setTimeout(() => {
    window.location.href = acc.redirect;
  }, 250);
}

window.demoFastLogin = demoFastLogin;
