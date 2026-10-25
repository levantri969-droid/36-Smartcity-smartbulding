document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("savingActionList");
  if (!list) return;

  function updatePendingCount() {
    const count = list.querySelectorAll("[data-action-card]:not([data-action-complete])").length;
    const display = document.getElementById("pendingActionCount");
    if (display) display.innerHTML = `${count} <small>đề xuất</small>`;
  }

  list.querySelectorAll("[data-saving-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-action-card]");
      if (!card) return;
      card.dataset.actionComplete = "true";
      const actionName = card.querySelector(".user-action-title, .user-stat-label")?.textContent || "hành động";

      if (button.dataset.savingAction === "dismiss") {
        card.remove();
        if (typeof window.showToast === "function") {
          window.showToast(`Đã bỏ qua đề xuất: ${actionName}`, "warning");
        }
      } else {
        card.querySelectorAll("[data-saving-action]").forEach((actionButton) => {
          actionButton.disabled = true;
        });
        button.textContent = "Đã chuyển thành nhiệm vụ ✓";
        const status = card.querySelector(".report-status");
        if (status) {
          status.className = "report-status status-good";
          status.textContent = "Đã tiếp nhận";
        }
        if (typeof window.showToast === "function") {
          window.showToast(`Đã chuyển thành nhiệm vụ: ${actionName}`, "success");
        }
      }
      updatePendingCount();
      const message = document.getElementById("userActionMessage");
      if (message) {
        message.textContent = button.dataset.savingAction === "dismiss"
          ? "Đã bỏ qua đề xuất này."
          : "Đề xuất đã được chuyển thành nhiệm vụ vận hành.";
      }
    });
  });
});
