/**
 * CSE122 - SMARTBUILDING TEAM 01 (BTL-36)
 * occupant-comfort-feedback.js
 * Trang Tiện nghi & Phản hồi - Occupant Role
 *
 * Yêu cầu: TC2 (4 states), TC3 (responsive/a11y), TC4 (semantic),
 *          TC5 (form/localStorage/filter/pagination), TC6 (AI 6 bước)
 */

(function () {
  'use strict';

  /* ============================================================
     CONSTANTS & CONFIG
  ============================================================ */
  const LS_SETTINGS_KEY = 'smartbuild_comfort_settings';
  const LS_FEEDBACK_KEY = 'smartbuild_feedback_list';
  const PAGE_SIZE = 5;
  const LOADING_DELAY_MS = 800;
  const AI_DELAY_MS = 600;

  /* ============================================================
     SAMPLE DATA - ≥15 realistic records
  ============================================================ */
  const SEED_FEEDBACK_DATA = [
    {
      id: 'FB001', room: 'B1204', name: 'Nguyễn Thúy Linh',
      type: 'Nhiệt độ phòng', rating: 2,
      content: 'Phòng quá lạnh vào buổi sáng, nhiệt độ khoảng 20°C gây khó chịu khi làm việc.',
      status: 'Đã giải quyết', date: '2026-10-20',
      resolvedNote: 'Đã điều chỉnh nhiệt độ HVAC tầng 12 lên 23°C'
    },
    {
      id: 'FB002', room: 'A0501', name: 'Trần Minh Tuấn',
      type: 'Chất lượng không khí', rating: 3,
      content: 'Không khí ngột ngạt vào giờ trưa, CO₂ cảm giác cao hơn bình thường.',
      status: 'Đang xử lý', date: '2026-10-21', resolvedNote: ''
    },
    {
      id: 'FB003', room: 'C0803', name: 'Lê Phương Anh',
      type: 'Ánh sáng', rating: 4,
      content: 'Ánh đèn hơi chói vào buổi chiều, mong giảm bớt độ sáng từ 15h-17h.',
      status: 'Chờ xử lý', date: '2026-10-22', resolvedNote: ''
    },
    {
      id: 'FB004', room: 'B0912', name: 'Phạm Quốc Huy',
      type: 'Nhiệt độ phòng', rating: 1,
      content: 'Điều hòa phát ra tiếng kêu lớn và không ổn định nhiệt độ. Cần kiểm tra ngay.',
      status: 'Đang xử lý', date: '2026-10-22', resolvedNote: ''
    },
    {
      id: 'FB005', room: 'A1101', name: 'Ngô Thị Hương',
      type: 'Khác', rating: 5,
      content: 'Hệ thống kiểm soát tiện nghi hoạt động rất tốt, cảm ơn ban vận hành.',
      status: 'Đã giải quyết', date: '2026-10-19',
      resolvedNote: 'Ghi nhận phản hồi tích cực.'
    },
    {
      id: 'FB006', room: 'D0604', name: 'Vũ Thanh Long',
      type: 'Chất lượng không khí', rating: 2,
      content: 'Mùi hăng từ phòng máy chủ lan sang khu vực làm việc tầng 6.',
      status: 'Đã giải quyết', date: '2026-10-18',
      resolvedNote: 'Đã lắp thêm bộ lọc khí và kiểm tra kín phòng máy chủ.'
    },
    {
      id: 'FB007', room: 'B1204', name: 'Nguyễn Thúy Linh',
      type: 'Ánh sáng', rating: 3,
      content: 'Khu vực góc tường thiếu ánh sáng, cần bổ sung đèn bàn.',
      status: 'Chờ xử lý', date: '2026-10-23', resolvedNote: ''
    },
    {
      id: 'FB008', room: 'C1005', name: 'Đỗ Minh Châu',
      type: 'Nhiệt độ phòng', rating: 4,
      content: 'Nhiệt độ ổn định, thoải mái làm việc cả ngày. Rất hài lòng.',
      status: 'Đã giải quyết', date: '2026-10-17',
      resolvedNote: 'Ghi nhận.'
    },
    {
      id: 'FB009', room: 'A0703', name: 'Hoàng Văn Bình',
      type: 'Chất lượng không khí', rating: 3,
      content: 'Độ ẩm phòng thấp, da khô và cổ họng khó chịu sau buổi sáng dài.',
      status: 'Đang xử lý', date: '2026-10-23', resolvedNote: ''
    },
    {
      id: 'FB010', room: 'B0701', name: 'Trịnh Thị Mai',
      type: 'Ánh sáng', rating: 5,
      content: 'Ánh đèn ban ngày kết hợp ánh sáng tự nhiên rất dễ chịu.',
      status: 'Đã giải quyết', date: '2026-10-16',
      resolvedNote: 'Ghi nhận phản hồi tích cực.'
    },
    {
      id: 'FB011', room: 'D1302', name: 'Phan Đức Anh',
      type: 'Nhiệt độ phòng', rating: 2,
      content: 'Điều hòa chạy liên tục nhưng phòng vẫn ấm, nghi ngờ bộ lọc bị bẩn.',
      status: 'Đang xử lý', date: '2026-10-24', resolvedNote: ''
    },
    {
      id: 'FB012', room: 'C0402', name: 'Lý Thị Kim Oanh',
      type: 'Khác', rating: 3,
      content: 'Đề xuất thêm cây xanh trong khu vực làm việc để cải thiện không khí tự nhiên.',
      status: 'Chờ xử lý', date: '2026-10-24', resolvedNote: ''
    },
    {
      id: 'FB013', room: 'A1205', name: 'Bùi Trọng Nghĩa',
      type: 'Chất lượng không khí', rating: 1,
      content: 'Mùi sơn từ tầng 13 đang thi công lan xuống tầng 12, ảnh hưởng sức khỏe nghiêm trọng.',
      status: 'Đang xử lý', date: '2026-10-24', resolvedNote: ''
    },
    {
      id: 'FB014', room: 'B0305', name: 'Nguyễn Hữu Đức',
      type: 'Ánh sáng', rating: 4,
      content: 'Hệ thống cảm biến ánh sáng tự động điều chỉnh rất thông minh, tiết kiệm năng lượng.',
      status: 'Đã giải quyết', date: '2026-10-15',
      resolvedNote: 'Ghi nhận.'
    },
    {
      id: 'FB015', room: 'C0901', name: 'Đinh Thị Lan',
      type: 'Nhiệt độ phòng', rating: 3,
      content: 'Phòng họp tầng 9 rất lạnh khi bật điều hòa ở chế độ tự động. Cần hiệu chỉnh ngưỡng.',
      status: 'Chờ xử lý', date: '2026-10-24', resolvedNote: ''
    }
  ];

  /* ============================================================
     STATE
  ============================================================ */
  let feedbackList = [];
  let filteredList = [];
  let currentPage = 1;
  let currentAIResult = null;
  let isSubmitting = false;

  /* ============================================================
     UTILITY: escapeHTML (chống XSS)
  ============================================================ */
  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function generateId() {
    return 'FB' + String(Date.now()).slice(-6) + Math.floor(Math.random() * 100);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function ratingStars(n) {
    const count = Number(n) || 0;
    return '★'.repeat(count) + '☆'.repeat(5 - count);
  }

  /* ============================================================
     LOCAL STORAGE: Settings
  ============================================================ */
  function loadSettings() {
    try {
      const raw = localStorage.getItem(LS_SETTINGS_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Storage full or blocked - fail silently
    }
  }

  /* ============================================================
     LOCAL STORAGE: Feedback List
  ============================================================ */
  function loadFeedbackFromStorage() {
    try {
      const raw = localStorage.getItem(LS_FEEDBACK_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    // First run: seed with sample data
    saveFeedbackToStorage(SEED_FEEDBACK_DATA);
    return [...SEED_FEEDBACK_DATA];
  }

  function saveFeedbackToStorage(list) {
    try {
      localStorage.setItem(LS_FEEDBACK_KEY, JSON.stringify(list));
    } catch { /* ignore */ }
  }

  /* ============================================================
     KPI: Calculate from feedback data
  ============================================================ */
  function updateKPIs() {
    if (!feedbackList.length) return;
    const ratings = feedbackList.map(f => Number(f.rating)).filter(r => r > 0);
    const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
    const kpiComfort = document.getElementById('kpiComfort');
    const kpiComfortNote = document.getElementById('kpiComfortNote');
    if (kpiComfort) {
      kpiComfort.textContent = avg.toFixed(1);
      const small = document.createElement('small');
      small.textContent = ' / 5';
      kpiComfort.appendChild(small);
    }
    if (kpiComfortNote) {
      kpiComfortNote.textContent = `Dựa trên ${ratings.length} phản hồi trong hệ thống`;
    }
  }

  /* ============================================================
     SETTINGS: Init sliders & toggle from localStorage
  ============================================================ */
  function initSettings() {
    const settings = loadSettings();
    const tempSlider = document.getElementById('comfortTemperature');
    const lightSlider = document.getElementById('comfortLighting');
    const tempValue = document.getElementById('comfortTemperatureValue');
    const lightValue = document.getElementById('comfortLightingValue');
    const powerToggle = document.getElementById('comfortPowerToggle');
    const systemStatus = document.getElementById('comfortSystemStatus');

    if (settings) {
      if (tempSlider && settings.temperature !== undefined) {
        tempSlider.value = settings.temperature;
        if (tempValue) tempValue.textContent = settings.temperature;
        tempSlider.setAttribute('aria-valuenow', settings.temperature);
      }
      if (lightSlider && settings.lighting !== undefined) {
        lightSlider.value = settings.lighting;
        if (lightValue) lightValue.textContent = settings.lighting;
        lightSlider.setAttribute('aria-valuenow', settings.lighting);
      }
      if (powerToggle && typeof settings.acOn === 'boolean') {
        const isOn = settings.acOn;
        powerToggle.classList.toggle('is-on', isOn);
        powerToggle.setAttribute('aria-pressed', String(isOn));
        if (systemStatus) {
          systemStatus.textContent = isOn ? 'Đang hoạt động' : 'Đã tắt';
          systemStatus.className = isOn ? 'status-good' : 'status-neutral';
        }
      }
    }

    // Slider events
    if (tempSlider && tempValue) {
      tempSlider.addEventListener('input', () => {
        tempValue.textContent = tempSlider.value;
        tempSlider.setAttribute('aria-valuenow', tempSlider.value);
      });
    }

    if (lightSlider && lightValue) {
      lightSlider.addEventListener('input', () => {
        lightValue.textContent = lightSlider.value;
        lightSlider.setAttribute('aria-valuenow', lightSlider.value);
      });
    }

    // AC toggle
    if (powerToggle) {
      powerToggle.addEventListener('click', () => {
        const isOn = powerToggle.classList.toggle('is-on');
        powerToggle.setAttribute('aria-pressed', String(isOn));
        if (systemStatus) {
          systemStatus.textContent = isOn ? 'Đang hoạt động' : 'Đã tắt';
          systemStatus.className = isOn ? 'status-good' : 'status-neutral';
        }
        if (typeof window.showToast === 'function') {
          window.showToast(
            `Hệ thống điều hòa: ${isOn ? 'Đã bật' : 'Đã tắt'}`,
            isOn ? 'success' : 'warning'
          );
        }
      });
    }

    // Save settings
    const saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const payload = {
          temperature: tempSlider ? Number(tempSlider.value) : 24,
          lighting: lightSlider ? Number(lightSlider.value) : 70,
          acOn: powerToggle ? powerToggle.classList.contains('is-on') : true
        };
        saveSettings(payload);
        if (typeof window.showToast === 'function') {
          window.showToast('Đã lưu cài đặt tiện nghi thành công!', 'success');
        }
      });
    }
  }

  /* ============================================================
     AI RECOMMENDATION: 6-step flow
  ============================================================ */
  const AI_RULES = {
    hot: {
      high:   { temp: 22, light: 65, fan: 'Tốc độ cao', confidence: 92,
                context: 'Phòng nóng + tập trung cao',
                explain: 'Khi phòng nóng và bạn cần tập trung sâu, AI đề xuất hạ nhiệt xuống 22°C để tối ưu hiệu suất nhận thức. Độ sáng 65% giảm mỏi mắt. Quạt tốc độ cao giúp lưu thông không khí nhanh.' },
      medium: { temp: 23, light: 70, fan: 'Tốc độ trung bình', confidence: 87,
                context: 'Phòng nóng + làm việc thông thường',
                explain: 'Nhiệt độ 23°C là điểm cân bằng thoải mái. Độ sáng 70% phù hợp công việc văn phòng. Quạt trung bình duy trì lưu thông không khí ổn định.' },
      low:    { temp: 24, light: 60, fan: 'Tốc độ thấp', confidence: 81,
                context: 'Phòng nóng + cần thư giãn',
                explain: 'Chế độ thư giãn không cần nhiệt độ quá thấp. 24°C tạo không gian dễ chịu. Độ sáng 60% và quạt nhẹ tạo cảm giác mát mẻ tự nhiên.' }
    },
    cold: {
      high:   { temp: 25, light: 80, fan: 'Tắt', confidence: 89,
                context: 'Phòng lạnh + tập trung cao',
                explain: 'Phòng lạnh kết hợp làm việc nhiều giờ dễ gây mất tập trung. Tăng nhiệt lên 25°C, tắt quạt tránh gió lạnh, tăng độ sáng 80% giúp duy trì sự tỉnh táo.' },
      medium: { temp: 26, light: 75, fan: 'Tắt', confidence: 84,
                context: 'Phòng lạnh + làm việc thông thường',
                explain: '26°C ấm hơn giúp bạn dễ chịu trong ngày làm việc. Độ sáng 75% tạo môi trường sáng sủa, ấm áp về mặt thị giác. Quạt tắt tránh luồng khí lạnh thêm.' },
      low:    { temp: 27, light: 55, fan: 'Tắt', confidence: 78,
                context: 'Phòng lạnh + thư giãn',
                explain: 'Khi thư giãn trong phòng lạnh, 27°C tạo cảm giác ấm áp. Ánh sáng dịu 55% phù hợp không gian nghỉ ngơi. Quạt tắt để tránh cảm giác ớn lạnh thêm.' }
    },
    normal: {
      high:   { temp: 23, light: 75, fan: 'Tốc độ thấp', confidence: 94,
                context: 'Phòng bình thường + tập trung cao',
                explain: 'Môi trường bình thường là lý tưởng. AI tinh chỉnh về 23°C và độ sáng 75% để tối ưu hiệu suất tập trung theo nghiên cứu về ergonomics văn phòng. Quạt thấp duy trì tươi mát nhẹ.' },
      medium: { temp: 24, light: 70, fan: 'Tốc độ thấp', confidence: 96,
                context: 'Phòng bình thường + làm việc thông thường',
                explain: '24°C và 70% ánh sáng là ngưỡng tiêu chuẩn được khuyến nghị bởi ASHRAE cho không gian văn phòng. Confidence cao nhất vì điều kiện lý tưởng.' },
      low:    { temp: 25, light: 50, fan: 'Tắt', confidence: 88,
                context: 'Phòng bình thường + thư giãn',
                explain: 'Chế độ thư giãn trong môi trường chuẩn: 25°C ấm dễ chịu, ánh sáng dịu 50% giảm căng thẳng mắt, quạt tắt tạo không gian yên tĩnh.' }
    }
  };

  function runAIRecommendation() {
    const envSelect = document.getElementById('aiEnvCondition');
    const focusSelect = document.getElementById('aiWorkFocus');
    const inputStep = document.getElementById('aiInputStep');
    const processingStep = document.getElementById('aiProcessingStep');
    const outputStep = document.getElementById('aiOutputStep');
    const promptChips = document.getElementById('aiPromptChips');

    const env = envSelect ? envSelect.value : '';
    const focus = focusSelect ? focusSelect.value : '';

    // AI Failure UX: missing input
    if (!env || !focus) {
      if (promptChips) promptChips.hidden = false;
      return;
    }

    if (promptChips) promptChips.hidden = true;

    // Step 1 → 2: Show Processing
    if (inputStep) inputStep.hidden = true;
    if (processingStep) processingStep.hidden = false;
    if (outputStep) outputStep.hidden = true;

    // Simulate AI processing (1.5s)
    setTimeout(() => {
      const rule = (AI_RULES[env] || {})[focus];
      if (!rule) {
        if (inputStep) inputStep.hidden = false;
        if (processingStep) processingStep.hidden = true;
        return;
      }
      currentAIResult = rule;

      // Populate Output
      const elTempRec = document.getElementById('aiTempRec');
      const elLightRec = document.getElementById('aiLightRec');
      const elFanRec = document.getElementById('aiFanRec');
      const elContext = document.getElementById('aiResultContext');
      const elExplain = document.getElementById('aiExplainText');
      const elConfBar = document.getElementById('aiConfidenceFill');
      const elConfPct = document.getElementById('aiConfidencePct');
      const elConfBarWrap = document.getElementById('aiConfidenceBar');

      if (elTempRec) elTempRec.textContent = rule.temp + '°C';
      if (elLightRec) elLightRec.textContent = rule.light + '%';
      if (elFanRec) elFanRec.textContent = rule.fan;
      if (elContext) elContext.textContent = rule.context;
      if (elExplain) elExplain.textContent = rule.explain;
      if (elConfBar) elConfBar.style.width = rule.confidence + '%';
      if (elConfPct) elConfPct.textContent = rule.confidence + '%';
      if (elConfBarWrap) {
        elConfBarWrap.setAttribute('aria-valuenow', rule.confidence);
        // Color: green >80, amber 60-80, red <60
        elConfBar.className = 'ocf-confidence-fill';
        if (rule.confidence >= 80) elConfBar.classList.add('conf-high');
        else if (rule.confidence >= 60) elConfBar.classList.add('conf-mid');
        else elConfBar.classList.add('conf-low');
      }

      // Step 2 → 3: Show Output
      if (processingStep) processingStep.hidden = true;
      if (outputStep) outputStep.hidden = false;
    }, AI_DELAY_MS);
  }

  function applyAIResult() {
    if (!currentAIResult) return;
    const tempSlider = document.getElementById('comfortTemperature');
    const lightSlider = document.getElementById('comfortLighting');
    const tempValue = document.getElementById('comfortTemperatureValue');
    const lightValue = document.getElementById('comfortLightingValue');

    if (tempSlider && tempValue) {
      tempSlider.value = currentAIResult.temp;
      tempValue.textContent = currentAIResult.temp;
      tempSlider.setAttribute('aria-valuenow', currentAIResult.temp);
    }
    if (lightSlider && lightValue) {
      lightSlider.value = currentAIResult.light;
      lightValue.textContent = currentAIResult.light;
      lightSlider.setAttribute('aria-valuenow', currentAIResult.light);
    }

    // Save to localStorage (Step 6: Save/Apply)
    const payload = {
      temperature: currentAIResult.temp,
      lighting: currentAIResult.light,
      acOn: true
    };
    saveSettings(payload);

    if (typeof window.showToast === 'function') {
      window.showToast(
        `AI đã áp dụng: ${currentAIResult.temp}°C · ${currentAIResult.light}% ánh sáng · ${currentAIResult.fan}`,
        'success'
      );
    }
  }

  function resetAIToInput() {
    currentAIResult = null;
    const inputStep = document.getElementById('aiInputStep');
    const processingStep = document.getElementById('aiProcessingStep');
    const outputStep = document.getElementById('aiOutputStep');
    const envSelect = document.getElementById('aiEnvCondition');
    const focusSelect = document.getElementById('aiWorkFocus');
    const promptChips = document.getElementById('aiPromptChips');

    if (inputStep) inputStep.hidden = false;
    if (processingStep) processingStep.hidden = true;
    if (outputStep) outputStep.hidden = true;
    if (promptChips) promptChips.hidden = true;
    if (envSelect) envSelect.value = '';
    if (focusSelect) focusSelect.value = '';
  }

  function initAI() {
    const runBtn = document.getElementById('aiRunBtn');
    const applyBtn = document.getElementById('aiApplyBtn');
    const editBtn = document.getElementById('aiEditBtn');
    const rejectBtn = document.getElementById('aiRejectBtn');
    const regenBtn = document.getElementById('aiRegenerateBtn');
    const chipBtns = document.querySelectorAll('.ocf-chip');

    if (runBtn) runBtn.addEventListener('click', runAIRecommendation);

    if (applyBtn) applyBtn.addEventListener('click', applyAIResult);

    if (editBtn) {
      editBtn.addEventListener('click', () => {
        // Return to input but keep previous values
        const inputStep = document.getElementById('aiInputStep');
        const outputStep = document.getElementById('aiOutputStep');
        if (inputStep) inputStep.hidden = false;
        if (outputStep) outputStep.hidden = true;
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        resetAIToInput();
        if (typeof window.showToast === 'function') {
          window.showToast('Đã từ chối gợi ý AI. Bạn có thể thử lại bất cứ lúc nào.', 'info');
        }
      });
    }

    if (regenBtn) {
      regenBtn.addEventListener('click', () => {
        // Re-run without resetting inputs
        const processingStep = document.getElementById('aiProcessingStep');
        const outputStep = document.getElementById('aiOutputStep');
        const inputStep = document.getElementById('aiInputStep');
        if (processingStep) processingStep.hidden = false;
        if (outputStep) outputStep.hidden = true;
        if (inputStep) inputStep.hidden = true;
        setTimeout(() => {
          runAIRecommendation();
          // runAI will pick up existing select values
        }, 0);
        // Actually just call logic again - inputs retained
        // Reset processing display then re-trigger
        if (processingStep) processingStep.hidden = false;
        if (outputStep) outputStep.hidden = true;
        if (inputStep) inputStep.hidden = true;

        const envSelect = document.getElementById('aiEnvCondition');
        const focusSelect = document.getElementById('aiWorkFocus');
        const env = envSelect ? envSelect.value : '';
        const focus = focusSelect ? focusSelect.value : '';
        if (!env || !focus) {
          resetAIToInput();
          const promptChips = document.getElementById('aiPromptChips');
          if (promptChips) promptChips.hidden = false;
          return;
        }
        setTimeout(() => {
          const rule = (AI_RULES[env] || {})[focus];
          if (rule) {
            // Add small random variation to confidence to simulate "regenerate"
            const variation = Math.floor(Math.random() * 7) - 3;
            const modifiedRule = Object.assign({}, rule, {
              confidence: Math.min(99, Math.max(60, rule.confidence + variation))
            });
            currentAIResult = modifiedRule;
            populateAIOutput(modifiedRule);
            if (processingStep) processingStep.hidden = true;
            if (outputStep) outputStep.hidden = false;
          }
        }, AI_DELAY_MS);
      });
    }

    // Scenario Preset Buttons (Ví dụ mẫu trực quan)
    const scenarioBtns = document.querySelectorAll('.ocf-preset-scenario');
    scenarioBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const envVal = btn.dataset.env;
        const focusVal = btn.dataset.focus;
        const envSelect = document.getElementById('aiEnvCondition');
        const focusSelect = document.getElementById('aiWorkFocus');
        if (envSelect) envSelect.value = envVal;
        if (focusSelect) focusSelect.value = focusVal;
        // Tự động kích hoạt phân tích AI luôn để người dùng thấy ngay kết quả
        runAIRecommendation();
      });
    });

    // Prompt Chips
    chipBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const value = btn.dataset.chip;
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.value = value;
      });
    });
  }

  function populateAIOutput(rule) {
    const elTempRec = document.getElementById('aiTempRec');
    const elLightRec = document.getElementById('aiLightRec');
    const elFanRec = document.getElementById('aiFanRec');
    const elContext = document.getElementById('aiResultContext');
    const elExplain = document.getElementById('aiExplainText');
    const elConfBar = document.getElementById('aiConfidenceFill');
    const elConfPct = document.getElementById('aiConfidencePct');
    const elConfBarWrap = document.getElementById('aiConfidenceBar');

    if (elTempRec) elTempRec.textContent = rule.temp + '°C';
    if (elLightRec) elLightRec.textContent = rule.light + '%';
    if (elFanRec) elFanRec.textContent = rule.fan;
    if (elContext) elContext.textContent = rule.context;
    if (elExplain) elExplain.textContent = rule.explain;
    if (elConfBar) {
      elConfBar.style.width = rule.confidence + '%';
      elConfBar.className = 'ocf-confidence-fill';
      if (rule.confidence >= 80) elConfBar.classList.add('conf-high');
      else if (rule.confidence >= 60) elConfBar.classList.add('conf-mid');
      else elConfBar.classList.add('conf-low');
    }
    if (elConfPct) elConfPct.textContent = rule.confidence + '%';
    if (elConfBarWrap) elConfBarWrap.setAttribute('aria-valuenow', rule.confidence);
  }

  /* ============================================================
     FORM: Feedback submission with validation
  ============================================================ */
  function initForm() {
    const form = document.getElementById('comfortFeedbackForm');
    const textarea = document.getElementById('fbContent');
    const charCounter = document.getElementById('fbCharCounter');
    const submitBtn = document.getElementById('fbSubmitBtn');

    // Character counter
    if (textarea && charCounter) {
      textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        charCounter.textContent = `(${len}/200 ký tự)`;
        charCounter.classList.remove('counter-warn', 'counter-error');
        if (len > 200) {
          charCounter.classList.add('counter-error');
        } else if (len > 180) {
          charCounter.classList.add('counter-warn');
        }
      });
    }

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      const valid = validateForm();
      if (!valid) return;

      // Disable button (anti double-click)
      isSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Đang gửi…';
      }

      // Simulate async send (400ms)
      setTimeout(() => {
        submitFeedback();
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '📤 Gửi phản hồi';
        }
      }, 400);
    });
  }

  function getFieldValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function showFieldError(errorId, message) {
    const el = document.getElementById(errorId);
    if (el) {
      el.textContent = message;
      el.hidden = false;
    }
  }

  function clearFieldError(errorId) {
    const el = document.getElementById(errorId);
    if (el) {
      el.textContent = '';
      el.hidden = true;
    }
  }

  function validateForm() {
    let valid = true;

    // Room
    clearFieldError('fbRoomError');
    const room = getFieldValue('fbRoom');
    if (!room) {
      showFieldError('fbRoomError', 'Vui lòng nhập phòng / khu vực của bạn.');
      valid = false;
    }

    // Name
    clearFieldError('fbNameError');
    const name = getFieldValue('fbName');
    if (!name) {
      showFieldError('fbNameError', 'Vui lòng nhập họ và tên.');
      valid = false;
    }

    // Type
    clearFieldError('fbTypeError');
    const type = getFieldValue('fbType');
    if (!type) {
      showFieldError('fbTypeError', 'Vui lòng chọn chủ đề phản hồi.');
      valid = false;
    }

    // Rating
    clearFieldError('fbRatingError');
    const ratingEl = document.querySelector('input[name="fbRating"]:checked');
    if (!ratingEl) {
      showFieldError('fbRatingError', 'Vui lòng chọn mức độ thoải mái.');
      valid = false;
    }

    // Content
    clearFieldError('fbContentError');
    const content = getFieldValue('fbContent');
    if (!content) {
      showFieldError('fbContentError', 'Vui lòng nhập nội dung phản hồi.');
      valid = false;
    } else if (content.length < 10) {
      showFieldError('fbContentError', 'Nội dung phải có ít nhất 10 ký tự.');
      valid = false;
    } else if (content.length > 200) {
      showFieldError('fbContentError', 'Nội dung không được vượt quá 200 ký tự.');
      valid = false;
    }

    return valid;
  }

  function submitFeedback() {
    const room = getFieldValue('fbRoom');
    const name = getFieldValue('fbName');
    const type = getFieldValue('fbType');
    const content = getFieldValue('fbContent');
    const ratingEl = document.querySelector('input[name="fbRating"]:checked');
    const rating = ratingEl ? Number(ratingEl.value) : 3;

    const today = new Date().toISOString().split('T')[0];
    const newEntry = {
      id: generateId(),
      room,
      name,
      type,
      rating,
      content,
      status: 'Chờ xử lý',
      date: today,
      resolvedNote: ''
    };

    feedbackList.unshift(newEntry);
    saveFeedbackToStorage(feedbackList);
    updateKPIs();
    applyFilters();

    const fbMessage = document.getElementById('fbMessage');
    if (fbMessage) {
      fbMessage.textContent = '✅ Đã ghi nhận phản hồi. Đội vận hành sẽ xem xét trong thời gian sớm nhất.';
    }

    if (typeof window.showToast === 'function') {
      window.showToast('Đã gửi phản hồi tiện nghi thành công! Cảm ơn bạn.', 'success');
    }

    // Reset form
    const form = document.getElementById('comfortFeedbackForm');
    if (form) form.reset();
    const charCounter = document.getElementById('fbCharCounter');
    if (charCounter) charCounter.textContent = '(0/200 ký tự)';

    // Clear field errors
    ['fbRoomError', 'fbNameError', 'fbTypeError', 'fbRatingError', 'fbContentError'].forEach(clearFieldError);

    setTimeout(() => {
      if (fbMessage) fbMessage.textContent = '';
    }, 5000);
  }

  /* ============================================================
     FILTER & SEARCH
  ============================================================ */
  function applyFilters() {
    const typeFilter = document.getElementById('filterType');
    const statusFilter = document.getElementById('filterStatus');
    const searchFilter = document.getElementById('filterSearch');

    const typeVal = typeFilter ? typeFilter.value : '';
    const statusVal = statusFilter ? statusFilter.value : '';
    const searchVal = searchFilter ? searchFilter.value.trim().toLowerCase() : '';

    filteredList = feedbackList.filter(item => {
      if (typeVal && item.type !== typeVal) return false;
      if (statusVal && item.status !== statusVal) return false;
      if (searchVal) {
        const haystack = [item.room, item.name, item.content, item.type].join(' ').toLowerCase();
        if (!haystack.includes(searchVal)) return false;
      }
      return true;
    });

    currentPage = 1;
    renderFeedbackList();
  }

  function initFilters() {
    const typeFilter = document.getElementById('filterType');
    const statusFilter = document.getElementById('filterStatus');
    const searchFilter = document.getElementById('filterSearch');
    const clearBtn = document.getElementById('clearFilterBtn');

    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (searchFilter) searchFilter.addEventListener('input', applyFilters);

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (typeFilter) typeFilter.value = '';
        if (statusFilter) statusFilter.value = '';
        if (searchFilter) searchFilter.value = '';
        applyFilters();
      });
    }
  }

  /* ============================================================
     RENDER FEEDBACK LIST + PAGINATION
  ============================================================ */
  function renderFeedbackList() {
    const container = document.getElementById('feedbackListContainer');
    const pagination = document.getElementById('paginationContainer');
    const counter = document.getElementById('resultCounter');

    if (!container) return;

    const total = filteredList.length;
    const totalPages = Math.ceil(total / PAGE_SIZE);

    if (counter) {
      counter.textContent = `Hiển thị ${total} / ${feedbackList.length} kết quả`;
    }

    // EMPTY STATE
    if (total === 0) {
      container.replaceChildren();
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'ocf-empty-state';
      emptyDiv.setAttribute('role', 'status');

      const icon = document.createElement('div');
      icon.className = 'ocf-empty-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '📭';

      const title = document.createElement('h3');
      title.className = 'ocf-empty-title';
      title.textContent = 'Không có phản hồi nào';

      const desc = document.createElement('p');
      desc.className = 'ocf-empty-desc';
      desc.textContent = 'Chưa có phản hồi phù hợp với bộ lọc hiện tại. Hãy thử thay đổi điều kiện lọc hoặc gửi phản hồi mới.';

      const ctaBtn = document.createElement('button');
      ctaBtn.className = 'btn btn-primary btn-sm';
      ctaBtn.type = 'button';
      ctaBtn.textContent = '📤 Gửi phản hồi mới';
      ctaBtn.addEventListener('click', () => {
        const formSection = document.getElementById('comfortFeedbackForm');
        if (formSection) formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      emptyDiv.append(icon, title, desc, ctaBtn);
      container.appendChild(emptyDiv);
      if (pagination) pagination.replaceChildren();
      return;
    }

    // Paginate
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filteredList.slice(startIndex, startIndex + PAGE_SIZE);

    // Render cards
    container.replaceChildren();
    const list = document.createElement('ul');
    list.className = 'ocf-feedback-list';
    list.setAttribute('aria-label', 'Danh sách phản hồi');

    pageItems.forEach(item => {
      const li = document.createElement('li');
      li.className = 'ocf-feedback-item';

      const article = document.createElement('article');
      article.className = 'ocf-feedback-card';

      // Header row
      const header = document.createElement('div');
      header.className = 'ocf-fb-header';

      const meta = document.createElement('div');
      meta.className = 'ocf-fb-meta';

      const roomSpan = document.createElement('span');
      roomSpan.className = 'ocf-fb-room';
      roomSpan.textContent = item.room;

      const idSpan = document.createElement('span');
      idSpan.className = 'ocf-fb-id';
      idSpan.textContent = '#' + item.id;

      meta.append(roomSpan, idSpan);

      const statusSpan = document.createElement('span');
      statusSpan.className = 'report-status ' + getStatusClass(item.status);
      statusSpan.textContent = item.status;

      header.append(meta, statusSpan);

      // Body
      const body = document.createElement('div');
      body.className = 'ocf-fb-body';

      const nameRow = document.createElement('div');
      nameRow.className = 'ocf-fb-name-row';

      const nameEl = document.createElement('strong');
      nameEl.className = 'ocf-fb-name';
      nameEl.textContent = item.name;

      const typeTag = document.createElement('span');
      typeTag.className = 'ocf-fb-type-tag';
      typeTag.textContent = item.type;

      nameRow.append(nameEl, typeTag);

      const ratingEl = document.createElement('div');
      ratingEl.className = 'ocf-fb-rating';
      ratingEl.setAttribute('aria-label', `Đánh giá ${item.rating}/5 sao`);
      ratingEl.textContent = ratingStars(item.rating);

      const contentEl = document.createElement('p');
      contentEl.className = 'ocf-fb-content';
      contentEl.textContent = item.content; // safe: textContent

      body.append(nameRow, ratingEl, contentEl);

      // Footer
      const footer = document.createElement('div');
      footer.className = 'ocf-fb-footer';

      const dateEl = document.createElement('time');
      dateEl.className = 'ocf-fb-date';
      dateEl.setAttribute('datetime', item.date);
      dateEl.textContent = formatDate(item.date);

      const detailBtn = document.createElement('button');
      detailBtn.className = 'ocf-btn-ghost btn-sm';
      detailBtn.type = 'button';
      detailBtn.textContent = 'Xem chi tiết';
      detailBtn.setAttribute('aria-label', `Xem chi tiết phản hồi ${item.id} của ${item.name}`);
      detailBtn.dataset.feedbackId = item.id;
      detailBtn.addEventListener('click', () => openModal(item));

      footer.append(dateEl, detailBtn);
      article.append(header, body, footer);
      li.appendChild(article);
      list.appendChild(li);
    });

    container.appendChild(list);

    // Pagination
    renderPagination(totalPages, pagination);
  }

  function getStatusClass(status) {
    switch (status) {
      case 'Đã giải quyết': return 'status-good';
      case 'Đang xử lý':    return 'status-warning';
      case 'Chờ xử lý':    return 'ocf-status-pending';
      default:              return '';
    }
  }

  function renderPagination(totalPages, container) {
    if (!container) return;
    container.replaceChildren();
    if (totalPages <= 1) return;

    const nav = document.createElement('div');
    nav.className = 'ocf-pagination-inner';

    // Previous
    const prevBtn = document.createElement('button');
    prevBtn.className = 'ocf-page-btn';
    prevBtn.type = 'button';
    prevBtn.textContent = '‹';
    prevBtn.setAttribute('aria-label', 'Trang trước');
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderFeedbackList();
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
    nav.appendChild(prevBtn);

    // Page numbers
    for (let p = 1; p <= totalPages; p++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = 'ocf-page-btn' + (p === currentPage ? ' ocf-page-active' : '');
      pageBtn.type = 'button';
      pageBtn.textContent = String(p);
      pageBtn.setAttribute('aria-label', `Trang ${p}`);
      if (p === currentPage) pageBtn.setAttribute('aria-current', 'page');
      const pageNum = p;
      pageBtn.addEventListener('click', () => {
        currentPage = pageNum;
        renderFeedbackList();
      });
      nav.appendChild(pageBtn);
    }

    // Next
    const nextBtn = document.createElement('button');
    nextBtn.className = 'ocf-page-btn';
    nextBtn.type = 'button';
    nextBtn.textContent = '›';
    nextBtn.setAttribute('aria-label', 'Trang sau');
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderFeedbackList();
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
    nav.appendChild(nextBtn);

    container.appendChild(nav);
  }

  /* ============================================================
     MODAL: Feedback Detail
  ============================================================ */
  function openModal(item) {
    const modal = document.getElementById('feedbackDetailModal');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.getElementById('closeModalBtn');
    const modalTitle = document.getElementById('modalTitle');

    if (!modal || !modalBody) return;

    if (modalTitle) modalTitle.textContent = `Chi tiết phản hồi #${escapeHTML(item.id)}`;

    // Build modal content using DOM (no innerHTML with user data)
    modalBody.replaceChildren();

    const rows = [
      ['Mã phản hồi', item.id],
      ['Phòng', item.room],
      ['Người gửi', item.name],
      ['Chủ đề', item.type],
      ['Đánh giá', ratingStars(item.rating) + ` (${item.rating}/5)`],
      ['Nội dung', item.content],
      ['Trạng thái', item.status],
      ['Ngày gửi', formatDate(item.date)],
    ];
    if (item.resolvedNote) {
      rows.push(['Ghi chú xử lý', item.resolvedNote]);
    }

    const dl = document.createElement('dl');
    dl.className = 'ocf-modal-dl';

    rows.forEach(([label, value]) => {
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      dl.append(dt, dd);
    });

    modalBody.appendChild(dl);

    modal.hidden = false;
    modal.removeAttribute('hidden');
    modal.focus();

    // Close handlers
    if (closeBtn) {
      closeBtn.onclick = closeModal;
    }

    modal.addEventListener('keydown', handleModalKeydown);
    modal.addEventListener('click', handleModalOutsideClick);
  }

  function handleModalKeydown(e) {
    if (e.key === 'Escape') closeModal();
  }

  function handleModalOutsideClick(e) {
    const modal = document.getElementById('feedbackDetailModal');
    const modalInner = modal && modal.querySelector('.ocf-modal');
    if (modalInner && !modalInner.contains(e.target)) closeModal();
  }

  function closeModal() {
    const modal = document.getElementById('feedbackDetailModal');
    if (modal) {
      modal.hidden = true;
      modal.removeEventListener('keydown', handleModalKeydown);
      modal.removeEventListener('click', handleModalOutsideClick);
    }
  }

  /* ============================================================
     PAGE STATES: Loading / Normal / Error
  ============================================================ */
  function showLoadingState() {
    const loadingEl = document.getElementById('pageLoadingState');
    const mainEl = document.getElementById('pageMainContent');
    const errorEl = document.getElementById('pageErrorState');
    if (loadingEl) loadingEl.hidden = false;
    if (mainEl) mainEl.hidden = true;
    if (errorEl) errorEl.hidden = true;
  }

  function showNormalState() {
    const loadingEl = document.getElementById('pageLoadingState');
    const mainEl = document.getElementById('pageMainContent');
    const errorEl = document.getElementById('pageErrorState');
    if (loadingEl) loadingEl.hidden = true;
    if (mainEl) mainEl.hidden = false;
    if (errorEl) errorEl.hidden = true;
  }

  function showErrorState() {
    const loadingEl = document.getElementById('pageLoadingState');
    const mainEl = document.getElementById('pageMainContent');
    const errorEl = document.getElementById('pageErrorState');
    if (loadingEl) loadingEl.hidden = true;
    if (mainEl) mainEl.hidden = true;
    if (errorEl) errorEl.hidden = false;
  }

  function initRetryButton() {
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        showLoadingState();
        setTimeout(() => {
          try {
            feedbackList = loadFeedbackFromStorage();
            filteredList = [...feedbackList];
            updateKPIs();
            renderFeedbackList();
            showNormalState();
          } catch {
            showErrorState();
          }
        }, LOADING_DELAY_MS);
      });
    }
  }

  /* ============================================================
     LOGOUT BUTTON (data-action="logout")
  ============================================================ */
  function initLogoutButton() {
    const logoutBtn = document.querySelector('[data-action="logout"]');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (typeof window.handleLogout === 'function') {
          window.handleLogout();
        }
      });
    }
  }

  /* ============================================================
     KEYBOARD: Global Escape closes modal
  ============================================================ */
  function initGlobalKeys() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('feedbackDetailModal');
        if (modal && !modal.hidden) {
          closeModal();
        }
      }
    });
  }

  /* ============================================================
     BOOT
  ============================================================ */
  function boot() {
    // TC2: Loading State (800ms)
    showLoadingState();

    setTimeout(() => {
      try {
        // Load data
        feedbackList = loadFeedbackFromStorage();
        filteredList = [...feedbackList];

        // Initialize all modules
        initSettings();
        initAI();
        initForm();
        initFilters();
        initRetryButton();
        initLogoutButton();
        initGlobalKeys();

        // Render
        updateKPIs();
        renderFeedbackList();

        // TC2: Normal State
        showNormalState();
      } catch (err) {
        console.error('[OCF] Boot error:', err);
        // TC2: Error State
        showErrorState();
      }
    }, LOADING_DELAY_MS);
  }

  document.addEventListener('DOMContentLoaded', boot);

})(); // End IIFE
