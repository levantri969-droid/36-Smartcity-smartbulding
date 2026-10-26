/**
 * CSE122 - BTL-36 SmartBuilding
 * js/operator-saving-actions.js
 * 1. Modal tao Task tu goi y AI
 * 2. Nhan giu chuot trai + keo trai/phai de chinh phan tram % tien do
 * 3. Nut XOA tren moi task
 * 4. Luu tasks moi vao localStorage
 */
(function () {
  'use strict';
  var STORE  = 'smartbuilding_saving_tasks_v2';
  var STEP   = 10; // moi 10px keo doi 10%
  function $(id) { return document.getElementById(id); }
  function all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function load() { try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch (e) { return []; } }
  function save(v) { try { localStorage.setItem(STORE, JSON.stringify(v)); } catch (e) {} }
  function toast(msg, ok) {
    var b = $('toast'); if (!b) return;
    b.textContent = msg;
    b.className = 'toast show ' + (ok === false ? 'toast-error' : 'toast-ok');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { b.classList.remove('show'); }, 2400);
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function statusHtml(p) {
    return p >= 100
      ? '<span class="st st-done"><i></i>Hoàn thành</span>'
      : '<span class="st"><i></i>Đang thực hiện</span>';
  }
  function statusCardHtml(p) {
    return p >= 100
      ? '<span class="st st-done"><i></i>Hoàn thành</span>'
      : '<span class="st"><i></i>Đang thực hiện</span>';
  }
  function getEl(id) {
    var row  = document.querySelector('#taskTableBody tr[data-id="' + id + '"]');
    var card = document.querySelector('#taskCards .task-card[data-id="' + id + '"]');
    return { row: row, card: card };
  }
  function getProgress(id) {
    var el  = getEl(id);
    var raw = (el.row && el.row.getAttribute('data-progress')) || (el.card && el.card.getAttribute('data-progress')) || '0';
    var n   = parseInt(raw, 10);
    return isNaN(n) ? 0 : n;
  }
  // Cap nhat tien do tren ca bang (table) va card (mobile)
  function updateProgress(id, value, persist) {
    var p  = Math.max(0, Math.min(100, Math.round(value)));
    var el = getEl(id);
    [el.row, el.card].forEach(function (node) {
      if (!node) return;
      node.setAttribute('data-progress', String(p));
      var fill = node.querySelector('.prog-fill');
      if (fill) fill.style.width = p + '%';
      var pct = node.querySelector('.prog-pct');
      if (pct && !pct.querySelector('.progress-edit-input')) pct.textContent = p + '%';
    });
    if (el.row) { var st = el.row.querySelector('.st'); if (st) st.outerHTML = statusHtml(p); }
    if (el.card) { var cs = el.card.querySelector('.st'); if (cs) cs.outerHTML = statusCardHtml(p); }
    if (persist !== false) {
      var list = load();
      list.forEach(function (t) { if (t.id === id) t.progress = p; });
      save(list);
    }
    return p;
  }
  function checkEmpty() {
    var list      = load();
    var empty     = $('taskEmpty');
    var cardTable = document.querySelector('.task-table-card');
    var taskCards = document.querySelector('.task-cards');
    if (empty) {
      empty.style.display = (list.length === 0) ? 'block' : 'none';
    }
    if (list.length === 0) {
      if (cardTable) cardTable.style.display = 'none';
      if (taskCards) taskCards.style.display = 'none';
    } else {
      if (cardTable) cardTable.style.display = '';
      if (taskCards) taskCards.style.display = '';
    }
  }
  function persistDelete(id) {
    var list = load();
    save(list.filter(function (t) { return t.id !== id; }));
    checkEmpty();
  }
  // ======== Keo chuot / cham de chinh % tien do ========
  var drag = null;
  function onDragMove(e) {
    if (!drag) return;
    if (e.preventDefault) e.preventDefault();
    var delta = e.clientX - drag.startX;
    var steps = Math.round(delta / STEP);
    var next = drag.startProgress + steps * STEP;
    next = Math.max(0, Math.min(100, next));
    if (next !== drag.current) {
      drag.current = next;
      drag.moved = true;
      updateProgress(drag.id, next, false);
    }
  }
  function onTouchMove(e) {
    if (!drag || !e.touches || !e.touches[0]) return;
    onDragMove({ clientX: e.touches[0].clientX, preventDefault: function () { e.preventDefault(); } });
  }
  function onDragEnd() {
    if (!drag) return;
    var d = drag;
    drag = null;
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onDragEnd);
    document.body.classList.remove('is-dragging-progress');
    if (d.target) d.target.classList.remove('dragging');
    updateProgress(d.id, d.current);
    if (d.moved) {
      lastDragEnd = Date.now();
      toast('Tiến độ Task ' + d.id + ': ' + d.current + '%', true);
    }
  }
  function startDrag(e, id, pctEl) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    var start = getProgress(id);
    drag = { id: id, startX: e.clientX, startProgress: start, current: start, target: pctEl, moved: false };
    if (pctEl) pctEl.classList.add('dragging');
    document.body.classList.add('is-dragging-progress');
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
  }
  // ======== Xoa task ========
  function deleteTask(id) {
    var el = getEl(id);
    if (el.row) el.row.remove();
    if (el.card) el.card.remove();
    persistDelete(id);
    toast('Đã xóa Task ' + id, true);
  }
  // ======== Sua tien do bang input ========
  function createProgressEditor(id, currentProgress) {
    var input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = '100';
    input.value = currentProgress;
    input.className = 'progress-edit-input';
    input.dataset.id = id;
    input.style.width = '48px';
    input.style.textAlign = 'center';
    input.style.marginLeft = '4px';
    input.style.padding = '2px 4px';
    input.style.fontSize = '12px';
    input.style.border = '1px solid var(--primary-green)';
    input.style.borderRadius = '4px';
    return input;
  }
  function editProgress(id, currentProgress, targetPctEl) {
    var el = getEl(id);
    var input = createProgressEditor(id, currentProgress);
    var existing = document.querySelector('.progress-edit-input');
    if (existing) existing.remove();
    var pctCell = targetPctEl || (el.row ? el.row.querySelector('.prog-pct') : (el.card ? el.card.querySelector('.prog-pct') : null));
    if (!pctCell) return;
    pctCell.innerHTML = '';
    pctCell.appendChild(input);
    input.focus();
    input.select();

    function cleanup() {
      input.removeEventListener('blur', saveProgress);
      input.removeEventListener('keydown', onKeyDown);
    }

    function saveProgress() {
      cleanup();
      if (!input.parentNode) return;
      var newVal = parseInt(input.value, 10);
      if (isNaN(newVal)) newVal = currentProgress;
      newVal = Math.max(0, Math.min(100, newVal));
      updateProgress(id, newVal);
      var rowPct = el.row ? el.row.querySelector('.prog-pct') : null;
      var cardPct = el.card ? el.card.querySelector('.prog-pct') : null;
      if (rowPct) rowPct.textContent = newVal + '%';
      if (cardPct) cardPct.textContent = newVal + '%';
      toast('Đã cập nhật tiến độ ' + newVal + '% cho Task ' + id, true);
      if (input.parentNode) input.remove();
    }

    function cancelEdit() {
      cleanup();
      if (!input.parentNode) return;
      input.remove();
      var rowPct = el.row ? el.row.querySelector('.prog-pct') : null;
      var cardPct = el.card ? el.card.querySelector('.prog-pct') : null;
      var keep = currentProgress + '%';
      if (rowPct) rowPct.textContent = keep;
      if (cardPct) cardPct.textContent = keep;
    }

    function onKeyDown(e) {
      if (e.key === 'Enter') { e.preventDefault(); saveProgress(); }
      if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
    }

    input.addEventListener('keydown', onKeyDown);
    input.addEventListener('blur', saveProgress);
  }
  // ======== Ve bang va card ========
  function deleteBtnHtml() {
    return '<button type="button" class="task-delete-btn" title="Xóa task" aria-label="Xóa task">×</button>';
  }
  function progHtml(p) {
    return '<div class="prog-wrap"><div class="prog-track"><div class="prog-fill" style="width:' + p + '%"></div></div>'
      + '<span class="prog-pct" title="Nhấn giữ và kéo trái/phải để đổi tiến độ, hoặc nhấp để nhập %">' + p + '%</span></div>';
  }
  function bindProgress(el, id) {
    var wrap = el.querySelector('.prog-wrap');
    if (!wrap) return;
    wrap.addEventListener('mousedown', function (e) {
      if (e.target && e.target.classList && e.target.classList.contains('progress-edit-input')) return;
      var pct = wrap.querySelector('.prog-pct');
      if (!pct) return;
      startDrag(e, id, pct);
    });
    wrap.addEventListener('touchstart', function (e) {
      if (!e.touches || e.touches.length !== 1) return;
      if (e.target && e.target.classList && e.target.classList.contains('progress-edit-input')) return;
      var pct = wrap.querySelector('.prog-pct');
      startDrag({ clientX: e.touches[0].clientX, preventDefault: function () { e.preventDefault(); } }, id, pct);
    }, { passive: false });
    wrap.addEventListener('click', function (e) {
      if (Date.now() - lastDragEnd < 300) return; // vua keo xong -> khong mo o nhap
      var t = e.target;
      if (t && (t.className === 'prog-pct' || (t.parentNode && t.parentNode.className === 'prog-pct'))) {
        e.stopPropagation();
        var pctEl = t.classList.contains('prog-pct') ? t : t.parentNode;
        editProgress(id, getProgress(id), pctEl);
      }
    });
  }
  var lastDragEnd = 0;
  function addTask(t) {
    var tb = $('taskTableBody');
    var tr = document.createElement('tr');
    tr.setAttribute('data-id', t.id);
    tr.setAttribute('data-progress', String(t.progress));
    tr.innerHTML = '<td class="mono">' + esc(t.id) + '</td>'
      + '<td class="content-cell">' + esc(t.content) + '</td>'
      + '<td class="tech-cell">' + esc(t.tech) + '</td>'
      + '<td class="deadline-cell">' + esc(t.deadline) + '</td>'
      + '<td>' + progHtml(t.progress) + '</td>'
      + '<td>' + statusHtml(t.progress) + '</td>'
      + '<td class="delete-cell">' + deleteBtnHtml() + '</td>';
    if (tb) tb.appendChild(tr);
    bindProgress(tr, t.id);
    bindDelete(tr, t.id);

    var cards = $('taskCards');
    var ac = document.createElement('article');
    ac.className = 'task-card'; ac.setAttribute('tabindex', '0');
    ac.setAttribute('data-id', t.id); ac.setAttribute('data-progress', String(t.progress));
    ac.innerHTML = '<div class="tc-top"><span class="tc-id">' + esc(t.id) + '</span>' + statusCardHtml(t.progress) + deleteBtnHtml() + '</div>'
      + '<div class="tc-title">' + esc(t.content) + '</div>'
      + '<div class="tc-sub">Phụ trách: ' + esc(t.tech) + ' • ' + esc(t.deadline) + '</div>'
      + progHtml(t.progress);
    if (cards) cards.appendChild(ac);
    bindProgress(ac, t.id);
    bindDelete(ac, t.id);
    checkEmpty();
  }
  function bindDelete(el, id) {
    var btn = el.querySelector('.task-delete-btn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      deleteTask(id);
    });
  }
  // ============================================================
  // MODULE AI-2 SAVING OPTIMIZER: CHUẨN 6 BƯỚC AI UX & FAILURE UX
  // ============================================================
  var AI_PRESETS = {
    'tang-3': {
      title: 'Tắt 50% đèn hành lang Tầng 3 sau 22:00',
      tech: 'Kỹ thuật điện',
      deadline: 'Hôm nay 22:00',
      savings: 120,
      confidence: 94,
      desc: 'Phân tích mật độ lưu thông sau 22:00 chỉ còn dưới 3 người/giờ. Giảm 50% công suất đèn chiếu sáng hành lang giúp cắt giảm 120 kWh/đêm mà vẫn đảm bảo an ninh.',
      explains: [
        'Cảm biến hiện diện PIR T3 ghi nhận mức rỗng 98.2% trong khung giờ 22:00 - 05:00.',
        'Phụ tải ánh sáng chiếu liên tục gây lãng phí khoảng 180.000 VNĐ mỗi đêm.',
        'Hành động không ảnh hưởng đến tiêu chuẩn PCCC và an toàn lối thoát hiểm.'
      ]
    },
    'tang-2': {
      title: 'Tăng nhiệt độ điều hòa Tầng 2 lên 26°C sau 18:00',
      tech: 'Đội HVAC',
      deadline: 'Ngày mai 18:00',
      savings: 85,
      confidence: 89,
      desc: 'Nhiệt độ ngoài trời giảm sau 18:00. Nâng setpoint từ 24°C lên 26°C tại khu văn phòng mở giúp giảm tải chiller 18% trong khi vẫn giữ tiện nghi văn phòng.',
      explains: [
        'Nhiệt độ môi trường dự báo ban đêm mát mẻ (25.5°C), không cần làm mát sâu.',
        'Nhân sự làm việc ngoài giờ chỉ tập trung ở khu vực góc đông nam.',
        'Giúp tòa nhà giảm nguy cơ vượt đỉnh công suất biểu giá giờ cao điểm.'
      ]
    },
    'server-room': {
      title: 'Cân bằng tải luồng khí làm mát Cold Aisle Server Room',
      tech: 'Đội HVAC',
      deadline: 'Trong tuần này',
      savings: 160,
      confidence: 96,
      desc: 'Cảm biến chênh lệch nhiệt độ cho thấy luồng khí lạnh bị phân tán. Điều chỉnh cánh gió baffle giúp giảm 1.5 kW công suất máy nén liên tục 24/7.',
      explains: [
        'Delta T giữa hot aisle và cold aisle hiện đạt 9.8°C (vượt định mức tối ưu 8.0°C).',
        'Tối ưu khí động học giúp tăng hiệu quả COP của cụm điều hòa phòng máy.',
        'Không rủi ro quá nhiệt máy chủ theo khuyến nghị chuẩn ASHRAE TC 9.9.'
      ]
    },
    'all-zones': {
      title: 'Kích hoạt kịch bản ngắt nguồn thiết bị dự phòng toàn tòa nhà',
      tech: 'Ban Quản lý Tòa nhà',
      deadline: 'Cuối tuần này',
      savings: 210,
      confidence: 91,
      desc: 'Thực hiện ngắt tải standby của bình nước nóng, màn hình quảng cáo và quạt thông gió hầm gửi xe trong các ngày nghỉ cuối tuần.',
      explains: [
        'Tải tiêu thụ nền cuối tuần chiếm 28% ngày thường (mức lãng phí cao).',
        'Lịch hoạt động văn phòng xác nhận 0 sự kiện lớn trong 48 giờ tới.',
        'Lợi ích tài chính ước tính cắt giảm hơn 500.000 VNĐ mỗi cuối tuần.'
      ]
    }
  };

  var currentAiPlan = AI_PRESETS['tang-3'];
  var aiSimulationTimer = null;

  function runAiAnalysis(isFailureForced) {
    var zoneVal = ($('aiTargetZone') && $('aiTargetZone').value) || 'tang-3';
    var isFailure = isFailureForced === true || zoneVal === 'unknown-zone';

    var procBox = $('aiProcessingState');
    var succBox = $('aiResultSuccess');
    var failBox = $('aiResultFailure');
    var pBar = $('aiProgressBar');
    var pStep = $('aiProcessingStep');

    if (succBox) succBox.style.display = 'none';
    if (failBox) failBox.style.display = 'none';
    if (procBox) procBox.style.display = 'flex';
    if (pBar) pBar.style.width = '10%';

    clearTimeout(aiSimulationTimer);

    // Mô phỏng 2 bước xử lý trực quan (Skeleton / Step)
    if (pStep) pStep.textContent = 'Bước 1/2: Đang quét dữ liệu chuỗi cảm biến thời gian thực...';

    aiSimulationTimer = setTimeout(function () {
      if (pBar) pBar.style.width = '65%';
      if (pStep) pStep.textContent = 'Bước 2/2: Đang chạy mô hình AI-2 Saving Optimizer & kiểm tra biên độ an toàn...';

      aiSimulationTimer = setTimeout(function () {
        if (pBar) pBar.style.width = '100%';
        if (procBox) procBox.style.display = 'none';

        if (isFailure) {
          // HIỂN THỊ KỊCH BẢN FAILURE / UNCERTAINTY UX
          if (failBox) failBox.style.display = 'block';
          toast('AI cảnh báo: Thiếu dữ liệu cảm biến (Độ tin cậy 42%)', false);
        } else {
          // HIỂN THỊ KỊCH BẢN THÀNH CÔNG ĐỦ 6 BƯỚC
          currentAiPlan = AI_PRESETS[zoneVal] || AI_PRESETS['tang-3'];
          renderAiSuccess(currentAiPlan);
          if (succBox) succBox.style.display = 'block';
          toast('AI đã phân tích xong với độ tin cậy ' + currentAiPlan.confidence + '%', true);
        }
      }, 500);
    }, 450);
  }

  function renderAiSuccess(plan) {
    if ($('aiResultTitle')) $('aiResultTitle').textContent = plan.title;
    if ($('aiConfidenceValue')) $('aiConfidenceValue').textContent = plan.confidence + '%';
    if ($('aiResultDesc')) $('aiResultDesc').textContent = plan.desc;

    var ul = $('aiExplainList');
    if (ul) {
      ul.innerHTML = '';
      (plan.explains || []).forEach(function (txt) {
        var li = document.createElement('li');
        li.textContent = txt;
        ul.appendChild(li);
      });
    }
  }

  function openEditAiModal() {
    var m = $('editAiModal');
    if (!m) return;
    if ($('aiEditTitle')) $('aiEditTitle').value = currentAiPlan.title;
    if ($('aiEditTech')) $('aiEditTech').value = currentAiPlan.tech;
    if ($('aiEditDeadline')) $('aiEditDeadline').value = currentAiPlan.deadline;
    if ($('aiEditSavings')) $('aiEditSavings').value = currentAiPlan.savings;
    m.classList.add('show');
    m.setAttribute('aria-hidden', 'false');
  }

  function closeEditAiModal() {
    var m = $('editAiModal');
    if (m) {
      m.classList.remove('show');
      m.setAttribute('aria-hidden', 'true');
    }
  }

  function applyAiPlanToTask(customPlan) {
    var plan = customPlan || currentAiPlan;
    var curList = load();
    var maxNum = 142;
    curList.forEach(function (t) {
      var m = /^TASK-(\d+)$/.exec(t.id);
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    });
    var id = 'TASK-' + (maxNum + 1);
    var t = {
      id: id,
      content: plan.title,
      tech: plan.tech,
      deadline: plan.deadline,
      progress: 0
    };
    curList.unshift(t);
    save(curList);

    // Cập nhật lại DOM bảng và cards
    var tb = $('taskTableBody');
    var cards = $('taskCards');
    if (tb) tb.innerHTML = '';
    if (cards) cards.innerHTML = '';
    curList.forEach(addTask);
    checkEmpty();

    toast('Đã duyệt gợi ý AI & Tạo mới ' + id + ' (Lưu thành công vào dữ liệu thật)', true);
  }

  function openModal() {
    var m = $('taskModal');
    if (m) {
      m.classList.add('show');
      m.setAttribute('aria-hidden', 'false');
      var f = $('fContent');
      if (f) {
        f.focus();
        f.select();
      }
    }
  }
  function closeModal() {
    var m = $('taskModal');
    if (m) {
      m.classList.remove('show');
      m.setAttribute('aria-hidden', 'true');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // 1. Neu localStorage trong (chua tung khoi tao), dua mac dinh 3 task tu HTML static
    if (localStorage.getItem(STORE) === null) {
      var defaultList = [
        { id: 'TASK-142', content: 'Giảm 50% đèn hành lang T3',       tech: 'Kỹ thuật điện', deadline: '18/10/2025', progress: 65 },
        { id: 'TASK-138', content: 'Điều chỉnh lịch Chiller 02',      tech: 'HVAC',           deadline: '15/10/2025', progress: 100 },
        { id: 'TASK-136', content: 'Kiểm tra timer biển hiệu',        tech: 'Kỹ thuật điện', deadline: '20/10/2025', progress: 30 }
      ];
      save(defaultList);
    }
    var list = load();
    // 2. Xoa task static cu trong HTML de tranh render trung lap
    var tb     = $('taskTableBody');
    var cards  = $('taskCards');
    if (tb) tb.innerHTML = '';
    if (cards) cards.innerHTML = '';
    // 3. Nap task tu localStorage
    list.forEach(addTask);
    checkEmpty();

    // 4. Modal tạo Task thủ công
    var c   = $('taskModalClose'); if (c) c.addEventListener('click', closeModal);
    var x   = $('taskModalCancel'); if (x) x.addEventListener('click', closeModal);
    var m   = $('taskModal'); if (m) m.addEventListener('click', function (e) { if (e.target === m) closeModal(); });

    var s = $('taskModalSubmit');
    if (s) s.addEventListener('click', function () {
      var content   = ($('fContent') && $('fContent').value.trim()) || 'Task tiết kiệm mới';
      var tech      = ($('fTech') && $('fTech').value.trim()) || 'Kỹ thuật điện';
      var deadline  = ($('fDeadline') && $('fDeadline').value.trim()) || '20/10/2025';
      var progress  = Math.max(0, Math.min(100, parseInt(($('fProgress') && $('fProgress').value) || '0', 10)));
      var curList   = load();
      var maxNum    = 142;
      curList.forEach(function (t) {
        var m = /^TASK-(\d+)$/.exec(t.id);
        if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
      });
      var id = 'TASK-' + (maxNum + 1);
      var t = { id: id, content: content, tech: tech, deadline: deadline, progress: progress };
      curList.unshift(t); save(curList);
      
      var tbEl = $('taskTableBody');
      var cdEl = $('taskCards');
      if (tbEl) tbEl.innerHTML = '';
      if (cdEl) cdEl.innerHTML = '';
      curList.forEach(addTask);
      checkEmpty();
      closeModal();
      toast('Đã tạo thủ công ' + id + ' giao ' + tech + '.', true);
    });

    // 5. GẮN SỰ KIỆN AI UX 6 BƯỚC & DEMO SWITCHER (Barem Tiêu chí 6)
    var btnModeNormal = $('btnModeNormal');
    var btnModeFailure = $('btnModeFailure');
    if (btnModeNormal && btnModeFailure) {
      btnModeNormal.addEventListener('click', function () {
        btnModeNormal.classList.add('active');
        btnModeFailure.classList.remove('active');
        if ($('aiTargetZone')) $('aiTargetZone').value = 'tang-3';
        runAiAnalysis(false);
      });
      btnModeFailure.addEventListener('click', function () {
        btnModeFailure.classList.add('active');
        btnModeNormal.classList.remove('active');
        if ($('aiTargetZone')) $('aiTargetZone').value = 'unknown-zone';
        runAiAnalysis(true);
      });
    }

    // Nút phân tích AI
    var btnAnalyze = $('btnAiAnalyze');
    if (btnAnalyze) {
      btnAnalyze.addEventListener('click', function () {
        var zoneVal = ($('aiTargetZone') && $('aiTargetZone').value) || '';
        runAiAnalysis(zoneVal === 'unknown-zone');
      });
    }

    // Bước 5 & 6: Chấp nhận -> Lưu vào dữ liệu thật (Save/Apply)
    var btnAccept = $('btnAiAccept');
    if (btnAccept) {
      btnAccept.addEventListener('click', function () {
        applyAiPlanToTask();
      });
    }

    // Bước 5: Chỉnh sửa trước khi lưu (User Control & Edit)
    var btnEdit = $('btnAiEdit');
    if (btnEdit) {
      btnEdit.addEventListener('click', openEditAiModal);
    }
    var closeAiEdit = $('editAiModalClose');
    if (closeAiEdit) closeAiEdit.addEventListener('click', closeEditAiModal);
    var cancelAiEdit = $('editAiModalCancel');
    if (cancelAiEdit) cancelAiEdit.addEventListener('click', closeEditAiModal);

    var saveAiEdit = $('editAiModalSave');
    if (saveAiEdit) {
      saveAiEdit.addEventListener('click', function () {
        var editedPlan = {
          title: ($('aiEditTitle') && $('aiEditTitle').value.trim()) || currentAiPlan.title,
          tech: ($('aiEditTech') && $('aiEditTech').value) || currentAiPlan.tech,
          deadline: ($('aiEditDeadline') && $('aiEditDeadline').value.trim()) || currentAiPlan.deadline,
          savings: ($('aiEditSavings') && $('aiEditSavings').value) || currentAiPlan.savings
        };
        closeEditAiModal();
        applyAiPlanToTask(editedPlan);
      });
    }

    // Nút từ chối gợi ý
    var btnReject = $('btnAiReject');
    if (btnReject) {
      btnReject.addEventListener('click', function () {
        if ($('aiResultSuccess')) $('aiResultSuccess').style.display = 'none';
        toast('Đã bỏ qua khuyến nghị hiện tại của AI.', true);
      });
    }

    // Nút đổi phương án khác (Regenerate)
    var btnRegen = $('btnAiRegenerate');
    if (btnRegen) {
      btnRegen.addEventListener('click', function () {
        var keys = ['tang-3', 'tang-2', 'server-room', 'all-zones'];
        var randomKey = keys[Math.floor(Math.random() * keys.length)];
        if ($('aiTargetZone')) $('aiTargetZone').value = randomKey;
        runAiAnalysis(false);
      });
    }

    // Kịch bản Failure: Nút thử lại & Nút nhập thủ công
    var btnRetry = $('btnAiRetry');
    if (btnRetry) {
      btnRetry.addEventListener('click', function () {
        toast('Đang thử kết nối lại hạ tầng Gateway IoT...', true);
        runAiAnalysis(true);
      });
    }
    var btnManual = $('btnAiManualCreate');
    if (btnManual) {
      btnManual.addEventListener('click', function () {
        openModal();
      });
    }

    // Xử lý các Prompt Chips trong kịch bản Failure
    all('.prompt-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var actionType = chip.getAttribute('data-fix');
        if (actionType === 'sensor') {
          toast('Đang mở chẩn đoán cảm biến... Khuyến nghị kiểm tra Gateway Tầng 21.', true);
        } else if (actionType === 'prev') {
          toast('Đã nạp dữ liệu định mức tháng trước: Phụ tải nền 45 kW.', true);
          if (btnModeNormal) btnModeNormal.click();
        } else if (actionType === 'manual') {
          openModal();
        }
      });
    });

    // Khởi tạo hiển thị AI ban đầu
    renderAiSuccess(currentAiPlan);

    // Escape chung để đóng modal
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeModal();
        closeEditAiModal();
      }
    });
  });
})();



