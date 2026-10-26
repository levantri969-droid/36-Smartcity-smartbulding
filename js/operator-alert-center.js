/**
 * CSE122 - BTL-36 SmartBuilding
 * js/operator-alert-center.js
 * Trang: Trung tam canh bao (Vanilla JS)
 * 1. Loc theo muc do (Khan cap / Trung binh / Thap)
 * 2. Tiep nhan / Bo qua tung alert (dong bo table + card)
 * 3. Tac vu hang loat + dem so canh bao mo
 * 4. Luu trang thai vao localStorage
 */
(function () {
  'use strict';
  var STORE         = 'smartbuilding_alert_center_v1';
  var OP_ENERGY_KEY = 'smartbuilding_operator_alert_ALT-T2-0200';

  function $(id) { return document.getElementById(id); }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function load() { try { return JSON.parse(localStorage.getItem(STORE) || '{}'); } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(STORE, JSON.stringify(s)); } catch (e) {} }

  var state = load();

  function toast(msg, ok) {
    var b = $('toast'); if (!b) return;
    b.textContent = msg;
    b.className = 'toast show ' + (ok === false ? 'toast-error' : 'toast-ok');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { b.classList.remove('show'); }, 2400);
  }

  /* Cập nhật giao diện cho tất cả element có data-id khớp */
  function applyStatus(id, status) {
    all('[data-id="' + id + '"]').forEach(function (el) {
      /* Badge trạng thái */
      var st = el.querySelector('.st');
      if (st) {
        if (status === 'done')    { st.className = 'st st-done';     st.innerHTML = '<i></i>Đã tiếp nhận'; }
        else if (status === 'skipped') { st.className = 'st st-skipped'; st.innerHTML = '<i></i>Đã bỏ qua'; }
        else                      { st.className = 'st st-pending';  st.innerHTML = '<i></i>Chờ xử lý'; }
      }

      /* Nút Tiếp nhận — disable khi đang là "done", luôn active ở trạng thái khác */
      var ack = el.querySelector('.btn-ack');
      if (ack) {
        ack.disabled = (status === 'done');
        ack.textContent = status === 'done'
          ? 'Đã tiếp nhận'
          : (el.classList.contains('alert-card') ? 'Tiếp nhận' : '✓ Tiếp nhận');
      }

      /* Nút Bỏ qua — disable khi đang là "skipped", luôn active ở trạng thái khác */
      var skip = el.querySelector('.btn-skip');
      if (skip) {
        skip.disabled = (status === 'skipped');
        skip.textContent = (status === 'skipped') ? 'Đã bỏ qua' : 'Bỏ qua';
      }
    });
  }

  /* Lưu + cập nhật + sync sang op-energy nếu cần */
  function setStatus(id, status) {
    state[id] = status;
    save(state);

    if (id === 'ALT-0284') {
      try {
        localStorage.setItem(OP_ENERGY_KEY, JSON.stringify({
          alertId: 'ALT-T2-0200',
          acked: (status === 'done'),
          at: new Date().toISOString()
        }));
      } catch (e) {}
    }

    applyStatus(id, status);
    updateSubtitle();
  }

  function updateSubtitle() {
    var open = 0, crit = 0;
    all('#alertTableBody tr').forEach(function (tr) {
      var id = tr.getAttribute('data-id');
      var s = state[id];
      if (!s || s === 'open') {
        open++;
        if (tr.getAttribute('data-sev') === 'critical') crit++;
      }
    });
    var sub = $('alertSubtitle');
    if (sub) sub.textContent = open + ' cảnh báo mở • ' + crit + ' cảnh báo khẩn cấp';
  }

  /* Lọc kết hợp đa tiêu chí: Từ khóa (debounce) + Mức độ (pills) + Trạng thái (select) */
  function applyFilter() {
    var onSevs = {};
    all('.filter-pill').forEach(function (p) {
      var f = p.getAttribute('data-filter');
      var isOn = p.classList.contains('is-on');
      onSevs[f] = isOn;
      p.setAttribute('aria-pressed', isOn ? 'true' : 'false');
    });

    var keyword = (($('alertSearchInput') && $('alertSearchInput').value) || '').trim().toLowerCase();
    var statusVal = ($('statusFilterSelect') && $('statusFilterSelect').value) || 'all';

    // Ẩn/hiện nút clear search
    var clearBtn = $('alertSearchClear');
    if (clearBtn) {
      clearBtn.style.display = keyword ? 'block' : 'none';
    }

    var totalRows = 0;
    var visible = 0;

    all('#alertTableBody tr').forEach(function (tr) {
      totalRows++;
      var sev = tr.getAttribute('data-sev');
      var id = tr.getAttribute('data-id');
      var currentStatus = state[id] || 'pending'; // mặc định nếu chưa lưu là pending
      var rowText = (tr.textContent || '').toLowerCase();

      var matchSev = !!onSevs[sev];
      var matchKeyword = !keyword || (rowText.indexOf(keyword) !== -1);
      var matchStatus = (statusVal === 'all') || (currentStatus === statusVal);

      var show = matchSev && matchKeyword && matchStatus;
      tr.classList.toggle('is-hidden', !show);
      if (show) visible++;
    });

    all('#alertCards .alert-card').forEach(function (card) {
      var sev = card.getAttribute('data-sev');
      var id = card.getAttribute('data-id');
      var currentStatus = state[id] || 'pending';
      var cardText = (card.textContent || '').toLowerCase();

      var matchSev = !!onSevs[sev];
      var matchKeyword = !keyword || (cardText.indexOf(keyword) !== -1);
      var matchStatus = (statusVal === 'all') || (currentStatus === statusVal);

      var show = matchSev && matchKeyword && matchStatus;
      card.classList.toggle('is-hidden', !show);
    });

    // Cập nhật bộ đếm X / Y kết quả (Live Mod Đề A3)
    var countBadge = $('alertResultCount');
    if (countBadge) {
      countBadge.textContent = 'Hiển thị ' + visible + ' / ' + totalRows + ' cảnh báo';
    }

    // Hiển thị Empty State card (Tiêu chí 2.3 & Live Mod D1)
    var empty = $('alertEmpty');
    var cardTable = document.querySelector('.alert-table-card');
    if (empty) {
      empty.style.display = (visible === 0) ? 'block' : 'none';
    }
    if (cardTable && window.innerWidth > 768) {
      cardTable.style.display = (visible === 0) ? 'none' : 'block';
    }
  }

  function resetAllFilters() {
    if ($('alertSearchInput')) $('alertSearchInput').value = '';
    if ($('statusFilterSelect')) $('statusFilterSelect').value = 'all';
    all('.filter-pill').forEach(function (p) {
      p.classList.add('is-on');
      p.classList.remove('is-off');
    });
    applyFilter();
    toast('Đã đưa tất cả bộ lọc về mặc định', true);
  }

  var searchDebounceTimer = null;

  document.addEventListener('DOMContentLoaded', function () {
    /* Sync trạng thái từ op-energy */
    try {
      var opEnergy = JSON.parse(localStorage.getItem(OP_ENERGY_KEY) || '{}');
      if (opEnergy && opEnergy.acked && !state['ALT-0284']) {
        state['ALT-0284'] = 'done';
        save(state);
      }
    } catch (e) {}

    /* Khởi tạo trạng thái UI từ localStorage */
    Object.keys(state).forEach(function (id) {
      if (state[id] && state[id] !== 'open') {
        applyStatus(id, state[id]);
      }
    });
    updateSubtitle();

    /* Bộ lọc Mức độ */
    all('.filter-pill').forEach(function (p) {
      p.addEventListener('click', function () {
        p.classList.toggle('is-on');
        p.classList.toggle('is-off');
        applyFilter();
      });
    });

    /* Tìm kiếm từ khóa kèm debounce 250ms (Tiêu chí 5.1 Barem) */
    var searchInput = $('alertSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(applyFilter, 250);
      });
    }

    var searchClearBtn = $('alertSearchClear');
    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', function () {
        if ($('alertSearchInput')) $('alertSearchInput').value = '';
        applyFilter();
        if ($('alertSearchInput')) $('alertSearchInput').focus();
      });
    }

    /* Bộ lọc Trạng thái (Select) */
    var statusSelect = $('statusFilterSelect');
    if (statusSelect) {
      statusSelect.addEventListener('change', applyFilter);
    }

    /* Nút Reset Filters trên thanh toolbar và trong Empty State (Live Mod A4 & D1) */
    var btnReset = $('btnResetFilters');
    if (btnReset) btnReset.addEventListener('click', resetAllFilters);

    var btnEmptyReset = $('btnEmptyReset');
    if (btnEmptyReset) btnEmptyReset.addEventListener('click', resetAllFilters);

    /* Nút Tiếp nhận từng dòng — dùng event delegation để tránh bind nhiều lần */
    document.addEventListener('click', function (e) {
      /* Tìm button gần nhất (kể cả khi click vào text bên trong button) */
      var ackBtn  = e.target.closest('.btn-ack');
      var skipBtn = e.target.closest('.btn-skip');

      /* Tiếp nhận — cho phép chuyển từ bất kỳ trạng thái nào sang "done" */
      if (ackBtn && !ackBtn.disabled) {
        var host = ackBtn.closest('[data-id]');
        if (!host) return;
        var id = host.getAttribute('data-id');
        setStatus(id, 'done');
        toast('Đã tiếp nhận cảnh báo ' + id + '.', true);
        return;
      }

      /* Bỏ qua — cho phép chuyển từ bất kỳ trạng thái nào sang "skipped" */
      if (skipBtn && !skipBtn.disabled) {
        var host2 = skipBtn.closest('[data-id]');
        if (!host2) return;
        var id2 = host2.getAttribute('data-id');
        setStatus(id2, 'skipped');
        toast('Đã bỏ qua cảnh báo ' + id2 + '.', true);
        return;
      }

      /* Tiếp nhận tất cả */
      if (e.target.closest('#bulkAckBtn')) {
        var n = 0;
        all('#alertTableBody tr:not(.is-hidden)').forEach(function (tr) {
          var id3 = tr.getAttribute('data-id');
          if (state[id3] !== 'done') { setStatus(id3, 'done'); n++; }
        });
        toast(n ? ('Đã tiếp nhận ' + n + ' cảnh báo.') : 'Tất cả cảnh báo đã được tiếp nhận.', !!n);
        return;
      }

      /* Bỏ qua tất cả — áp dụng cho tất cả (kể cả đã tiếp nhận) */
      if (e.target.closest('#bulkSkipBtn')) {
        var n2 = 0;
        all('#alertTableBody tr:not(.is-hidden)').forEach(function (tr) {
          var id4 = tr.getAttribute('data-id');
          if (state[id4] !== 'skipped') { setStatus(id4, 'skipped'); n2++; }
        });
        toast(n2 ? ('Đã bỏ qua ' + n2 + ' cảnh báo.') : 'Tất cả cảnh báo đã được bỏ qua.', !!n2);
        return;
      }
    });


    applyFilter();
  });
})();
