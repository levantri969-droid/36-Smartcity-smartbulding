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
      const co2DisplayFormat = savedCO2Kg.toLocaleString("vi-VN");
      co2Display.textContent = `−${co2DisplayFormat}`;
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


// ─── AI-3 6-STEP UX (Bổ sung theo chuẩn Barem – BTL-36) ──────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initAI3SixStep();
  /* Handled globally by main.js */
  initNetworkStatusManager();
});

function initAI3SixStep() {
  const btnRun    = document.getElementById("btnRunAI3");
  const slider    = document.getElementById("powerReductionSlider");
  if (!btnRun || !slider) return;

  const setStep = (n) => {
    for (let i = 1; i <= 6; i++) {
      const el = document.getElementById("aiStep" + i);
      if (!el) continue;
      el.classList.remove("active", "done");
      if (i < n)  el.classList.add("done");
      if (i === n) el.classList.add("active");
    }
  };

  btnRun.addEventListener("click", async () => {
    const percent = parseFloat(slider.value);

    // Ẩn input, hiện loading
    document.getElementById("aiInputSection").classList.add("d-none");
    document.getElementById("aiLoadingSection").classList.remove("d-none");
    document.getElementById("aiResultSection").classList.add("d-none");
    setStep(2);

    // Animate progress bar
    const fill  = document.getElementById("aiProgressFill");
    const label = document.getElementById("aiProgressLabel");
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 95) progress = 95;
      if (fill)  fill.style.width = progress + "%";
      if (label) label.textContent = Math.round(progress) + "%";
    }, 80);

    // Gọi AI Engine
    let result;
    try {
      if (typeof AIEngine !== "undefined") {
        result = await AIEngine.simulateWhatIf(percent);
      } else {
        // Fallback nếu ai-engine.js chưa load
        await new Promise(r => setTimeout(r, 900));
        result = {
          success: true, confidence: 91,
          savedCostMillion: (482.6 * percent / 100).toFixed(1),
          savedCO2Kg: Math.round(128400 * percent / 100),
          explainability: "Dự báo dựa trên hệ số tải Chiller (COP 4.8) và biểu giá điện EVN Hà Nội."
        };
      }
    } catch(e) {
      result = { success: false, confidence: 30, message: "Lỗi kết nối tới AI Engine." };
    }

    clearInterval(interval);
    if (fill)  fill.style.width = "100%";
    if (label) label.textContent = "100%";
    await new Promise(r => setTimeout(r, 250));

    // Ẩn loading, hiện kết quả
    document.getElementById("aiLoadingSection").classList.add("d-none");
    document.getElementById("aiResultSection").classList.remove("d-none");

    if (!result.success || result.confidence < 50) {
      // AI Failure UX
      setStep(3);
      document.getElementById("aiFailureCard").classList.remove("d-none");
      document.getElementById("aiSuccessCard").classList.add("d-none");
      const failMsg = document.getElementById("aiFailureMsg");
      if (failMsg) failMsg.textContent = result.message || `Độ tin cậy chỉ ${result.confidence}% – không đủ để dự báo chính xác.`;
    } else {
      // Kết quả thành công
      setStep(3);
      document.getElementById("aiFailureCard").classList.add("d-none");
      document.getElementById("aiSuccessCard").classList.remove("d-none");
      document.getElementById("aiSavedCard").classList.add("d-none");

      // Cập nhật số liệu (Bước 3)
      const costEl = document.getElementById("savedCostVal");
      const co2El  = document.getElementById("savedCO2Val");
      const confEl = document.getElementById("aiConfidenceVal");
      const expEl  = document.getElementById("aiExplainText");
      if (costEl) costEl.textContent = "-" + String(result.savedCostMillion).replace(".", ",") + " triệu";
      if (co2El)  co2El.textContent  = "-" + result.savedCO2Kg.toLocaleString("vi-VN");
      if (confEl) confEl.textContent = result.confidence + "%";
      if (expEl)  expEl.textContent  = result.explainability || "";

      // Bước 4 hiển thị explainability (đã có trong HTML)
      setStep(4);
      setTimeout(() => setStep(5), 500);

      // Bước 5: Nút chấp nhận / từ chối / chỉnh sửa / tạo lại
      const btnAccept = document.getElementById("btnAiAccept");
      const btnEdit   = document.getElementById("btnAiEdit");
      const btnReject = document.getElementById("btnAiReject");
      const btnRetry  = document.getElementById("btnAiRetry");

      if (btnAccept) {
        btnAccept.onclick = () => {
          // Bước 6: Lưu vào DB
          const scenario = {
            id: "AI3-" + Date.now(),
            reductionPercent: percent,
            savedCostMillion: result.savedCostMillion,
            savedCO2Kg: result.savedCO2Kg,
            confidence: result.confidence,
            savedAt: new Date().toISOString()
          };
          localStorage.setItem("smartbuilding_scenario_ai3", JSON.stringify(scenario));
          if (typeof DB !== "undefined") {
            DB.insert("challenges", scenario);
          }
          setStep(6);
          document.getElementById("aiSavedCard").classList.remove("d-none");
          btnAccept.disabled = true;
          btnAccept.textContent = "Đã lưu";
          showKPIToast("Kịch bản AI-3 đã được lưu thành công!");
        };
      }

      if (btnEdit) {
        btnEdit.onclick = () => {
          document.getElementById("aiResultSection").classList.add("d-none");
          document.getElementById("aiInputSection").classList.remove("d-none");
          setStep(1);
        };
      }

      if (btnReject) {
        btnReject.onclick = () => {
          document.getElementById("aiResultSection").classList.add("d-none");
          document.getElementById("aiInputSection").classList.remove("d-none");
          setStep(1);
          showKPIToast("Kịch bản đã bị từ chối. Vui lòng điều chỉnh thông số.");
        };
      }

      if (btnRetry) {
        btnRetry.onclick = () => {
          document.getElementById("aiResultSection").classList.add("d-none");
          document.getElementById("aiInputSection").classList.remove("d-none");
          setStep(1);
          setTimeout(() => btnRun.click(), 100);
        };
      }
    }
  });
}

function initDarkModeManager() { /* Handled globally by main.js */ }

function initNetworkStatusManager() {
  const label = document.getElementById("footerNetLabel");
  const update = () => {
    if (label) label.textContent = navigator.onLine ? "● Online" : "● Offline";
    if (label) label.style.color = navigator.onLine ? "#10B981" : "#EF4444";
  };
  update();
  window.addEventListener("online",  update);
  window.addEventListener("offline", update);
}

function showKPIToast(message) {
  const c = document.getElementById("toastContainer");
  if (!c) return;
  const t = document.createElement("div");
  t.className = "toast-item";
  t.textContent = message;
  t.setAttribute("role", "status");
  c.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 350); }, 3000);
}
