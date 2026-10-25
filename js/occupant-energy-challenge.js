/**
 * CSE122 – SMARTBUILDING TEAM 01 (BTL-36)
 * occupant-energy-challenge.js
 * Occupant Energy Challenge — CRUD, LocalStorage, AI-2 (6 bước), A11y
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     CONSTANTS & DATA
  ═══════════════════════════════════════════════════════════ */
  const LS_PROGRESS  = 'smartbuild_challenge_progress';
  const LS_POINTS    = 'smartbuild_green_points';
  const LS_LOG       = 'smartbuild_activity_log';
  const LOADING_DELAY = 800;   // ms — skeleton duration
  const AI_DELAY      = 1500;  // ms — AI spinner duration
  const JOIN_DELAY    = 3000;  // ms — inprogress → done transition
  const GOAL_KWH      = 100;   // monthly kWh goal

  const CHALLENGES_DATA = [
    {
      id: 'CH001',
      icon: '☀️',
      iconClass: '',
      title: 'Tắt đèn khi rời phòng',
      description: 'Tắt thiết bị chiếu sáng khi không sử dụng trong ít nhất 30 phút liên tục.',
      points: 30,
      kwhSave: 0.5,
      duration: 'Hàng ngày',
      difficulty: 'Dễ',
      category: 'Chiếu sáng'
    },
    {
      id: 'CH002',
      icon: '❄️',
      iconClass: 'icon-blue',
      title: 'Điều hòa tiết kiệm',
      description: 'Đặt nhiệt độ điều hòa từ 25°C trở lên trong ngày làm việc (không dưới 24°C).',
      points: 50,
      kwhSave: 2.1,
      duration: '5 ngày',
      difficulty: 'Trung bình',
      category: 'HVAC'
    },
    {
      id: 'CH003',
      icon: '⚡',
      iconClass: 'icon-amber',
      title: 'Tuần làm việc xanh',
      description: 'Duy trì tiêu thụ điện cá nhân dưới 8 kWh/ngày trong cả tuần làm việc.',
      points: 100,
      kwhSave: 14.0,
      duration: '7 ngày',
      difficulty: 'Khó',
      category: 'Tổng hợp'
    },
    {
      id: 'CH004',
      icon: '💻',
      iconClass: 'icon-blue',
      title: 'Máy tính chế độ nghỉ',
      description: 'Bật chế độ Sleep cho màn hình sau 5 phút không dùng và Hibernate sau 15 phút.',
      points: 20,
      kwhSave: 0.8,
      duration: 'Hàng ngày',
      difficulty: 'Dễ',
      category: 'Thiết bị'
    },
    {
      id: 'CH005',
      icon: '🌿',
      iconClass: '',
      title: 'Giờ xanh buổi trưa',
      description: 'Tắt màn hình và điều hòa trong giờ nghỉ trưa (12h00 – 13h30).',
      points: 40,
      kwhSave: 1.2,
      duration: '5 ngày',
      difficulty: 'Dễ',
      category: 'Tiết kiệm'
    },
    {
      id: 'CH006',
      icon: '📊',
      iconClass: 'icon-amber',
      title: 'Theo dõi điện năng 30 ngày',
      description: 'Ghi nhận và báo cáo mức tiêu thụ điện cá nhân mỗi ngày trong 30 ngày liên tiếp.',
      points: 200,
      kwhSave: 25.0,
      duration: '30 ngày',
      difficulty: 'Rất khó',
      category: 'Giám sát'
    }
  ];

  /* ═══════════════════════════════════════════════════════════
     UTILITY
  ═══════════════════════════════════════════════════════════ */
  function escapeHTML(str) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(str).replace(/[&<>"']/g, (ch) => map[ch]);
  }

  function now() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  /* ═══════════════════════════════════════════════════════════
     LOCALSTORAGE HELPERS
  ═══════════════════════════════════════════════════════════ */
  function loadProgress() {
    try {
      const raw = localStorage.getItem(LS_PROGRESS);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function saveProgress(progress) {
    try {
      localStorage.setItem(LS_PROGRESS, JSON.stringify(progress));
    } catch (_) {}
  }

  function loadPoints() {
    try {
      return parseInt(localStorage.getItem(LS_POINTS) || '0', 10) || 0;
    } catch (_) {
      return 0;
    }
  }

  function savePoints(pts) {
    try {
      localStorage.setItem(LS_POINTS, String(pts));
    } catch (_) {}
  }

  function loadLog() {
    try {
      const raw = localStorage.getItem(LS_LOG);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function saveLog(log) {
    try {
      // Keep last 50 entries
      const trimmed = log.slice(-50);
      localStorage.setItem(LS_LOG, JSON.stringify(trimmed));
    } catch (_) {}
  }

  function addLogEntry(message, type) {
    const log = loadLog();
    log.push({ time: now(), message, type: type || 'join' });
    saveLog(log);
  }

  /* ═══════════════════════════════════════════════════════════
     KPI & GOAL
  ═══════════════════════════════════════════════════════════ */
  function computeKPIs(progress) {
    let points = loadPoints();
    let kwh    = 0;
    let done   = 0;

    CHALLENGES_DATA.forEach((ch) => {
      const status = progress[ch.id];
      if (status === 'done') {
        kwh  += ch.kwhSave;
        done += 1;
      }
    });

    return { points, kwh: Math.round(kwh * 10) / 10, done };
  }

  function updateKPIBar(progress) {
    const { points, kwh, done } = computeKPIs(progress);
    const total = CHALLENGES_DATA.length;

    const el = (id) => document.getElementById(id);

    el('kpiPoints').innerHTML = `${points} <small>điểm</small>`;
    el('kpiPointsNote').textContent = points > 0
      ? `▲ ${points} điểm tích lũy`
      : 'Bắt đầu tham gia thử thách!';

    el('kpiKwh').innerHTML = `${kwh} <small>kWh</small>`;
    el('kpiKwhNote').textContent = `≈ ${Math.round(kwh * 0.67)} kg CO₂ giảm phát thải`;

    el('kpiDone').innerHTML = `${done} <small>/ ${total}</small>`;
    el('kpiDoneNote').textContent = done === total
      ? '🎉 Bạn đã hoàn thành tất cả!'
      : done > 0
        ? `Tiếp tục, bạn sắp đạt đỉnh!`
        : 'Tiếp tục để lên hạng!';

    // Goal progress
    const pct    = clamp(Math.round((kwh / GOAL_KWH) * 100), 0, 100);
    const remain = Math.max(0, GOAL_KWH - kwh);
    const bar    = el('goalProgressBar');
    const fill   = el('goalProgressFill');

    if (bar) {
      bar.setAttribute('aria-valuenow', pct);
      fill.style.width = pct + '%';
    }
    const leftEl = el('goalProgressLeft');
    const pctEl  = el('goalProgressPct');
    if (leftEl) leftEl.textContent = remain > 0 ? `Còn ${remain} kWh để đạt mục tiêu` : '✅ Đã đạt mục tiêu tháng!';
    if (pctEl)  pctEl.textContent  = `${kwh} / ${GOAL_KWH} kWh`;
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER CHALLENGES
  ═══════════════════════════════════════════════════════════ */
  let currentFilter = 'all';

  function difficultyBadgeClass(difficulty) {
    const map = {
      'Dễ': 'oec-badge-green',
      'Trung bình': 'oec-badge-blue',
      'Khó': 'oec-badge-amber',
      'Rất khó': 'oec-badge-red'
    };
    return map[difficulty] || 'oec-badge-muted';
  }

  function renderChallenges(filter) {
    const progress  = loadProgress();
    const grid      = document.getElementById('challengeGrid');
    const empty     = document.getElementById('challengeEmpty');
    const error     = document.getElementById('challengeError');
    const counter   = document.getElementById('challengeCounter');

    if (!grid) return;

    grid.style.display    = 'grid';
    empty.style.display   = 'none';
    error.style.display   = 'none';

    const filtered = CHALLENGES_DATA.filter((ch) => {
      const status = progress[ch.id] || 'none';
      if (filter === 'all') return true;
      return status === filter;
    });

    const total   = CHALLENGES_DATA.length;
    const showing = filtered.length;

    if (counter) {
      counter.innerHTML = `<strong>${showing}</strong> / ${total} thử thách`;
    }

    if (showing === 0) {
      grid.style.display  = 'none';
      empty.style.display = 'flex';
      return;
    }

    // Clear grid
    grid.replaceChildren();

    filtered.forEach((ch) => {
      const status = progress[ch.id] || 'none';
      const article = document.createElement('article');
      article.className = 'oec-challenge-card card';
      if (status === 'done')       article.classList.add('status-done');
      if (status === 'inprogress') article.classList.add('status-inprogress');
      article.setAttribute('aria-label', `Thử thách: ${ch.title}`);

      // Top row: icon + title
      const top = document.createElement('div');
      top.className = 'oec-ch-top';

      const iconEl = document.createElement('span');
      iconEl.className = `oec-ch-icon ${ch.iconClass}`.trim();
      iconEl.setAttribute('aria-hidden', 'true');
      iconEl.textContent = ch.icon;

      const titleBlock = document.createElement('div');
      const titleEl = document.createElement('h3');
      titleEl.className = 'oec-ch-title';
      titleEl.textContent = ch.title;
      const descEl = document.createElement('p');
      descEl.className = 'oec-ch-desc';
      descEl.textContent = ch.description;
      titleBlock.append(titleEl, descEl);

      top.append(iconEl, titleBlock);

      // Meta badges
      const meta = document.createElement('div');
      meta.className = 'oec-ch-meta';

      const makeBadge = (text, cls) => {
        const b = document.createElement('span');
        b.className = `oec-badge ${cls}`;
        b.textContent = text;
        return b;
      };

      meta.append(
        makeBadge(ch.category, 'oec-badge-muted'),
        makeBadge(ch.duration, 'oec-badge-blue'),
        makeBadge(ch.difficulty, difficultyBadgeClass(ch.difficulty))
      );

      // Footer: points + button
      const footer = document.createElement('div');
      footer.className = 'oec-ch-footer';

      const pointsEl = document.createElement('span');
      pointsEl.className = 'oec-ch-points';
      pointsEl.innerHTML = `+${ch.points} <small>điểm · tiết kiệm ${ch.kwhSave} kWh</small>`;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'oec-join-btn';
      btn.setAttribute('data-id', ch.id);

      if (status === 'none') {
        btn.textContent = 'Tham gia';
        btn.classList.add('btn-join');
        btn.setAttribute('aria-label', `Tham gia thử thách: ${ch.title}`);
      } else if (status === 'inprogress') {
        btn.textContent = 'Đang thực hiện ⏳';
        btn.classList.add('btn-inprogress');
        btn.disabled = true;
        btn.setAttribute('aria-label', `Đang thực hiện: ${ch.title}`);
      } else {
        btn.textContent = 'Hoàn thành ✓';
        btn.classList.add('btn-done');
        btn.disabled = true;
        btn.setAttribute('aria-label', `Đã hoàn thành: ${ch.title}`);
      }

      footer.append(pointsEl, btn);
      article.append(top, meta, footer);
      grid.append(article);
    });

    // Bind join buttons
    grid.querySelectorAll('.oec-join-btn.btn-join').forEach((btn) => {
      btn.addEventListener('click', () => handleJoin(btn.getAttribute('data-id')));
    });
  }

  /* ═══════════════════════════════════════════════════════════
     HANDLE JOIN
  ═══════════════════════════════════════════════════════════ */
  function handleJoin(challengeId) {
    const ch = CHALLENGES_DATA.find((c) => c.id === challengeId);
    if (!ch) return;

    const progress = loadProgress();
    progress[challengeId] = 'inprogress';
    saveProgress(progress);

    addLogEntry(`Đã tham gia: ${ch.title}`, 'join');
    renderChallenges(currentFilter);
    updateKPIBar(progress);
    renderTimeline();

    if (typeof window.showToast === 'function') {
      window.showToast(`✅ Đã tham gia thử thách: "${ch.title}"`, 'success');
    }

    // Auto-complete after JOIN_DELAY
    setTimeout(() => {
      const latestProgress = loadProgress();
      if (latestProgress[challengeId] === 'inprogress') {
        latestProgress[challengeId] = 'done';
        saveProgress(latestProgress);

        // Add points
        const currentPts = loadPoints();
        savePoints(currentPts + ch.points);

        addLogEntry(`Hoàn thành: ${ch.title} (+${ch.points} điểm)`, 'done');
        renderChallenges(currentFilter);
        updateKPIBar(latestProgress);
        renderTimeline();

        if (typeof window.showToast === 'function') {
          window.showToast(`🏆 Hoàn thành "${ch.title}"! +${ch.points} điểm xanh`, 'success');
        }
      }
    }, JOIN_DELAY);
  }

  /* ═══════════════════════════════════════════════════════════
     ACTIVITY TIMELINE
  ═══════════════════════════════════════════════════════════ */
  function renderTimeline() {
    const container = document.getElementById('activityTimeline');
    if (!container) return;

    const log = loadLog();
    container.replaceChildren();

    if (log.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'oec-tl-empty';
      empty.textContent = 'Chưa có hoạt động nào. Hãy tham gia thử thách đầu tiên!';
      container.appendChild(empty);
      return;
    }

    // Show newest first
    const reversed = log.slice().reverse();
    reversed.forEach((entry) => {
      const item = document.createElement('div');
      item.className = 'oec-timeline-item';

      const dot = document.createElement('span');
      dot.className = 'oec-tl-dot' + (entry.type === 'done' ? '' : ' dot-amber');
      dot.setAttribute('aria-hidden', 'true');

      const time = document.createElement('span');
      time.className = 'oec-tl-time';
      time.textContent = entry.time;

      const text = document.createElement('span');
      text.className = 'oec-tl-text';
      text.textContent = entry.message;

      item.append(dot, time, text);
      container.appendChild(item);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     FILTER TABS
  ═══════════════════════════════════════════════════════════ */
  function initFilters() {
    const tabs = document.querySelectorAll('.oec-tab-btn[data-filter]');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        currentFilter = tab.getAttribute('data-filter');
        renderChallenges(currentFilter);
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     RESET PROGRESS
  ═══════════════════════════════════════════════════════════ */
  function initResetButton() {
    const btn = document.getElementById('resetProgressBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (!confirm('Bạn có chắc muốn xóa toàn bộ tiến độ thử thách và nhật ký? Hành động này không thể hoàn tác.')) return;
      localStorage.removeItem(LS_PROGRESS);
      localStorage.removeItem(LS_POINTS);
      localStorage.removeItem(LS_LOG);

      currentFilter = 'all';
      document.querySelectorAll('.oec-tab-btn[data-filter]').forEach((t) => {
        t.classList.toggle('active', t.getAttribute('data-filter') === 'all');
        t.setAttribute('aria-selected', t.getAttribute('data-filter') === 'all' ? 'true' : 'false');
      });

      renderChallenges('all');
      updateKPIBar({});
      renderTimeline();

      if (typeof window.showToast === 'function') {
        window.showToast('🔄 Đã reset toàn bộ tiến độ thử thách.', 'warning');
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     AI ANALYSIS — 6 STEPS
  ═══════════════════════════════════════════════════════════ */
  const AI_CONFIG = {
    avgBuilding: 9.5, // kWh/day building average
    thresholds: { good: 8, warn: 12 },
    actions: {
      'Điều hòa': [
        'Đặt nhiệt độ điều hòa 25–26°C thay vì 22°C để giảm ~15% điện.',
        'Tắt điều hòa trước khi ra về 15 phút — phòng vẫn mát trong thời gian ngắn.',
        'Vệ sinh lưới lọc điều hòa định kỳ mỗi 2 tuần để duy trì hiệu suất tối ưu.'
      ],
      'Máy tính': [
        'Bật chế độ Sleep sau 5 phút không sử dụng — tiết kiệm ~80% điện màn hình.',
        'Tắt máy tính hoàn toàn khi ra về thay vì để chế độ Standby.',
        'Giảm độ sáng màn hình xuống 60–70% để tiết kiệm ~10% tiêu thụ.'
      ],
      'Đèn': [
        'Tắt đèn khi rời phòng hơn 10 phút — hành động đơn giản nhất tiết kiệm điện.',
        'Tận dụng ánh sáng tự nhiên ban ngày bằng cách kéo rèm cửa.',
        'Thay bóng đèn thường bằng LED tiết kiệm tới 80% năng lượng chiếu sáng.'
      ],
      'default': [
        'Kiểm tra các thiết bị cắm điện không cần thiết và rút phích khi không dùng.',
        'Lên lịch sử dụng thiết bị tiêu thụ cao (máy in, máy pha cà phê) vào giờ thấp điểm.',
        'Theo dõi tiêu thụ điện hàng ngày qua hệ thống SmartBuilding để phát hiện bất thường.'
      ]
    }
  };

  function runAIAnalysis(kwh, device) {
    const avg  = AI_CONFIG.avgBuilding;
    const diff = ((kwh - avg) / avg * 100).toFixed(1);
    const absDiff = Math.abs(diff);

    let level, levelClass, levelIcon, levelDetail, confidence, explain;

    if (kwh <= AI_CONFIG.thresholds.good) {
      level      = 'Tốt — Tiêu thụ thấp hơn mức trung bình';
      levelClass = 'level-good';
      levelIcon  = '✅';
      levelDetail = `${kwh} kWh hôm nay — thấp hơn trung bình tòa nhà ${absDiff}%`;
      confidence  = 91;
      explain     = `Mức tiêu thụ của bạn (${kwh} kWh) thấp hơn ${absDiff}% so với trung bình toàn tòa nhà (${avg} kWh/ngày). AI nhận thấy hành vi sử dụng năng lượng của bạn đang trong vùng lý tưởng — tiếp tục duy trì!`;
    } else if (kwh <= AI_CONFIG.thresholds.warn) {
      level      = 'Cảnh báo — Tiêu thụ trên mức trung bình';
      levelClass = 'level-warn';
      levelIcon  = '⚠️';
      levelDetail = `${kwh} kWh hôm nay — cao hơn trung bình tòa nhà ${absDiff}%`;
      confidence  = 85;
      explain     = `Mức tiêu thụ của bạn (${kwh} kWh) cao hơn ${absDiff}% so với trung bình tòa nhà (${avg} kWh/ngày). AI phát hiện nguy cơ vượt ngưỡng mục tiêu tháng nếu duy trì xu hướng này.`;
    } else {
      level      = 'Vượt ngưỡng — Tiêu thụ rất cao';
      levelClass = 'level-over';
      levelIcon  = '🔴';
      levelDetail = `${kwh} kWh hôm nay — cao hơn trung bình tòa nhà ${absDiff}%`;
      confidence  = 95;
      explain     = `Mức tiêu thụ của bạn (${kwh} kWh) vượt ngưỡng cảnh báo ${absDiff}% so với trung bình tòa nhà (${avg} kWh/ngày). AI khuyến nghị thực hiện ngay các biện pháp giảm tải để tránh phát sinh chi phí phụ trội.`;
    }

    const deviceKey = device && AI_CONFIG.actions[device] ? device : 'default';
    const actions   = AI_CONFIG.actions[deviceKey];

    return { level, levelClass, levelIcon, levelDetail, confidence, explain, actions, kwh, device };
  }

  function showAIResult(result) {
    const el = (id) => document.getElementById(id);

    const card = el('aiLevelCard');
    card.className = `oec-ai-level-card ${result.levelClass}`;
    el('aiLevelIcon').textContent   = result.levelIcon;
    el('aiLevelName').textContent   = result.level;
    el('aiLevelDetail').textContent = result.levelDetail;

    const list = el('aiActionsList');
    list.replaceChildren();
    result.actions.forEach((action) => {
      const li = document.createElement('li');
      li.textContent = action;
      list.appendChild(li);
    });

    el('aiExplainText').textContent   = result.explain;
    el('aiConfidencePct').textContent = result.confidence + '%';
    const confBar = el('aiConfidenceBar');
    confBar.style.width = result.confidence + '%';
    confBar.setAttribute('aria-valuenow', result.confidence);

    el('aiSpinner').classList.remove('active');
    el('aiResult').classList.add('active');

    // Store result for commit
    el('aiResult').dataset.kwh    = result.kwh;
    el('aiResult').dataset.device = result.device || '';
    el('aiResult').dataset.level  = result.levelClass;
  }

  function resetAIToInput() {
    const el = (id) => document.getElementById(id);
    el('aiSpinner').classList.remove('active');
    el('aiResult').classList.remove('active');
    el('aiFailState').classList.remove('active');
    el('aiInputStep').style.display = '';
  }

  function initAI() {
    const form      = document.getElementById('aiForm');
    const spinner   = document.getElementById('aiSpinner');
    const result    = document.getElementById('aiResult');
    const failState = document.getElementById('aiFailState');
    const inputStep = document.getElementById('aiInputStep');

    if (!form) return;

    form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const kwh    = parseFloat(document.getElementById('aiKwhInput').value);
      const device = document.getElementById('aiDeviceSelect').value;

      // AI Failure UX — empty or 0
      if (!kwh || kwh <= 0) {
        failState.classList.add('active');
        return;
      }

      failState.classList.remove('active');
      result.classList.remove('active');
      inputStep.style.display = 'none';
      spinner.classList.add('active');

      // Step 2: Processing
      setTimeout(() => {
        const analysis = runAIAnalysis(kwh, device);
        showAIResult(analysis);
      }, AI_DELAY);
    });

    // Prompt chips
    document.querySelectorAll('.oec-chip[data-kwh]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const kwhInput = document.getElementById('aiKwhInput');
        if (kwhInput) kwhInput.value = chip.getAttribute('data-kwh');
        failState.classList.remove('active');
      });
    });

    // Step 6: Commit
    const commitBtn = document.getElementById('aiCommitBtn');
    if (commitBtn) {
      commitBtn.addEventListener('click', () => {
        const kwh    = parseFloat(result.dataset.kwh || '0');
        const device = result.dataset.device || '';
        const label  = document.getElementById('aiLevelName').textContent || 'Gợi ý AI';

        // Add dynamic challenge to localStorage & data
        const aiChId = 'AI_' + Date.now();
        const aiCh   = {
          id: aiChId,
          icon: '🤖',
          iconClass: 'icon-blue',
          title: `Cam kết AI: ${device || 'Tiết kiệm tổng hợp'}`,
          description: `Thực hiện 3 hành động gợi ý từ AI dựa trên mức ${kwh} kWh hôm nay (${label}).`,
          points: 25,
          kwhSave: Math.round(kwh * 0.15 * 10) / 10,
          duration: '1 ngày',
          difficulty: 'Dễ',
          category: 'AI Gợi ý'
        };

        CHALLENGES_DATA.push(aiCh);

        const progress = loadProgress();
        progress[aiChId] = 'inprogress';
        saveProgress(progress);

        addLogEntry(`Cam kết AI: "${aiCh.title}" (+${aiCh.points} điểm dự kiến)`, 'join');
        renderChallenges(currentFilter);
        updateKPIBar(progress);
        renderTimeline();

        if (typeof window.showToast === 'function') {
          window.showToast(`🤖 Đã cam kết thực hiện gợi ý AI! +${aiCh.points} điểm dự kiến`, 'success');
        }

        resetAIToInput();
        document.getElementById('aiKwhInput').value  = '';
        document.getElementById('aiDeviceSelect').value = '';
      });
    }

    // Edit
    const editBtn = document.getElementById('aiEditBtn');
    if (editBtn) {
      editBtn.addEventListener('click', () => resetAIToInput());
    }

    // Skip
    const skipBtn = document.getElementById('aiSkipBtn');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        resetAIToInput();
        document.getElementById('aiKwhInput').value  = '';
        document.getElementById('aiDeviceSelect').value = '';
      });
    }

    // Retry (re-analyze with same data)
    const retryBtn = document.getElementById('aiRetryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        const kwh    = parseFloat(result.dataset.kwh || '0');
        const device = result.dataset.device || '';
        result.classList.remove('active');
        spinner.classList.add('active');
        setTimeout(() => {
          const analysis = runAIAnalysis(kwh, device);
          showAIResult(analysis);
        }, AI_DELAY);
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════
     RETRY LOAD BUTTON
  ═══════════════════════════════════════════════════════════ */
  function initRetryButton() {
    const btn = document.getElementById('retryLoadBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      document.getElementById('challengeError').style.display = 'none';
      startLoading();
    });
  }

  /* ═══════════════════════════════════════════════════════════
     INITIAL LOAD WITH SKELETON
  ═══════════════════════════════════════════════════════════ */
  function startLoading() {
    const skeleton = document.getElementById('challengeSkeleton');
    const grid     = document.getElementById('challengeGrid');

    if (skeleton) skeleton.style.display = 'grid';
    if (grid)     grid.style.display     = 'none';

    setTimeout(() => {
      if (skeleton) skeleton.style.display = 'none';
      const progress = loadProgress();
      renderChallenges('all');
      updateKPIBar(progress);
      renderTimeline();
    }, LOADING_DELAY);
  }

  /* ═══════════════════════════════════════════════════════════
     BOOT
  ═══════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    initResetButton();
    initRetryButton();
    initAI();
    startLoading();
  });
})();
