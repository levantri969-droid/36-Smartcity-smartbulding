/**
 * CSE122 - SMARTBUILDING TEAM 01
 * manager-kpis.js - Logic for AI-3 What-if Simulator and Dynamic Calculations
 */

// Monthly baseline metrics for Green Tower
const MONTHLY_BASELINE = {
  electricityCostMillionVND: 482.6, // 482,6 triệu VNĐ / tháng
  co2EmissionsKg: 128400            // 128,4 Tấn = 128.400 kg CO2 / tháng
};

document.addEventListener("DOMContentLoaded", () => {
  initWhatIfSimulator();
  initZoneBarsTooltip();
});

function initWhatIfSimulator() {
  const slider = document.getElementById("powerReductionSlider");
  const percentDisplay = document.getElementById("reductionPercentDisplay") || document.getElementById("sliderPercentDisplay");
  const costDisplay = document.getElementById("savedCostVal");
  const co2Display = document.getElementById("savedCO2Val");
  const fillBar = document.getElementById("rangeFillBar");
  const saveBtn = document.getElementById("btnSaveScenario");

  if (!slider) return;

  function updateSimulator(reductionPercent) {
    const percent = parseFloat(reductionPercent);

    // 1. Calculate savings
    // Cost savings in million VND: 482.6 * (percent / 100)
    const savedCostMillion = (MONTHLY_BASELINE.electricityCostMillionVND * (percent / 100));
    
    // CO2 reduction in kg: 128,400 * (percent / 100)
    const savedCO2Kg = Math.round(MONTHLY_BASELINE.co2EmissionsKg * (percent / 100));

    // 2. Render to DOM
    if (percentDisplay) {
      percentDisplay.textContent = `${percent}%`;
    }

    if (costDisplay) {
      // Format with Vietnamese comma decimal (e.g., −57,9 triệu)
      costDisplay.textContent = `−${savedCostMillion.toFixed(1).replace(".", ",")} triệu`;
    }

    if (co2Display) {
      // Format with dot thousand separator (e.g., −15.408)
      costDisplayFormat = savedCO2Kg.toLocaleString("vi-VN");
      co2Display.textContent = `−${costDisplayFormat}`;
    }

    // 3. Update slider track fill percentage
    if (fillBar) {
      const min = parseFloat(slider.min) || 5;
      const max = parseFloat(slider.max) || 50;
      const progress = ((percent - min) / (max - min)) * 100;
      fillBar.style.width = `${progress}%`;
    }
  }

  // Event listener on slider drag
  slider.addEventListener("input", (e) => {
    updateSimulator(e.target.value);
  });

  // Save Scenario Button Handler
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

      // Visual feedback
      const originalText = saveBtn.innerHTML;
      saveBtn.innerHTML = "✓ Đã lưu kịch bản thành công!";
      saveBtn.style.backgroundColor = "#047857";

      setTimeout(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.style.backgroundColor = "";
      }, 2500);
    });
  }

  // Initial calculation on page load
  updateSimulator(slider.value);
}

// Add simple hover tooltip to Zone chart bars
function initZoneBarsTooltip() {
  const bars = document.querySelectorAll(".chart-bar");
  bars.forEach((bar) => {
    const kw = bar.getAttribute("data-kw");
    const zoneName = bar.getAttribute("data-zone");
    if (kw && zoneName) {
      bar.title = `${zoneName}: ${kw} kW`;
    }
  });
}
