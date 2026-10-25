document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("engineerAlertList");
  const filter = document.getElementById("alertFilter");
  if (!list) return;

  function updateAlertCount() {
    const cards = list.querySelectorAll(".user-alert-card");
    const count = document.getElementById("openAlertCount");
    const criticalCount = document.getElementById("criticalAlertCount");
    if (count) count.innerHTML = `${cards.length} <small>cảnh báo</small>`;
    if (criticalCount) {
      const critical = list.querySelectorAll('.user-alert-card[data-severity="critical"]').length;
      criticalCount.innerHTML = `${critical} <small>sự cố</small>`;
    }
  }

  function applyFilter() {
    const severity = filter ? filter.value : "all";
    list.querySelectorAll(".user-alert-card").forEach((card) => {
      card.hidden = severity !== "all" && card.dataset.severity !== severity;
    });
    updateAlertCount();
  }

  if (filter) filter.addEventListener("change", applyFilter);
  list.querySelectorAll("[data-alert-ack]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".user-alert-card");
      if (!card) return;
      const alertTitle = card.querySelector(".user-alert-title")?.textContent || "cảnh báo";
      card.remove();
      updateAlertCount();
      const message = document.getElementById("userActionMessage");
      if (message) message.textContent = "Đã tiếp nhận cảnh báo. Hãy kiểm tra thiết bị theo quy trình vận hành.";
      if (typeof window.showToast === "function") {
        window.showToast(`Đã tiếp nhận: ${alertTitle}`, "success");
      }
    });
  });

  applyFilter();
});
