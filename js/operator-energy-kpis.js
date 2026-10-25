(() => {
  const MONTHLY_BASELINE = {
    electricityCostMillionVND: 482.6,
    co2EmissionsKg: 128400
  };

  document.addEventListener("DOMContentLoaded", () => {
    initWhatIfSimulator();
    initZoneBarsTooltip();
  });

  function initWhatIfSimulator() {
    const slider = document.getElementById("powerReductionSlider");
    const percentDisplay = document.getElementById("reductionPercentDisplay");
    const costDisplay = document.getElementById("savedCostVal");
    const co2Display = document.getElementById("savedCO2Val");
    const fillBar = document.getElementById("rangeFillBar");
    const saveBtn = document.getElementById("btnSaveScenario");

    if (!slider) return;

    function updateSimulator(reductionPercent) {
      const percent = parseFloat(reductionPercent);
      const savedCostMillion = MONTHLY_BASELINE.electricityCostMillionVND * (percent / 100);
      const savedCO2Kg = Math.round(MONTHLY_BASELINE.co2EmissionsKg * (percent / 100));

      if (percentDisplay) percentDisplay.textContent = `${percent}%`;
      if (costDisplay) costDisplay.textContent = `−${savedCostMillion.toFixed(1).replace(".", ",")} triệu`;
      if (co2Display) co2Display.textContent = `−${savedCO2Kg.toLocaleString("vi-VN")}`;

      if (fillBar) {
        const min = parseFloat(slider.min) || 5;
        const max = parseFloat(slider.max) || 50;
        const progress = ((percent - min) / (max - min)) * 100;
        fillBar.style.width = `${progress}%`;
      }
    }

    slider.addEventListener("input", (event) => updateSimulator(event.target.value));

    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        const currentPercent = slider.value;
        const scenarioData = {
          reductionPercent: currentPercent,
          savedCostMillion: (MONTHLY_BASELINE.electricityCostMillionVND * (currentPercent / 100)).toFixed(1),
          savedCO2Kg: Math.round(MONTHLY_BASELINE.co2EmissionsKg * (currentPercent / 100)),
          savedAt: new Date().toISOString()
        };

        localStorage.setItem("smartbuilding_scenario_ai3", JSON.stringify(scenarioData));

        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = "✓ Đã lưu kịch bản thành công!";
        saveBtn.style.backgroundColor = "#047857";
        setTimeout(() => {
          saveBtn.innerHTML = originalText;
          saveBtn.style.backgroundColor = "";
        }, 2500);
      });
    }

    updateSimulator(slider.value);
  }

  function initZoneBarsTooltip() {
    document.querySelectorAll(".chart-bar").forEach((bar) => {
      const kw = bar.getAttribute("data-kw");
      const zoneName = bar.getAttribute("data-zone");
      if (kw && zoneName) bar.title = `${zoneName}: ${kw} kW`;
    });
  }
})();
